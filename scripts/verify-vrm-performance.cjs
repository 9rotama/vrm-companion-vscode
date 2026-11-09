const vscode = require("vscode");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const file = process.env.VRM_PERFORMANCE_LOG;
if (!file)
  throw new Error("Set VRM_PERFORMANCE_LOG to an empty JSONL output path");
const samples = () =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(JSON.parse)
    : [];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const wait = async (n) => {
  const start = Date.now();
  while (samples().length < n) {
    if (Date.now() - start > 20000) throw Error("render timeout " + n);
    await delay(20);
  }
  return samples().at(-1);
};
exports.run = async () => {
  assert.equal(samples().length, 0, "use an empty output path for each run");
  await vscode.extensions
    .getExtension("9rotama.vrm-companion-vscode")
    .activate();
  await vscode.commands.executeCommand("vrm-companion-vscode.summon.focus");
  const first = await wait(1);
  assert.equal(first.metrics.modelLoads, 1);
  async function roundtrip(hiddenMs, afterHide) {
    const count = samples().length;
    await vscode.commands.executeCommand("workbench.view.search");
    if (afterHide) await afterHide();
    await delay(hiddenMs);
    await vscode.commands.executeCommand("workbench.view.explorer");
    return wait(count + 1);
  }
  const returns = Number(process.env.VRM_PERFORMANCE_RETURNS ?? 30);
  assert.ok(Number.isInteger(returns) && returns >= 0);
  for (let i = 0; i < returns; i++) {
    const row = await roundtrip(300);
    assert.equal(
      row.metrics.modelLoads,
      1,
      "sidebar return must retain the parsed model",
    );
    assert.equal(row.metrics.geometries, first.metrics.geometries);
    assert.equal(row.metrics.textures, first.metrics.textures);
  }
  if (process.env.VRM_PERFORMANCE_QUICK === "1") {
    console.log(`PASS: initial render and ${returns} returns`);
    return;
  }
  const beforeLongHide = samples().at(-1);
  const afterLongHide = await roundtrip(30000);
  assert.ok(
    afterLongHide.metrics.frames - beforeLongHide.metrics.frames < 10,
    "hidden view must stop rendering",
  );
  assert.ok(
    afterLongHide.metrics.maxDelta <= 0.05,
    "resume must clamp animation delta",
  );
  assert.equal(afterLongHide.metrics.modelLoads, 1);
  const collection =
    vscode.languages.createDiagnosticCollection("vrm-verification");
  try {
    const row = await roundtrip(300, () => {
      collection.set(
        vscode.Uri.file("/private/tmp/vrm-verification-diagnostic.ts"),
        [
          new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, 1),
            "verification",
            vscode.DiagnosticSeverity.Error,
          ),
        ],
      );
    });
    assert.equal(
      row.metrics.issuesCount,
      first.metrics.issuesCount + 1,
      "hidden diagnostic changes must reach resumed model",
    );
  } finally {
    collection.dispose();
  }
  for (let i = 0; i < 3; i++) {
    const n = samples().length;
    await vscode.commands.executeCommand(
      "workbench.action.toggleSidebarVisibility",
    );
    await delay(300);
    await vscode.commands.executeCommand(
      "workbench.action.toggleSidebarVisibility",
    );
    const row = await wait(n + 1);
    assert.equal(row.metrics.modelLoads, 1);
  }
  const os = require("node:os");
  const path = require("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vrm-model-switch-"));
  const model = path.join(dir, "alternate.vrm");
  fs.copyFileSync(process.env.VRM_MODEL_PATH, model);
  const config = vscode.workspace.getConfiguration("vrm-companion-vscode");
  const switchModel = async (filePath) => {
    const row = await roundtrip(300, async () => {
      await config.update(
        "vrmFilePath",
        filePath,
        vscode.ConfigurationTarget.Global,
      );
    });
    assert.ok(
      decodeURIComponent(new URL(row.modelUri).pathname).endsWith(filePath),
      "resumed model must match the newly selected local file",
    );
    assert.equal(
      row.metrics.geometries,
      first.metrics.geometries,
      "old model geometry must be released",
    );
    assert.equal(
      row.metrics.textures,
      first.metrics.textures,
      "old model textures must be released",
    );
  };
  try {
    for (let i = 0; i < 3; i++) {
      await switchModel(model);
      await switchModel(process.env.VRM_MODEL_PATH);
    }
  } finally {
    await config.update(
      "vrmFilePath",
      process.env.VRM_MODEL_PATH,
      vscode.ConfigurationTarget.Global,
    );
    fs.unlinkSync(model);
    fs.rmdirSync(dir);
  }
  console.log(
    "PASS: 30 returns, 30s hidden rendering pause, diagnostics, sidebar reopen, model replacement, stable GPU resources",
  );
};
