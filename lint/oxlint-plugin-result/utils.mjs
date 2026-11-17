import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

export const OK_NAME = "ok";
export const ERR_NAME = "err";

const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export function isFunction(node) {
  return FUNCTION_TYPES.has(node?.type);
}

export function enclosingFunction(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (isFunction(current)) return current;
  }
  return undefined;
}

/** Visits descendants without entering nested functions; stops when `visit` returns true. */
export function someDescendant(root, visit) {
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node !== root && isFunction(node)) continue;
    if (visit(node)) return true;
    for (const key of Object.keys(node)) {
      if (key === "parent") continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) if (item?.type) stack.push(item);
      } else if (child?.type) {
        stack.push(child);
      }
    }
  }
  return false;
}

export function isCallTo(node, name) {
  return (
    node?.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === name
  );
}

export function containsThrowOrErr(body) {
  return someDescendant(
    body,
    (node) => node.type === "ThrowStatement" || isCallTo(node, ERR_NAME),
  );
}

export function unwrapExpression(node) {
  let current = node;
  while (
    current?.type === "AwaitExpression" ||
    current?.type === "ChainExpression" ||
    current?.type === "TSNonNullExpression" ||
    current?.type === "TSAsExpression" ||
    current?.type === "TSSatisfiesExpression"
  ) {
    current =
      current.type === "AwaitExpression"
        ? current.argument
        : current.expression;
  }
  return current;
}

function typeArgs(node) {
  return (node.typeArguments ?? node.typeParameters)?.params ?? [];
}

/** `Result<...>`, `Promise<Result<...>>` or `PromiseLike<Result<...>>`. */
export function isResultType(type) {
  if (type?.type !== "TSTypeReference" || type.typeName.type !== "Identifier")
    return false;
  const name = type.typeName.name;
  if (name === "Result") return true;
  if (name === "Promise" || name === "PromiseLike")
    return isResultType(typeArgs(type)[0]);
  return false;
}

export function hasResultAnnotation(fn) {
  return isResultType(fn.returnType?.typeAnnotation);
}

/** Expressions returned from `fn` itself (not from nested functions). */
export function returnedExpressions(fn) {
  if (fn.body.type !== "BlockStatement") return [fn.body];
  const results = [];
  someDescendant(fn.body, (node) => {
    if (node.type === "ReturnStatement" && node.argument)
      results.push(node.argument);
    return false;
  });
  return results;
}

export function calleeName(call) {
  const callee = call.callee;
  if (callee.type === "Identifier") return callee.name;
  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "ThisExpression" &&
    callee.property.type === "Identifier"
  )
    return `this.${callee.property.name}`;
  return undefined;
}

/**
 * Collects the names of Result-returning functions visible in a file:
 * locally declared ones (annotated, or returning ok()/err()/another Result call)
 * and imports whose source file exports an annotated Result function.
 */
export function createResultFunctionIndex(filename) {
  const functions = new Map();
  const imports = new Map();
  return {
    addFunction(name, fn) {
      functions.set(name, fn);
    },
    addImport(local, source, imported) {
      imports.set(local, { source, imported });
    },
    resolve() {
      const names = new Set([OK_NAME, ERR_NAME]);
      for (const [local, { source, imported }] of imports) {
        if (exportedResultFunctions(filename, source).has(imported))
          names.add(local);
      }
      for (const [name, fn] of functions) {
        if (hasResultAnnotation(fn)) names.add(name);
      }
      let changed = true;
      while (changed) {
        changed = false;
        for (const [name, fn] of functions) {
          if (names.has(name) || fn.returnType) continue;
          const returnsResult = returnedExpressions(fn).some((expression) => {
            const call = unwrapExpression(expression);
            return (
              call?.type === "CallExpression" && names.has(calleeName(call))
            );
          });
          if (returnsResult) {
            names.add(name);
            changed = true;
          }
        }
      }
      return names;
    },
  };
}

