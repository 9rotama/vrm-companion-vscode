import { ok, Result } from "./result";

export function readConfig<
  const T extends { parse: (input: unknown) => unknown },
>(schema: T, input: unknown): Result<unknown, { type: "invalid" }> {
  return ok(schema.parse(input));
}

export const fetchConfig = async (
  url: string,
): Promise<Result<string, never>> => ok(url);

export function plain(): string {
  return "not a result";
}
