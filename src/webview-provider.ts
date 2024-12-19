import * as vscode from "vscode";
import { Uri, Webview } from "vscode";
import { readFile } from "fs";
export class WebViewProvider implements vscode.WebviewViewProvider {
  constructor(
    private _extensionUri: vscode.Uri,
    private _vrmFileDataUrl: string
  ) {}
  private _view?: vscode.WebviewView;

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtml(
      this._view.webview,
      this._extensionUri
    );
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "ready_for_receives":
          webviewView.webview.postMessage({
            command: "set_vrm",
            state: { vrmFileDataUrl: this._vrmFileDataUrl },
          });
      }
    });
  }

  public postIssuesCount(issuesCount: number) {
    const view = this._view;
    if (!view) {
      return;
    }
    console.log("Issues count:", issuesCount);

    view.webview.postMessage({
      command: "issues_count",
      state: { issuesCount },
    });
  }

  private _getHtml(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      "packages",
      "webview",
      "build",
      "assets",
      "index.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "packages",
      "webview",
      "build",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
