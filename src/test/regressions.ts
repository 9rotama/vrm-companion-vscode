import * as assert from "node:assert/strict";
import * as vscode from "vscode";
import { WebviewProvider } from "../webview-provider";
import { getLocalVrmPath } from "../utils/get-local-vrm-path";
import { loadCompanion } from "../../packages/webview/src/utils/load-companion";
import { getVrmFromGltf } from "../../packages/webview/src/utils/get-vrm-from-gltf";
import { VRM, VRMUtils } from "@pixiv/three-vrm";
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { err, MessageToWebview, ok, Result } from "shared";

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
          loadModel: () => model.then(ok),
          loadAnimation: () => animation.promise.then(ok),
          showModel: (value) => shown.push(value),
          animate: () => assert.fail("cancelled animation"),
          disposeModel: (value) => disposed.push(value),
          reportError: (error) =>
            assert.fail(`unexpected error: ${JSON.stringify(error)}`),
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
      const animation = deferred<Result<string, string>>();
      const shown: string[] = [];
      const errors: unknown[] = [];
      const task = loadCompanion({
        loadModel: () => Promise.resolve(ok("model")),
        loadAnimation: () => animation.promise,
        showModel: (model) => shown.push(model),
        animate: () => assert.fail("failed animation"),
        disposeModel: () => {},
        reportError: (error) => errors.push(error),
      });
      await Promise.resolve();
      assert.deepEqual(shown, ["model"]);
      animation.resolve(err("missing animation"));
      await task.done;
      assert.deepEqual(errors, ["missing animation"]);
      assert.deepEqual(shown, ["model"]);
      task.cancel();
    },
  );
  await check(
    "unexpected rejection is reported instead of left unhandled",
    async () => {
      const errors: unknown[] = [];
      const cause = new Error("loader crashed");
      const task = loadCompanion({
        loadModel: () => Promise.reject(cause),
        loadAnimation: () => Promise.reject(cause),
        showModel: () => assert.fail("crashed model shown"),
        animate: () => assert.fail("crashed model animated"),
        disposeModel: () => {},
        reportError: (error) => errors.push(error),
      });
      await task.done;
      assert.deepEqual(errors, [
        { type: "unexpected", cause },
        { type: "unexpected", cause },
      ]);
      task.cancel();
    },
  );
  await check(
    "missing model reports failure without showing a model",
    async () => {
      const errors: unknown[] = [];
      const task = loadCompanion({
        loadModel: () => Promise.resolve(err("missing model")),
        loadAnimation: () => Promise.resolve(ok("idle")),
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
  await check(
    "non-VRM glTF releases resources and allows switching to a valid VRM",
    async () => {
      const scene = new Group();
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial();
      scene.add(new Mesh(geometry, material));
      let geometryDisposals = 0;
      let materialDisposals = 0;
      geometry.addEventListener("dispose", () => geometryDisposals++);
      material.addEventListener("dispose", () => materialDisposals++);
      const valid = { scene: new Group() } as VRM;
      const shown: VRM[] = [];
      const errors: unknown[] = [];
      const disposed: VRM[] = [];
      const start = (userData: Record<string, unknown>) =>
        loadCompanion({
          loadModel: async () => getVrmFromGltf({ scene, userData }),
          loadAnimation: async () => ok("idle"),
          showModel: (model) => shown.push(model),
          animate: () => {},
          disposeModel: (model) => {
            disposed.push(model);
            VRMUtils.deepDispose(model.scene);
          },
          reportError: (error) => errors.push(error),
        });
      const invalid = start({});
      await invalid.done;
      assert.equal(errors.length, 1);
      assert.deepEqual(errors[0], { type: "notVrm" });
      assert.deepEqual(shown, []);
      assert.equal(geometryDisposals, 1);
      assert.equal(materialDisposals, 1);
      assert.doesNotThrow(() => invalid.cancel());
      assert.deepEqual(disposed, []);
      const next = start({ vrm: valid });
      await next.done;
      assert.deepEqual(shown, [valid]);
      assert.equal(errors.length, 1);
      assert.doesNotThrow(() => next.cancel());
      assert.deepEqual(disposed, [valid]);
    },
  );
  await check("only existing absolute local files are accepted", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vrm-regression-"));
    const file = join(dir, "model.vrm");
    try {
      await writeFile(file, "local fixture");
      assert.deepEqual(await getLocalVrmPath(file), ok(file));
      assert.deepEqual(
        await getLocalVrmPath(undefined),
        err({ type: "notSet" }),
      );
      assert.deepEqual(
        await getLocalVrmPath("https://example.invalid/model.vrm"),
        err({ type: "notAbsolute", path: "https://example.invalid/model.vrm" }),
      );
      assert.deepEqual(
        await getLocalVrmPath(dir),
        err({ type: "notAFile", path: dir }),
      );
      await unlink(file);
      const missing = await getLocalVrmPath(file);
      assert.ok(!missing.ok && missing.error.type === "notFound");
    } finally {
      await rmdir(dir);
    }
  });
  console.log(`${passed} regression tests passed`);
}
