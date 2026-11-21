import rule from "../rules/no-unused-result.mjs";
import { fixtureFile, ruleTester } from "./helpers.mjs";

ruleTester.run("no-unused-result", rule, {
  valid: [
    {
      name: "result is used",
      code: `function f(): Result<number, E> { return ok(1); } const r = f(); use(r);`,
    },
    {
      name: "explicit void discard",
      code: `function f(): Result<number, E> { return ok(1); } void f();`,
    },
    {
      name: "non-Result function",
      code: `function f(): number { return 1; } f();`,
    },
    {
      name: "non-Result import",
      code: `import { plain } from "./shared-like/config"; plain();`,
      filename: fixtureFile,
    },
    {
      name: "unresolvable import",
      code: `import { window } from "vscode"; window.show();`,
      filename: fixtureFile,
    },
  ],
  invalid: [
    {
      name: "annotated local function",
      code: `function f(): Result<number, E> { return ok(1); } f();`,
      errors: [{ messageId: "unusedResult", data: { name: "f" } }],
    },
    {
      name: "awaited Promise<Result>",
      code: `async function f(): Promise<Result<number, E>> { return ok(1); } async function g() { await f(); }`,
      errors: [{ messageId: "unusedResult" }],
    },
    {
      name: "inferred through another Result call",
      code: `function f(): Result<number, E> { return ok(1); } const g = () => f(); g();`,
      errors: [{ messageId: "unusedResult", data: { name: "g" } }],
    },
    {
      name: "method on this",
      code: `class A { load(): Result<number, E> { return ok(1); } run() { this.load(); } }`,
      errors: [{ messageId: "unusedResult", data: { name: "this.load" } }],
    },
    {
      name: "imported function (renamed re-export)",
      code: `import { loadConfig } from "./shared-like"; loadConfig(schema, input);`,
      filename: fixtureFile,
      errors: [{ messageId: "unusedResult", data: { name: "loadConfig" } }],
    },
    {
      name: "imported arrow returning Promise<Result>",
      code: `import { fetchConfig } from "./shared-like/config"; async function g() { await fetchConfig("u"); }`,
      filename: fixtureFile,
      errors: [{ messageId: "unusedResult" }],
    },
    {
      name: "bare ok() call",
      code: `ok(1);`,
      errors: [{ messageId: "unusedResult", data: { name: "ok" } }],
    },
  ],
});
