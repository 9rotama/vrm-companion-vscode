import { containsThrowOrErr, isFunction } from "../utils.mjs";

function isUsed(context, scopeNode, param) {
  if (param.type !== "Identifier") return true;
  const variable = context.sourceCode
    .getDeclaredVariables(scopeNode)
    .find((candidate) => candidate.name === param.name);
  return (variable?.references.length ?? 0) > 0;
}

function rejectionHandler(call) {
  const callee = call.callee;
  if (callee.type !== "MemberExpression" || callee.computed) return undefined;
  if (callee.property.name === "catch") return call.arguments[0];
  if (callee.property.name === "then") return call.arguments[1];
  return undefined;
}

/** @type {import("oxlint/plugins-dev").Rule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow catch clauses and rejection handlers that discard the error instead of rethrowing it, converting it with err(), or using it.",
    },
    messages: {
      empty:
        "Empty catch block swallows the error. Rethrow it or convert it with err().",
      discarded:
        "The caught error is discarded. Use it, rethrow it, or convert it with err().",
      discardedRejection:
        "This rejection handler discards the error. Use it, rethrow it, or convert it with err().",
    },
    schema: [],
  },
  create(context) {
    return {
      CatchClause(node) {
        if (node.body.body.length === 0) {
          context.report({ node, messageId: "empty" });
          return;
        }
        if (node.param && isUsed(context, node, node.param)) return;
        if (containsThrowOrErr(node.body)) return;
        context.report({ node, messageId: "discarded" });
      },
      CallExpression(node) {
        const handler = rejectionHandler(node);
        if (!isFunction(handler)) return;
        const [param] = handler.params;
        if (param && isUsed(context, handler, param)) return;
        if (containsThrowOrErr(handler.body)) return;
        context.report({ node: handler, messageId: "discardedRejection" });
      },
    };
  },
};