export function collectFunctionVisitors(index) {
  return {
    FunctionDeclaration(node) {
      if (node.id) index.addFunction(node.id.name, node);
    },
    VariableDeclarator(node) {
      if (node.id.type === "Identifier" && isFunction(node.init))
        index.addFunction(node.id.name, node.init);
    },
    MethodDefinition(node) {
      if (node.key.type === "Identifier")
        index.addFunction(`this.${node.key.name}`, node.value);
    },
    ImportDeclaration(node) {
      for (const specifier of node.specifiers) {
        if (specifier.type !== "ImportSpecifier") continue;
        const imported =
          specifier.imported.type === "Identifier"
            ? specifier.imported.name
            : specifier.imported.value;
        index.addImport(specifier.local.name, node.source.value, imported);
      }
    },
  };
}

// --- cross-file lookup -------------------------------------------------------
// JS plugins cannot see types (oxlint limitation), so exported signatures are read from source text.

const exportCache = new Map();
const EXTENSIONS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

function resolveModule(fromFile, specifier) {
  if (specifier.startsWith(".")) {
    const base = resolve(dirname(fromFile), specifier);
    for (const extension of EXTENSIONS) {
      const candidate = base + extension;
      if (existsSync(candidate) && statSync(candidate).isFile())
        return candidate;
    }
    return undefined;
  }
  try {
    const resolved = realpathSync(createRequire(fromFile).resolve(specifier));
    return /\.tsx?$/.test(resolved) && !resolved.includes("node_modules")
      ? resolved
      : undefined;
    // oxlint-disable-next-line result/no-swallowed-error -- unresolvable modules (e.g. `vscode`) just mean "unknown", and lint must not fail on them
  } catch {
    return undefined;
  }
}

function exportedResultFunctions(fromFile, specifier) {
  const file = resolveModule(fromFile, specifier);
  return file ? scanExports(file, new Set()) : new Set();
}

function scanExports(file, visiting) {
  const cached = exportCache.get(file);
  const mtime = statSync(file).mtimeMs;
  if (cached && cached.mtime === mtime) return cached.names;
  if (visiting.has(file)) return new Set();
  visiting.add(file);

  const text = readFileSync(file, "utf8");
  const names = new Set();
  for (const match of text.matchAll(
    /export\s+(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/g,
  )) {
    const type = returnTypeAfter(text, match.index + match[0].length, "{");
    if (type && isResultTypeText(type)) names.add(match[1]);
  }
  for (const match of text.matchAll(
    /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?/g,
  )) {
    const type = returnTypeAfter(text, match.index + match[0].length, "=>");
    if (type && isResultTypeText(type)) names.add(match[1]);
  }
  for (const match of text.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
    const target = resolveModule(file, match[1]);
    if (target)
      for (const name of scanExports(target, visiting)) names.add(name);
  }
  for (const match of text.matchAll(
    /export\s*\{([^}]*)\}\s*from\s+["']([^"']+)["']/g,
  )) {
    const target = resolveModule(file, match[2]);
    if (!target) continue;
    const exported = scanExports(target, visiting);
    for (const part of match[1].split(",")) {
      const [original, alias] = part.trim().split(/\s+as\s+/);
      if (original && exported.has(original)) names.add(alias ?? original);
    }
  }
  exportCache.set(file, { mtime, names });
  return names;
}

/** Skips optional type parameters and the parameter list, then returns the return type text. */
function returnTypeAfter(text, start, terminator) {
  let i = skipWhitespace(text, start);
  if (text[i] === "<") i = skipBalanced(text, i, "<", ">");
  i = skipWhitespace(text, i);
  if (text[i] !== "(") return undefined;
  i = skipBalanced(text, i, "(", ")");
  i = skipWhitespace(text, i);
  if (text[i] !== ":") return undefined;
  const end = text.indexOf(terminator, i);
  return end === -1 ? undefined : text.slice(i + 1, end).trim();
}

function isResultTypeText(type) {
  return /^(?:(?:Promise|PromiseLike)\s*<\s*)?Result\s*</.test(type);
}

function skipWhitespace(text, i) {
  while (i < text.length && /\s/.test(text[i])) i++;
  return i;
}

function skipBalanced(text, i, open, close) {
  let depth = 0;
  for (; i < text.length; i++) {
    // `=>` inside a parameter type must not close a `<`.
    if (text[i] === ">" && text[i - 1] === "=") continue;
    if (text[i] === open) depth++;
    else if (text[i] === close && --depth === 0) return i + 1;
  }
  return i;
}
