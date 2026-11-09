import * as assert from "node:assert/strict";
import * as vscode from "vscode";
import { WebviewProvider } from "../webview-provider";
import { getLocalVrmPath } from "../utils/get-local-vrm-path";
import { loadCompanion } from "../../packages/webview/src/utils/load-companion";
import { mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MessageToWebview } from "shared";

function fakeView() {
  const received = new vscode.EventEmitter<unknown>();
  const visibility = new vscode.EventEmitter<void>();
  const disposed = new vscode.EventEmitter<void>();
  const messages: MessageToWebview[] = [];
  const view = {
    visible: true,
    onDidChangeVisibility: visibility.event,
    onDidDispose: disposed.event,
    webview: {
      html: "",
      options: {},
      cspSource: "https://test.invalid",
      asWebviewUri: (uri: vscode.Uri) =>
        uri.with({ scheme: "https", authority: "local.test" }),
      onDidReceiveMessage: received.event,
      postMessage: (message: MessageToWebview) => {
        messages.push(message);
        return Promise.resolve(true);
      },
    },
  };
  return {
    view: view as unknown as vscode.WebviewView,
    messages,
    mount: () => received.fire({ command: "mounted" }),
    show: (visible: boolean) => {
      view.visible = visible;
      visibility.fire();
    },
    dispose: () => {
      disposed.fire();
      received.dispose();
      visibility.dispose();
      disposed.dispose();
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

export async function run() {
  let passed = 0;
  async function check(name: string, callback: () => void | Promise<void>) {
    await callback();
    passed++;
    console.log(`PASS ${name}`);
  }
  await check(
    "hidden changes restore latest model, diagnostics and restricted roots",
    () => {
      const provider = new WebviewProvider(vscode.Uri.file("/extension"), {
        modelPath: "/models/a.vrm",
        issuesCount: 1,
      });
      const first = fakeView();
      provider.resolveWebviewView(first.view);
      first.mount();
      const initial = first.messages.find((m) => m.command === "updateVrm");
      assert.equal(initial?.command, "updateVrm");
      assert.ok(
        initial?.command === "updateVrm" &&
          initial.body.uri?.startsWith("https:"),
      );
      first.show(false);
      const count = first.messages.length;
      provider.setModelPath("/other/b.vrm");
      provider.setIssuesCount(9);
      assert.equal(first.messages.length, count);
      first.show(true);
      assert.ok(
        first.messages.some(
          (m) =>
            m.command === "updateVrm" && m.body.uri?.includes("/other/b.vrm"),
        ),
      );
      assert.ok(
        first.messages.some(
          (m) => m.command === "updateIssuesCount" && m.body.count === 9,
        ),
      );
      assert.deepEqual(
        first.view.webview.options.localResourceRoots?.map((uri) => uri.fsPath),
        ["/extension", "/other"],
      );
      first.dispose();
      const second = fakeView();
      provider.resolveWebviewView(second.view);
      second.mount();
      assert.ok(
        second.messages.some(
          (m) =>
            m.command === "updateVrm" && m.body.uri?.includes("/other/b.vrm"),
        ),
      );
      assert.ok(
        second.messages.some(
          (m) => m.command === "updateIssuesCount" && m.body.count === 9,
        ),
      );
      provider.setModelPath(undefined);
      assert.ok(
        second.messages.some(
          (m) => m.command === "updateVrm" && m.body.uri === undefined,
        ),
      );
      assert.equal(second.view.webview.options.localResourceRoots?.length, 1);
      second.dispose();
      provider.dispose();
    },
  );
  await check(
    "cancelled older model cannot replace newer model and is disposed once",
    async () => {
      const old = deferred<string>();
      const animation = deferred<string>();
      const shown: string[] = [];
      const disposed: string[] = [];
      const make = (model: Promise<string>) =>
        loadCompanion({
          loadModel: () => model,
          loadAnimation: () => animation.promise,
          showModel: (value) => shown.push(value),
          animate: () => assert.fail("cancelled animation"),
          disposeModel: (value) => disposed.push(value),
          reportError: (error) => {
            throw error;
          },
        });
      const a = make(old.promise);
      a.cancel();
      const b = make(Promise.resolve("B"));
      await Promise.resolve();
      old.resolve("A");
      await a.done;
      assert.deepEqual(shown, ["B"]);
      assert.deepEqual(disposed, ["A"]);
      b.cancel();
      b.cancel();
      animation.resolve("idle");
      await b.done;
      assert.deepEqual(disposed, ["A", "B"]);
    },
  );
  await check(
    "model is shown before animation finishes and survives animation failure",
    async () => {
      const animation = deferred<string>();
      const shown: string[] = [];
      const errors: unknown[] = [];
      const task = loadCompanion({
        loadModel: () => Promise.resolve("model"),
        loadAnimation: () => animation.promise,
        showModel: (model) => shown.push(model),
        animate: () => assert.fail("failed animation"),
        disposeModel: () => {},
        reportError: (error) => errors.push(error),
      });
      await Promise.resolve();
      assert.deepEqual(shown, ["model"]);
      animation.reject(new Error("missing animation"));
      await task.done;
      assert.equal(errors.length, 1);
      assert.deepEqual(shown, ["model"]);
      task.cancel();
    },
  );
  await check(
    "missing model reports failure without showing a model",
    async () => {
      const errors: unknown[] = [];
      const task = loadCompanion({
        loadModel: () => Promise.reject(new Error("missing model")),
        loadAnimation: () => Promise.resolve("idle"),
        showModel: () => assert.fail("missing model shown"),
        animate: () => assert.fail("missing model animated"),
        disposeModel: () => {},
        reportError: (error) => errors.push(error),
      });
      await task.done;
      assert.equal(errors.length, 1);
      task.cancel();
    },
  );
  await check("only existing absolute local files are accepted", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vrm-regression-"));
    const file = join(dir, "model.vrm");
    try {
      await writeFile(file, "local fixture");
      assert.equal(await getLocalVrmPath(file), file);
      assert.equal(await getLocalVrmPath(undefined), undefined);
      assert.equal(
        await getLocalVrmPath("https://example.invalid/model.vrm"),
        undefined,
      );
      assert.equal(await getLocalVrmPath(dir), undefined);
      await unlink(file);
      assert.equal(await getLocalVrmPath(file), undefined);
    } finally {
      await rmdir(dir);
    }
  });
  console.log(`${passed} regression tests passed`);
}
