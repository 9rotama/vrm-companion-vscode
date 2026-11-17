import rule from "../rules/handle-error.mjs";
import { fixtureFile, ruleTester } from "./helpers.mjs";

const decl = `function load(): Result<number, E> { return ok(1); }`;

ruleTester.run("handle-error", rule, {
  valid: [
    {
      name: "error is read",
      code: `${decl} const r = load(); if (r.ok) use(r.value); else report(r.error);`,
    },
    {
      name: "early return reads error",
      code: `${decl} function g() { const r = load(); if (!r.ok) return report(r.error); use(r.value); }`,
    },
    {
      name: "Result is propagated",
      code: `${decl} function g() { const r = load(); if (!r.ok) return r; return ok(r.value + 1); }`,
    },
    {
      name: "Result is passed on",
      code: `${decl} const r = load(); handle(r);`,
    },
    {
      name: "destructuring includes error",
      code: `${decl} const { ok: isOk, error } = load(); use(isOk, error);`,
    },
    {
      name: "non-Result object with ok",
      code: `const res = fetchIt(); if (res.ok) use(res.status);`,
    },
    {
      name: "annotated param with error handled",
      code: `function g(r: Result<number, E>) { return r.ok ? r.value : fail(r.error); }`,
    },
  ],
  invalid: [
    {
      name: "silent early return",
      code: `${decl} function g() { const r = load(); if (!r.ok) return; use(r.value); }`,
      errors: [{ messageId: "unhandled", data: { name: "r" } }],
    },
    {
      name: "if without else",
      code: `${decl} const r = load(); if (r.ok) use(r.value);`,
      errors: [{ messageId: "unhandled" }],
    },
    {
      name: "fallback ternary",
      code: `${decl} const r = load(); const v = r.ok ? r.value : 0;`,
      errors: [{ messageId: "unhandled" }],
    },
    {
      name: "awaited imported Result",
      code: `import { fetchConfig } from "./shared-like/config"; async function g() { const r = await fetchConfig("u"); if (r.ok) use(r.value); }`,
      filename: fixtureFile,
      errors: [{ messageId: "unhandled" }],
    },
    {
      name: "destructuring without error",
      code: `${decl} const { ok: isOk, value } = load();`,
      errors: [{ messageId: "unhandledPattern" }],
    },
    {
      name: "annotated param",
      code: `function g(r: Result<number, E>) { if (r.ok) use(r.value); }`,
      errors: [{ messageId: "unhandled" }],
    },
  ],
});
