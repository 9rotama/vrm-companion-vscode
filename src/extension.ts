import * as vscode from "vscode";
import { WebviewProvider } from "./webview-provider";
import { getLocalVrmPath } from "./utils/get-local-vrm-path";
import { getIssuesCount } from "./utils/get-issues-count";
import { getConfigVrmFilePath } from "./utils/workspace-config";
import { notifyVrmFilePathNotSet } from "./utils/notifications";

async function setup(context: vscode.ExtensionContext) {
  const vrmFilePath = getConfigVrmFilePath();

  if (!vrmFilePath) notifyVrmFilePathNotSet();

  const modelPath = await getLocalVrmPath(vrmFilePath);

  const provider = new WebviewProvider(
    context.extensionUri,
    {
      modelPath,
      issuesCount: getIssuesCount(),
    },
    context.extensionMode === vscode.ExtensionMode.Development
      ? process.env.VRM_PERFORMANCE_LOG
      : undefined,
  );

  context.subscriptions.push(
    provider,
    vscode.window.registerWebviewViewProvider(
      "vrm-companion-vscode.summon",
      provider,
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
  );

  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics(() =>
      provider.setIssuesCount(getIssuesCount()),
    ),
  );

  let configurationVersion = 0;
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (!event.affectsConfiguration("vrm-companion-vscode.vrmFilePath"))
        return;
      const version = ++configurationVersion;
      const vrmFilePath = getConfigVrmFilePath();
      if (!vrmFilePath) notifyVrmFilePathNotSet();
      const modelPath = await getLocalVrmPath(vrmFilePath);
      if (version !== configurationVersion) return;

      provider.setModelPath(modelPath);
    }),
  );
}

export function activate(context: vscode.ExtensionContext) {
  return setup(context);
}

export function deactivate() {}
