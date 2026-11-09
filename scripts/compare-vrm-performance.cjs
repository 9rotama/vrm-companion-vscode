const vscode = require("vscode");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const file = process.env.VRM_PERFORMANCE_LOG;
if (!file) throw new Error("Set VRM_PERFORMANCE_LOG");
const rows = () =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(JSON.parse)
    : [];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForCount(n) {
  const start = Date.now();
  while (rows().filter((row) => Number.isFinite(row.hostElapsed)).length < n) {
    if (Date.now() - start > 20000) throw new Error(`render timeout: ${n}`);
    await delay(20);
  }
}
exports.run = async () => {
  await vscode.extensions
    .getExtension("9rotama.vrm-companion-vscode")
    .activate();
  await vscode.commands.executeCommand("vrm-companion-vscode.summon.focus");
  await waitForCount(1);
  for (let i = 0; i < 10; i++) {
    const count = rows().filter((row) =>
      Number.isFinite(row.hostElapsed),
    ).length;
    await vscode.commands.executeCommand("workbench.view.search");
    await delay(300);
    await vscode.commands.executeCommand("workbench.view.explorer");
    await waitForCount(count + 1);
  }
  const measured = rows().filter((row) => Number.isFinite(row.hostElapsed));
  assert.equal(measured.filter((row) => row.reason === "initial").length, 1);
  assert.equal(
    measured.filter((row) => row.reason.startsWith("resume:")).length,
    10,
  );
  console.log("PASS: initial display and 10 sidebar returns");
};
