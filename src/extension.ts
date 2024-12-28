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

  provider.postIssuesCount(issues);
}

async function getVrmFileDataUrl(vrmFilePath: string) {
  try {
    const vrmFile = await readFile(vrmFilePath);
    const base64Data = vrmFile.toString("base64");
    return `data:application/octet-stream;base64,${base64Data}`;
  } catch (error) {
    console.error("Error reading VRM file:", error);
    return "";
  }
}

async function getVrmaFileDataUrls (){
  const vrmFilePaths = await vscode.workspace.findFiles("**/*.vrm");
  const vrmFileDataUrls = await Promise.all(
    vrmFilePaths.map(async (vrmFilePath) => {
      return getVrmFileDataUrl(vrmFilePath.path);
    })
  );
  return vrmFileDataUrls;
}

async function update(vrmFilePath: string, context: vscode.ExtensionContext) {
  try {
    const dataUrl = await getVrmFileDataUrl(vrmFilePath);

    const provider = new WebViewProvider(
      context.extensionUri,
      dataUrl,
      context.globalState
    );

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        "vrm-companion-vscode.summon",
        provider
      )
    );

    vscode.languages.onDidChangeDiagnostics(() => postIssuesCount(provider));

    vscode.workspace.onDidChangeConfiguration(async () => {
      const extensionConfig = vscode.workspace.getConfiguration(
        "vrm-companion-vscode"
      );
      const vrmFilePath = extensionConfig.get("vrmFilePath") as string;

      provider.postVrmFileDataUrl(await getVrmFileDataUrl(vrmFilePath));
    });
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
