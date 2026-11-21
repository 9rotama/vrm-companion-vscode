import { defineConfig } from "@vscode/test-cli";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default defineConfig({
  files: "out/src/test/**/*.test.js",
  // The default user-data-dir under .vscode-test/ makes the IPC socket path exceed macOS's 103-char limit when run from .worktrees/
  launchArgs: [
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "vscode-test-"))}`,
  ],
});
