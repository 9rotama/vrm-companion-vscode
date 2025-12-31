import * as vscode from "vscode";
import { Uri, Webview } from "vscode";
import { getUri } from "./utils/get-uri";
import { getNonce } from "./utils/get-nonce";
import {
  messageToVscodeSchema,
  MessageToWebview,
  messageToWebviewSchema,
} from "../packages/webview/src/models/message";
import { getWebviewHtml } from "./utils/get-webview-html";
import { loadAssets } from "./utils/load-assets";

export class WebviewProvider implements vscode.WebviewViewProvider {
  constructor(
    private _extensionUri: vscode.Uri,
    private dataOnMounted: {
      vrmDataUrl: string | undefined;
      issuesCount: number;
    },
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
      this._extensionUri,
    );

    this._postMessagesOnMounted();
  }

  /* resolveWebviewView & 初期マウントが完了したときに初期データを送る */
  private _postMessagesOnMounted() {
    const view = this._view;
    if (!view) {
      return;
    }

    const assets = loadAssets(view.webview, this._extensionUri);

    view.webview.onDidReceiveMessage((message) => {
      const msg = messageToVscodeSchema.safeParse(message);
      if (!msg.success) {
        console.error("Invalid message received:", msg.error);
        return;
      }
      switch (msg.data.command) {
        case "mounted":
          this.postMessage({
            command: "loadAssetsUri",
            body: assets,
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

    return getWebviewHtml(
      stylesUri.toString(),
      scriptUri.toString(),
      nonce,
      webview.cspSource,
    );
  }
}
