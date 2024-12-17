import * as vscode from "vscode";
import { WebViewProvider } from "./webview-provider";
import { readFile } from "fs/promises";

async function setVrmFileData(
  vrmFilePath: string,
  context: vscode.ExtensionContext
) {
  try {
    const vrmFile = await readFile(vrmFilePath);
    const base64Data = vrmFile.toString("base64");
    const dataUrl = `data:application/octet-stream;base64,${base64Data}`;

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        "vrm-companion-vscode.summon",
        new WebViewProvider(context.extensionUri, dataUrl)
      )
    );
  } catch (error) {
    console.error("Error reading VRM file:", error);
    return;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const extensionConfig = vscode.workspace.getConfiguration(
    "vrm-companion-vscode"
  );
  const vrmFilePath = extensionConfig.get("vrmFilePath") as string;

  setVrmFileData(vrmFilePath, context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
