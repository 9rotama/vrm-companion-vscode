import { Uri, Webview } from "vscode";
import { getUri } from "./get-uri";
import { AssetsUri } from "../../packages/webview/src/models/message";

export function loadAssetsUri(webview: Webview, extensionUri: Uri): AssetsUri {
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
    "bg",
    "white-dots.svg",
  ]).toString();

  const bgWhiteDotsPreview = getUri(webview, extensionUri, [
    "packages",
    "webview",
    "dist",
    "bg",
    "white-dots-p.png",
  ]).toString();

  return {
    vrma: { idle: vrmaIdle },
    bg: { whiteDots: { bg: bgWhiteDots, preview: bgWhiteDotsPreview } },
  };
}
