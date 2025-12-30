import { Uri, Webview } from "vscode";
import { getUri } from "./get-uri";
import { Assets } from "../../packages/webview/src/models/message";

export function loadAssets(webview: Webview, extensionUri: Uri): Assets {
  const vrmaIdle = getUri(webview, extensionUri, [
    "packages",
    "webview",
    "dist",
    "animation",
    "idle.vrma",
  ]).toString();
  const bgWhiteDots = getUri(webview, extensionUri, [
    "packages",
    "webview",
    "dist",
    "backgrounds",
    "white-dots.svg",
  ]).toString();

  const bgWhiteDotsPreview = getUri(webview, extensionUri, [
    "packages",
    "webview",
    "dist",
    "backgrounds",
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
