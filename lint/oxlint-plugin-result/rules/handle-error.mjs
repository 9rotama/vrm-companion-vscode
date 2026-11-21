import {
  calleeName,
  collectFunctionVisitors,
  createResultFunctionIndex,
  isResultType,
  unwrapExpression,
} from "../utils.mjs";

const NARROW_ONLY = new Set(["ok", "value"]);

function propertyName(member) {
  if (member.computed) return undefined;
  return member.property.type === "Identifier"
    ? member.property.name
    : undefined;
}

/** A reference that does not reach the error: `x.ok` or `x.value`. */
function isNarrowOnly(reference) {
  const id = reference.identifier;
  const parent = id.parent;
  return (
    parent?.type === "MemberExpression" &&
    parent.object === id &&
    NARROW_ONLY.has(propertyName(parent))
  );
}

/** @type {import("oxlint/plugins-dev").Rule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require the `ok: false` branch of a Result to be handled: read `.error`, or pass/return the Result itself.",
    },
    messages: {
      unhandled:
        "The error of Result `{{name}}` is never handled. Read `{{name}}.error` or propagate `{{name}}`.",
      unhandledPattern:
        "Destructuring this Result without `error` drops the failure case.",
    },
    schema: [],
  },
  create(context) {
    const index = createResultFunctionIndex(context.physicalFilename);
    const declarators = [];
    const params = [];
    return {
      ...collectFunctionVisitors(index),
      VariableDeclarator(node) {
        collectFunctionVisitors(index).VariableDeclarator(node);
        const call = unwrapExpression(node.init);
        if (call?.type === "CallExpression") declarators.push({ node, call });
      },
      "FunctionDeclaration, FunctionExpression, ArrowFunctionExpression"(node) {
        for (const param of node.params) {
          if (
            param.type === "Identifier" &&
            isResultType(param.typeAnnotation?.typeAnnotation)
          )
            params.push({ fn: node, param });
        }
      },
      "Program:exit"() {
        const names = index.resolve();
        const check = (scopeNode, name, reportNode) => {
          const variable = context.sourceCode
            .getDeclaredVariables(scopeNode)
            .find((candidate) => candidate.name === name);
          // The initializer is itself a (write) reference and says nothing about handling.
          const reads =
            variable?.references.filter((reference) => !reference.init) ?? [];
          if (reads.length === 0) return;
          if (reads.every(isNarrowOnly))
            context.report({
              node: reportNode,
              messageId: "unhandled",
              data: { name },
            });
        };
        for (const { node, call } of declarators) {
          if (!names.has(calleeName(call))) continue;
          if (node.id.type === "Identifier") {
            check(node, node.id.name, node.id);
          } else if (
            node.id.type === "ObjectPattern" &&
            !node.id.properties.some(
              (property) =>
                property.type === "RestElement" ||
                (property.key?.type === "Identifier" &&
                  property.key.name === "error"),
            )
          ) {
            context.report({ node: node.id, messageId: "unhandledPattern" });
          }
        }
        for (const { fn, param } of params) check(fn, param.name, param);
      },
    };
  },
};
