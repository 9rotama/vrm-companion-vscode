const vscode = require("vscode");
const fs = require("node:fs");
const file = process.env.VRM_PERFORMANCE_LOG;
if (!file)
  throw new Error(
    "Set VRM_PERFORMANCE_LOG to the instrumented Provider JSONL log path",
  );
const count = () =>
  fs.existsSync(file)
    ? fs.readFileSync(file, "utf8").trim().split("\n").length
    : 0;
const wait = async (n) => {
  const start = Date.now();
  while (count() < n) {
    if (Date.now() - start > 20000) throw Error("render timeout " + n);
    await new Promise((r) => setTimeout(r, 20));
  }
};
exports.run = async () => {
  const initial = count();
  await vscode.extensions
    .getExtension("9rotama.vrm-companion-vscode")
    .activate();
  await vscode.commands.executeCommand("vrm-companion-vscode.summon.focus");
  await wait(initial + 1);
  for (let i = 0; i < 10; i++) {
    const n = count();
    await vscode.commands.executeCommand("workbench.view.search");
    await new Promise((r) => setTimeout(r, 300));
    await vscode.commands.executeCommand("workbench.view.explorer");
    await wait(n + 1);
  }
};
