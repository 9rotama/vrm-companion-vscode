import { readFile } from "fs/promises";
import { notifyVrmFilePathNotFound } from "./notifications";

export async function getVrmDataUrl(vrmFilePath: string) {
  if (!vrmFilePath) return undefined;

  let vrmFile: Buffer;
  try {
    vrmFile = await readFile(vrmFilePath);
  } catch {
    notifyVrmFilePathNotFound();
    return undefined;
  }
  const base64Data = vrmFile.toString("base64");
  return `data:application/octet-stream;base64,${base64Data}`;
}
