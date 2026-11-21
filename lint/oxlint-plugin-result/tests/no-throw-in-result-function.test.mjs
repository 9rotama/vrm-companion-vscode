import rule from "../rules/no-throw-in-result-function.mjs";
import { ruleTester } from "./helpers.mjs";

ruleTester.run("no-throw-in-result-function", rule, {
  valid: [
    {
      name: "throw in a plain function",
      code: `function f(): number { throw new Error("invariant"); }`,
    },
    {
      name: "Result function returns err()",
      code: `function f(): Result<number, E> { return err({ type: "x" }); }`,
    },
    {
      name: "throw in a nested callback",
      code: `function f(): Result<number, E> { run(() => { throw new Error(); }); return ok(1); }`,
    },
    {
      name: "annotated non-Result function returning ok()",
      code: `function f(): unknown { if (a) throw new Error(); return ok(1); }`,
    },
  ],
  invalid: [
    {
      name: "annotated Result",
      code: `function f(x: number): Result<number, E> { if (x < 0) throw new Error("neg"); return ok(x); }`,
      errors: [{ messageId: "throwInResult" }],
    },
    {
      name: "annotated Promise<Result>",
      code: `async function f(): Promise<Result<number, E>> { throw new Error(); }`,
      errors: [{ messageId: "throwInResult" }],
    },
    {
      name: "inferred from return ok()",
      code: `const f = (x: number) => { if (x < 0) throw new Error(); return ok(x); };`,
      errors: [{ messageId: "throwInResult" }],
    },
    {
      name: "throw used as goto into catch",
      code: `async function f(p: string): Promise<Result<string, E>> { try { if (!p) throw new Error(); return ok(p); } catch (cause) { return err({ type: "x", cause }); } }`,
      errors: [{ messageId: "throwInResult" }],
    },
  ],
});
