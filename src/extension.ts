import * as vscode from "vscode";
import { WebviewProvider } from "./webview-provider";
import { getLocalVrmPath } from "./utils/get-local-vrm-path";
import { getIssuesCount } from "./utils/get-issues-count";
import { getConfigVrmFilePath } from "./utils/workspace-config";
import { notifyVrmPathError } from "./utils/notifications";

async function setup(context: vscode.ExtensionContext) {
  const initial = await getLocalVrmPath(getConfigVrmFilePath());
  if (!initial.ok) notifyVrmPathError(initial.error);
  const modelPath = initial.ok ? initial.value : undefined;

  const provider = new WebviewProvider(
    context.extensionUri,
    {
      modelPath,
      issuesCount: getIssuesCount(),
    },
    context.extensionMode !== vscode.ExtensionMode.Production
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
      const result = await getLocalVrmPath(getConfigVrmFilePath());
      if (version !== configurationVersion) return;
      if (!result.ok) notifyVrmPathError(result.error);

      provider.setModelPath(result.ok ? result.value : undefined);
    }),
  );
}

export function activate(context: vscode.ExtensionContext) {
  return setup(context);
}

export function deactivate() {}
