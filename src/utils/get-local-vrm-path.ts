import { stat } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { notifyVrmFilePathNotFound } from "./notifications";

export async function getLocalVrmPath(filePath: string | undefined) {
  if (!filePath) return undefined;
  try {
    if (!isAbsolute(filePath) || !(await stat(filePath)).isFile()) {
      throw new Error("Expected a local file");
    }
    return filePath;
  } catch {
    notifyVrmFilePathNotFound();
    return undefined;
  }
}
