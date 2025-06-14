import * as vscode from "vscode";
import { WebviewProvider } from "./webview-provider";
import { getVrmDataUrl } from "./utils/get-vrm-data-url";
import { getIssuesCount } from "./utils/get-issues-count";
import { getConfigVrmFilePath } from "./utils/workspace-config";
import { notifyVrmFilePathNotSet } from "./utils/notifications";

async function setup(context: vscode.ExtensionContext) {
  const vrmFilePath = getConfigVrmFilePath();

  if (!vrmFilePath) notifyVrmFilePathNotSet();

  const dataUrl = vrmFilePath ? await getVrmDataUrl(vrmFilePath) : undefined;

  const provider = new WebviewProvider(context.extensionUri, {
    vrmDataUrl: dataUrl,
    issuesCount: getIssuesCount(),
  });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "vrm-companion-vscode.summon",
      provider,
    ),
  );

  vscode.languages.onDidChangeDiagnostics(() =>
    provider.postMessage({
      command: "updateIssuesCount",
      body: { count: getIssuesCount() },
    }),
  );

  vscode.workspace.onDidChangeConfiguration(async () => {
    const vrmFilePath = getConfigVrmFilePath();
    if (!vrmFilePath) notifyVrmFilePathNotSet();
    const dataUrl = vrmFilePath ? await getVrmDataUrl(vrmFilePath) : undefined;

    provider.postMessage({
      command: "updateVrm",
      body: { dataUrl },
    });
  });
}

export function activate(context: vscode.ExtensionContext) {
  setup(context);
}

export function deactivate() {}
