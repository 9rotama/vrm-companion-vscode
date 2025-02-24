import * as vscode from "vscode";
import { Uri, Webview } from "vscode";
import { getUri } from "./utils/get-uri";
import { getNonce } from "./utils/get-nonce";
import {
  messageToVscodeSchema,
  MessageToWebview,
  messageToWebviewSchema,
} from "../packages/webview/src/models/message";

export class WebviewProvider implements vscode.WebviewViewProvider {
  constructor(
    private _extensionUri: vscode.Uri,
    private dataOnMounted: {
      vrmDataUrl: string | undefined;
      issuesCount: number;
    }
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

    this._postMessagesOnMounted();
  }

  /* resolveWebviewView & 初期マウントが完了したときに初期データを送る */
  private _postMessagesOnMounted() {
    const view = this._view;
    if (!view) {
      return;
    }

    const idleVrmaUri = getUri(view.webview, this._extensionUri, [
      "packages",
      "webview",
      "dist",
      "animation",
      "idle.vrma",
    ]);

    view.webview.onDidReceiveMessage((message) => {
      const msg = messageToVscodeSchema.parse(message);
      switch (msg.command) {
        case "mounted":
          this.postMessage({
            command: "prepareVrmaUris",
            body: { idle: idleVrmaUri.toString() },
          });
          this.postMessage({
            command: "updateVrm",
            body: { dataUrl: this.dataOnMounted.vrmDataUrl },
          });
          this.postMessage({
            command: "updateIssuesCount",
            body: { count: this.dataOnMounted.issuesCount },
          });
      }
    });
  }

  public postMessage(message: MessageToWebview) {
    const view = this._view;
    if (!view) {
      return;
    }

    view.webview.postMessage(messageToWebviewSchema.parse(message));
  }

  private _getHtml(webview: Webview, extensionUri: Uri) {
    const stylesUri = getUri(webview, extensionUri, [
      "packages",
      "webview",
      "dist",
      "assets",
      "index.css",
    ]);
    const scriptUri = getUri(webview, extensionUri, [
      "packages",
      "webview",
      "dist",
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
