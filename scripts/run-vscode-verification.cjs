const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const executable = process.env.VSCODE_EXECUTABLE_PATH;
if (!executable)
  throw new Error(
    "Set VSCODE_EXECUTABLE_PATH to your installed VS Code executable",
  );
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "vrm-verification-"));
fs.mkdirSync(path.join(profile, "User"));
fs.writeFileSync(
  path.join(profile, "User", "settings.json"),
  JSON.stringify({
    "vrm-companion-vscode.vrmFilePath": process.env.VRM_MODEL_PATH,
    "workbench.startupEditor": "none",
    "window.restoreWindows": "none",
    "extensions.autoUpdate": false,
  }),
);
const tests = process.argv[2] || "out/regressions.cjs";
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
delete env.VSCODE_IPC_HOOK_CLI;
console.log(`Verification profile: ${profile}`);
const child = spawn(
  executable,
  [
    `--user-data-dir=${profile}`,
    `--extensions-dir=${path.join(profile, "extensions")}`,
    `--extensionDevelopmentPath=${root}`,
    `--extensionTestsPath=${path.resolve(root, tests)}`,
    "--disable-extensions",
    "--skip-welcome",
    "--skip-release-notes",
  ],
  { env, stdio: "inherit" },
);
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
