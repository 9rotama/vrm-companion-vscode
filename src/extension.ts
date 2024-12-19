import * as vscode from "vscode";
import { WebViewProvider } from "./webview-provider";
import { readFile } from "fs/promises";

function postIssuesCount(provider: WebViewProvider) {
  const diags = vscode.languages.getDiagnostics();

  let issues = 1;
  diags.forEach(([_, collection]) => {
    collection.forEach((c) => {
      if (c.severity === 0 || c.severity === 1) {
        issues++;
      }
    });
  });

  console.log(issues)

  provider.postIssuesCount(issues);
}

async function update(vrmFilePath: string, context: vscode.ExtensionContext) {
  try {
    const vrmFile = await readFile(vrmFilePath);
    const base64Data = vrmFile.toString("base64");
    const dataUrl = `data:application/octet-stream;base64,${base64Data}`;

    const provider = new WebViewProvider(context.extensionUri, dataUrl);

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        "vrm-companion-vscode.summon",
        provider
      )
    );

    vscode.languages.onDidChangeDiagnostics(() => postIssuesCount(provider));
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

  update(vrmFilePath, context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
