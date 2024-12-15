import * as vscode from "vscode";
import { WebViewProvider } from "./webview-provider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "vrm-companion-vscode.summon",
      new WebViewProvider(context.extensionUri)
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
