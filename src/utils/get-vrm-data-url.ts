import { readFile } from "fs/promises";

export async function getVrmDataUrl(vrmFilePath: string) {
  const vrmFile = await readFile(vrmFilePath);
  const base64Data = vrmFile.toString("base64");
  return `data:application/octet-stream;base64,${base64Data}`;
}
