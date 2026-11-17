import rule from "../rules/no-swallowed-error.mjs";
import { ruleTester } from "./helpers.mjs";

ruleTester.run("no-swallowed-error", rule, {
  valid: [
    {
      name: "rethrow with cause",
      code: `try { f(); } catch (e) { throw new Error("x", { cause: e }); }`,
    },
    {
      name: "convert to err()",
      code: `function g() { try { return ok(f()); } catch (cause) { return err({ type: "x", cause }); } }`,
    },
    {
      name: "err() without binding",
      code: `function g() { try { return ok(f()); } catch { return err({ type: "x" }); } }`,
    },
    {
      name: "error is reported",
      code: `try { f(); } catch (e) { report(e); }`,
    },
    { name: ".catch handler uses error", code: `p.catch((e) => report(e));` },
    { name: ".catch with a function reference", code: `p.catch(report);` },
    {
      name: ".then rejection handler uses error",
      code: `p.then(ok, (cause) => err(cause));`,
    },
    { name: ".then without rejection handler", code: `p.then((v) => v);` },
  ],
  invalid: [
    {
      name: "empty catch",
      code: `try { f(); } catch (e) {}`,
      errors: [{ messageId: "empty" }],
    },
    {
      name: "empty catch without binding",
      code: `try { f(); } catch {}`,
      errors: [{ messageId: "empty" }],
    },
    {
      name: "fallback value drops error",
      code: `function g() { try { return f(); } catch { return undefined; } }`,
      errors: [{ messageId: "discarded" }],
    },
    {
      name: "unused binding",
      code: `try { f(); } catch (_e) { notify(); }`,
      errors: [{ messageId: "discarded" }],
    },
    {
      name: "use only inside nested function does not count as throw",
      code: `try { f(); } catch { later(() => { throw new Error(); }); }`,
      errors: [{ messageId: "discarded" }],
    },
    {
      name: "noop .catch",
      code: `p.catch(() => {});`,
      errors: [{ messageId: "discardedRejection" }],
    },
    {
      name: ".then rejection handler ignores error",
      code: `p.then(use, () => fallback);`,
      errors: [{ messageId: "discardedRejection" }],
    },
  ],
});
