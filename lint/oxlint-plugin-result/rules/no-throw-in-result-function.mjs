import {
  enclosingFunction,
  ERR_NAME,
  hasResultAnnotation,
  isCallTo,
  OK_NAME,
  returnedExpressions,
  unwrapExpression,
} from "../utils.mjs";

function returnsResult(fn) {
  if (hasResultAnnotation(fn)) return true;
  if (fn.returnType) return false;
  return returnedExpressions(fn).some((expression) => {
    const call = unwrapExpression(expression);
    return isCallTo(call, OK_NAME) || isCallTo(call, ERR_NAME);
  });
}

/** @type {import("oxlint/plugins-dev").Rule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow throw inside functions that return a Result; return err() instead so callers see the failure in the type.",
    },
    messages: {
      throwInResult:
        "This function returns a Result. Return err(...) instead of throwing.",
    },
    schema: [],
  },
  create(context) {
    return {
      ThrowStatement(node) {
        const fn = enclosingFunction(node);
        if (fn && returnsResult(fn))
          context.report({ node, messageId: "throwInResult" });
      },
    };
  },
};
