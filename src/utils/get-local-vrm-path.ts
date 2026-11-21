import { stat } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { err, fromPromise, ok, Result } from "shared";

export type VrmPathError =
  | { type: "notSet" }
  | { type: "notAbsolute"; path: string }
  | { type: "notFound"; path: string; cause: unknown }
  | { type: "notAFile"; path: string };

export async function getLocalVrmPath(
  filePath: string | undefined,
): Promise<Result<string, VrmPathError>> {
  if (!filePath) return err({ type: "notSet" });
  if (!isAbsolute(filePath))
    return err({ type: "notAbsolute", path: filePath });
  const stats = await fromPromise(stat(filePath), (cause) => ({
    type: "notFound" as const,
    path: filePath,
    cause,
  }));
  if (!stats.ok) return stats;
  if (!stats.value.isFile()) return err({ type: "notAFile", path: filePath });
  return ok(filePath);
}
