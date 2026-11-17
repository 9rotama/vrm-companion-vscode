// Type-level checks only: `npm run check-types` fails if Result stops forcing narrowing.
import { err, ok, Result } from "shared";

declare const result: Result<number, { type: "failed" }>;

// @ts-expect-error -- `value` is unreachable until `ok` is checked
export const unchecked: number = result.value;

// @ts-expect-error -- `error` is unreachable until `ok` is checked
export const uncheckedError = result.error;

export const checked: number = result.ok
  ? result.value
  : result.error.type.length;

// @ts-expect-error -- ok() cannot be returned where a different value type is expected
export const mismatched: Result<string, never> = ok(1);

export const widened: Result<string, { type: "failed" }> = err({
  type: "failed",
});
