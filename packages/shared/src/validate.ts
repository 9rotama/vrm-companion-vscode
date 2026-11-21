import * as v from "valibot";
import { err, ok, Result } from "./result";

export type ValidationError = {
  type: "invalidSchema";
  issues: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]];
};

export function validate<
  const Schema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: Schema,
  input: unknown,
): Result<v.InferOutput<Schema>, ValidationError> {
  const parsed = v.safeParse(schema, input);
  return parsed.success
    ? ok(parsed.output)
    : err({ type: "invalidSchema", issues: parsed.issues });
}

export function describeValidationError(error: ValidationError): string {
  return v.summarize(error.issues);
}
