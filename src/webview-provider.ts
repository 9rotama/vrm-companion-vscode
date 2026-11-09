import * as vscode from "vscode";
import { dirname } from "node:path";
import { appendFileSync } from "node:fs";
import * as v from "valibot";
import { getUri } from "./utils/get-uri";
import { getNonce } from "./utils/get-nonce";
import {
  messageToVscodeSchema,
  MessageToWebview,
  messageToWebviewSchema,
} from "shared";
import { getWebviewHtml } from "./utils/get-webview-html";
import { loadAssets } from "./utils/load-assets";

export class WebviewProvider
  implements vscode.WebviewViewProvider, vscode.Disposable
{
  private performanceLog?: vscode.LogOutputChannel;
  private measurements = new Map<string, number>();
  private measurementId = 0;
  private activeMeasurement = "initial";
  private modelRevision = 0;
  private viewSubscriptions: vscode.Disposable[] = [];
  private _view?: vscode.WebviewView;

  constructor(
    private _extensionUri: vscode.Uri,
    private state: { modelPath: string | undefined; issuesCount: number },
    private performanceLogPath?: string,
  ) {}

  public resolveWebviewView(view: vscode.WebviewView) {
    this.disposeViewListeners();
    this.activeMeasurement = "initial";
    this.measurements.clear();
    this.measurements.set("initial", performance.now());
    this._view = view;
    this.updateResourceRoots();
    this.viewSubscriptions.push(
      view.webview.onDidReceiveMessage((message: unknown) => {
        const msg = v.safeParse(messageToVscodeSchema, message);
        if (!msg.success) return;
        if (msg.output.command !== "mounted") {
          this.performanceLog ??= vscode.window.createOutputChannel(
            "VRM Performance",
            { log: true },
          );
        }
        if (msg.output.command === "loadError") {
          this.performanceLog?.error(msg.output.body.message);
          console.error("[VRM load]", msg.output.body.message);
          return;
        }
        if (msg.output.command === "mounted") {
          this.sendState();
          return;
        }
        const reason =
          msg.output.body.reason === "initial"
            ? this.activeMeasurement
            : msg.output.body.reason;
        const start = this.measurements.get(reason);
        const result = {
          ...msg.output.body,
          reason,
          hostElapsed:
            start === undefined ? undefined : performance.now() - start,
        };
        this.performanceLog?.info(JSON.stringify(result));
        if (this.performanceLogPath)
          appendFileSync(
            this.performanceLogPath,
            JSON.stringify(result) + "\n",
          );
        this.measurements.delete(reason);
      }),
      view.onDidChangeVisibility(() => {
        if (!view.visible) {
          this.postMessage({ command: "visibility", body: { visible: false } });
          return;
        }
        const id = `resume:${++this.measurementId}`;
        this.activeMeasurement = id;
        this.measurements.clear();
        this.measurements.set(id, performance.now());
        this.sendState();
        this.postMessage({ command: "measureRender", body: { id } });
      }),
      view.onDidDispose(() => {
        if (this._view === view) this._view = undefined;
        this.disposeViewListeners();
        this.measurements.clear();
      }),
    );
    view.webview.html = this.getHtml(view.webview);
  }

  public setModelPath(modelPath: string | undefined) {
    this.state.modelPath = modelPath;
    this.modelRevision++;
    this.updateResourceRoots();
    if (this._view?.visible) this.sendState();
  }

  public setIssuesCount(issuesCount: number) {
    this.state.issuesCount = issuesCount;
    if (this._view?.visible)
      this.postMessage({
        command: "updateIssuesCount",
        body: { count: issuesCount },
      });
  }

  private updateResourceRoots() {
    if (!this._view) return;
    this._view.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        ...(this.state.modelPath
          ? [vscode.Uri.file(dirname(this.state.modelPath))]
          : []),
      ],
    };
  }

  private sendState() {
    const view = this._view;
    if (!view) return;
    const uri = this.state.modelPath
      ? view.webview
          .asWebviewUri(
            vscode.Uri.file(this.state.modelPath).with({
              query: `revision=${this.modelRevision}`,
            }),
          )
          .toString()
      : undefined;
    this.postMessage({
      command: "loadAssetsUri",
      body: loadAssets(view.webview, this._extensionUri),
    });
    this.postMessage({ command: "updateVrm", body: { uri } });
    this.postMessage({
      command: "updateIssuesCount",
      body: { count: this.state.issuesCount },
    });
    this.postMessage({
      command: "visibility",
      body: { visible: view.visible },
    });
  }

  public postMessage(message: MessageToWebview) {
    void this._view?.webview.postMessage(
      v.parse(messageToWebviewSchema, message),
    );
  }

  private disposeViewListeners() {
    this.viewSubscriptions
      .splice(0)
      .forEach((subscription) => subscription.dispose());
  }

  public dispose() {
    this.disposeViewListeners();
    this._view = undefined;
    this.measurements.clear();
    this.performanceLog?.dispose();
  }

  private getHtml(webview: vscode.Webview) {
    const asset = (name: string) =>
      getUri(webview, this._extensionUri, [
        "packages",
        "webview",
        "dist",
        "assets",
        name,
      ]).toString();
    return getWebviewHtml(
      asset("index.css"),
      asset("index.js"),
      getNonce(),
      webview.cspSource,
    );
  }
}
