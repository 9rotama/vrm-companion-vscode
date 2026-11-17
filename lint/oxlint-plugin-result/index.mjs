import handleError from "./rules/handle-error.mjs";
import noSwallowedError from "./rules/no-swallowed-error.mjs";
import noThrowInResultFunction from "./rules/no-throw-in-result-function.mjs";
import noUnusedResult from "./rules/no-unused-result.mjs";

export default {
  meta: { name: "result" },
  rules: {
    "handle-error": handleError,
    "no-swallowed-error": noSwallowedError,
    "no-throw-in-result-function": noThrowInResultFunction,
    "no-unused-result": noUnusedResult,
  },
};
