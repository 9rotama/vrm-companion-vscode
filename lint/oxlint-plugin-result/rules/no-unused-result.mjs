import {
  calleeName,
  collectFunctionVisitors,
  createResultFunctionIndex,
  unwrapExpression,
} from "../utils.mjs";

/** @type {import("oxlint/plugins-dev").Rule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow calling a Result-returning function as a statement and ignoring its Result. Use `void` to discard on purpose.",
    },
    messages: {
      unusedResult:
        "The Result returned by `{{name}}` is ignored. Handle it, return it, or discard it explicitly with `void`.",
    },
    schema: [],
  },
  create(context) {
    const index = createResultFunctionIndex(context.physicalFilename);
    const statements = [];
    return {
      ...collectFunctionVisitors(index),
      ExpressionStatement(node) {
        const call = unwrapExpression(node.expression);
        if (call?.type === "CallExpression") statements.push(call);
      },
      "Program:exit"() {
        const names = index.resolve();
        for (const call of statements) {
          const name = calleeName(call);
          if (name && names.has(name))
            context.report({
              node: call,
              messageId: "unusedResult",
              data: { name },
            });
        }
      },
    };
  },
};
