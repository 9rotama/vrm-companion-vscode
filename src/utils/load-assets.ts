import { Uri, Webview } from "vscode";
import { getUri } from "./get-uri";
import { Assets } from "../../packages/webview/src/models/message";

const animationPath = ["packages", "webview", "dist", "animation"];
const backgroundsPath = ["packages", "webview", "dist", "backgrounds"];

export function loadAssets(webview: Webview, extensionUri: Uri): Assets {
  const vrmaIdle = getUri(webview, extensionUri, [
    ...animationPath,
    "idle.vrma",
  ]).toString();
  const bgWhiteDots = getUri(webview, extensionUri, [
    ...backgroundsPath,
    "white-dots.svg",
  ]).toString();
  const bgWhiteDotsPreview = getUri(webview, extensionUri, [
    ...backgroundsPath,
    "white-dots-p.png",
  ]).toString();

  return {
    vrmaFiles: { idle: vrmaIdle },
    backgroundImageFiles: [
      {
        id: "white-dots",
        imageUri: bgWhiteDots,
        previewUri: bgWhiteDotsPreview,
      },
    ],
  };
}
