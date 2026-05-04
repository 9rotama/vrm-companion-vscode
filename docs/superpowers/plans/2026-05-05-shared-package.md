# `packages/shared` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a source-only `packages/shared` package holding the postMessage contract (valibot schema + types), eliminate the cross-package relative-path import in extension, drop React from extension by rewriting `get-webview-html` as a `String.raw` template, and move webview-only dependencies out of the root `package.json`.

**Architecture:** The repository root remains the VS Code extension (manifest, `vsce` flow, `extensionUri` paths all unchanged). A new internal package `packages/shared` becomes the single source of truth for extension⇔webview message schemas; both extension and webview import from it via the `shared` workspace name. `get-webview-html` is rewritten as a tagged-template string using `String.raw` aliased to `html`, removing the only React/JSX usage in the extension.

**Tech Stack:** TypeScript, npm workspaces, valibot, esbuild (extension bundler), Vite (webview bundler), VS Code Webview API.

**Spec:** `docs/superpowers/specs/2026-05-05-shared-package-design.md`

---

## File Structure

**New files:**

- `packages/shared/package.json` — workspace package metadata, source-only (`main`/`types` → `./src/index.ts`)
- `packages/shared/src/index.ts` — re-export barrel
- `packages/shared/src/message.ts` — message schemas + types (moved from webview)

**Modified files:**

- `src/webview-provider.ts` — import path `../packages/webview/src/models/message` → `shared`
- `packages/webview/src/utils/use-vscode-messages.ts` — import path `../models/message` → `shared`
- `packages/webview/src/utils/vscode.ts` — import path `../models/message` → `shared`
- `src/utils/get-webview-html.tsx` → renamed to `src/utils/get-webview-html.ts`, JSX replaced with `String.raw` template literal
- `tsconfig.json` — remove `"jsx": "react-jsx"`
- `package.json` (root) — remove `react`/`react-dom` from deps, remove `@types/react`/`@types/react-dom`/`eslint-plugin-react` from devDeps, add `"shared": "*"` to deps
- `packages/webview/package.json` — add `react`/`react-dom`/`"shared": "*"` to deps, add `@types/react`/`@types/react-dom` to devDeps

**Deleted files:**

- `packages/webview/src/models/message.ts`
- `packages/webview/src/models/` directory (if empty after deletion)
- `src/utils/get-webview-html.tsx` (replaced by `.ts` version)

---

## Task 1: Scaffold `packages/shared` and move message schemas

**Files:**

- Create: `packages/shared/package.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/message.ts`

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "valibot": "^1.3.1"
  }
}
```

- [ ] **Step 2: Create `packages/shared/src/index.ts`**

```ts
export * from "./message";
```

- [ ] **Step 3: Create `packages/shared/src/message.ts`**

Copy the content verbatim from `packages/webview/src/models/message.ts`:

```ts
import * as v from "valibot";

const backgroundImageFilesSchema = v.array(
  v.object({
    id: v.string(),
    imageUri: v.string(),
    previewUri: v.string(),
  }),
);

const vrmaFilesSchema = v.object({
  idle: v.string(),
});

const assetsSchema = v.object({
  vrmaFiles: vrmaFilesSchema,
  backgroundImageFiles: backgroundImageFilesSchema,
});

export type Assets = v.InferOutput<typeof assetsSchema>;

export const messageToWebviewSchema = v.union([
  v.object({
    command: v.literal("updateVrm"),
    body: v.object({ dataUrl: v.union([v.string(), v.undefined()]) }),
  }),
  v.object({
    command: v.literal("updateIssuesCount"),
    body: v.object({ count: v.number() }),
  }),
  v.object({
    command: v.literal("loadAssetsUri"),
    body: assetsSchema,
  }),
]);

export type MessageToWebview = v.InferOutput<typeof messageToWebviewSchema>;

export const messageToVscodeSchema = v.object({
  command: v.literal("mounted"),
});

export type MessageToVscode = v.InferOutput<typeof messageToVscodeSchema>;
```

- [ ] **Step 4: Run `npm install` to register the new workspace**

Run: `npm install`
Expected: completes without errors. Mention of `added 1 package` (the new `shared` workspace) is normal.

- [ ] **Step 5: Verify `shared` is linked into `node_modules`**

Run: `ls -la node_modules/shared`
Expected: a symlink pointing to `../packages/shared`.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/package.json packages/shared/src/index.ts packages/shared/src/message.ts package-lock.json
git commit -m "feat: add packages/shared with postMessage contract"
```

---

## Task 2: Switch consumers to import from `shared` and delete the old file

**Files:**

- Modify: `src/webview-provider.ts:6-10`
- Modify: `packages/webview/src/utils/use-vscode-messages.ts:4`
- Modify: `packages/webview/src/utils/vscode.ts:3`
- Delete: `packages/webview/src/models/message.ts`
- Delete: `packages/webview/src/models/` (if empty)

- [ ] **Step 1: Update extension import in `src/webview-provider.ts`**

Find:

```ts
import {
  messageToVscodeSchema,
  MessageToWebview,
  messageToWebviewSchema,
} from "../packages/webview/src/models/message";
```

Replace with:

```ts
import {
  messageToVscodeSchema,
  MessageToWebview,
  messageToWebviewSchema,
} from "shared";
```

- [ ] **Step 2: Update webview import in `packages/webview/src/utils/use-vscode-messages.ts`**

Find:

```ts
import { Assets, messageToWebviewSchema } from "../models/message";
```

Replace with:

```ts
import { Assets, messageToWebviewSchema } from "shared";
```

- [ ] **Step 3: Update webview import in `packages/webview/src/utils/vscode.ts`**

Find:

```ts
import { MessageToVscode, messageToVscodeSchema } from "../models/message";
```

Replace with:

```ts
import { MessageToVscode, messageToVscodeSchema } from "shared";
```

- [ ] **Step 4: Delete the old message file (and empty parent dir)**

Run: `trash packages/webview/src/models/message.ts && rmdir packages/webview/src/models 2>/dev/null || true`
Expected: file moved to trash. The `rmdir` only succeeds if the directory is empty; if not, it silently fails — that's fine (we'll inspect manually next).

- [ ] **Step 5: Verify no remaining references to the old path**

Run: `grep -rn "models/message\|webview/src/models" src packages 2>/dev/null`
Expected: no output (zero matches).

- [ ] **Step 6: Run type check**

Run: `npm run check-types`
Expected: completes with no errors.

- [ ] **Step 7: Run full compile**

Run: `npm run compile`
Expected: completes with no errors. Webview build and esbuild bundle both succeed.

- [ ] **Step 8: Commit**

```bash
git add src/webview-provider.ts packages/webview/src/utils/use-vscode-messages.ts packages/webview/src/utils/vscode.ts packages/webview/src/models
git commit -m "refactor: import message schemas from shared package"
```

---

## Task 3: Replace React in `get-webview-html` with `String.raw` template

**Files:**

- Create: `src/utils/get-webview-html.ts`
- Delete: `src/utils/get-webview-html.tsx`

- [ ] **Step 1: Create `src/utils/get-webview-html.ts`**

```ts
const html = String.raw;

export function getWebviewHtml(
  stylesUri: string,
  scriptUri: string,
  nonce: string,
  cspSource: string,
): string {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          http-equiv="Content-Security-Policy"
          content="style-src ${cspSource}; script-src 'nonce-${nonce}';"
        />
        <link rel="stylesheet" type="text/css" href="${stylesUri}" />
        <title>vrm-companion</title>
      </head>
      <body class="h-screen w-screen overflow-hidden">
        <div id="root"></div>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
      </body>
    </html>`;
}
```

- [ ] **Step 2: Delete the old `.tsx` file**

Run: `trash src/utils/get-webview-html.tsx`
Expected: file moved to trash.

- [ ] **Step 3: Verify the call site needs no signature change**

Run: `grep -n "getWebviewHtml" src/webview-provider.ts`
Expected: a single line showing the import and a call with the same 4 string arguments. No change needed in `webview-provider.ts`.

- [ ] **Step 4: Run type check**

Run: `npm run check-types`
Expected: completes with no errors.

- [ ] **Step 5: Run full compile**

Run: `npm run compile`
Expected: completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/utils/get-webview-html.ts src/utils/get-webview-html.tsx
git commit -m "refactor: replace JSX with String.raw template in getWebviewHtml"
```

---

## Task 4: Remove `jsx` setting from extension tsconfig

**Files:**

- Modify: `tsconfig.json`

- [ ] **Step 1: Remove the `jsx` line**

Find:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "target": "es2022",
```

Replace with:

```json
{
  "compilerOptions": {
    "target": "es2022",
```

- [ ] **Step 2: Run type check**

Run: `npm run check-types`
Expected: completes with no errors. (Confirms no remaining JSX in extension source.)

- [ ] **Step 3: Run full compile**

Run: `npm run compile`
Expected: completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json
git commit -m "chore: drop jsx tsconfig setting from extension"
```

---

## Task 5: Move React dependencies from root to webview, declare `shared` dep

**Files:**

- Modify: `package.json` (root)
- Modify: `packages/webview/package.json`

- [ ] **Step 1: Update root `package.json` dependencies**

In the root `package.json`, change `dependencies` from:

```json
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "valibot": "^1.3.1"
},
```

to:

```json
"dependencies": {
  "shared": "*",
  "valibot": "^1.3.1"
},
```

- [ ] **Step 2: Update root `package.json` devDependencies**

In the same file, remove these three entries from `devDependencies`:

- `"@types/react": "^19.0.8"`
- `"@types/react-dom": "^19.0.4"`
- `"eslint-plugin-react": "^7.37.4"`

Leave all other `devDependencies` unchanged.

- [ ] **Step 3: Update `packages/webview/package.json` dependencies**

In `packages/webview/package.json`, add these three entries to `dependencies` (alphabetical order with the existing keys):

- `"react": "^19.0.0"`
- `"react-dom": "^19.0.0"`
- `"shared": "*"`

After the change, the `dependencies` block contains the existing entries plus these three.

- [ ] **Step 4: Update `packages/webview/package.json` devDependencies**

In the same file, add these two entries to `devDependencies`:

- `"@types/react": "^19.0.8"`
- `"@types/react-dom": "^19.0.4"`

- [ ] **Step 5: Reinstall dependencies**

Run: `npm install`
Expected: completes without errors. `package-lock.json` is updated.

- [ ] **Step 6: Verify React is hoisted (not duplicated)**

Run: `npm ls react`
Expected: a single line showing `react@19.x.y` resolved at the root, with `webview` listed as the consumer. If two different versions appear (e.g. one for root and one for webview), hoisting failed and we have a version mismatch to investigate before continuing.

- [ ] **Step 7: Verify `shared` is reachable from extension**

Run: `node -e "console.log(require.resolve('shared/src/index.ts'))"` from the repo root.
Expected: prints a path under `packages/shared/src/index.ts`. (This only validates the resolution; actual loading happens via the bundlers.)

If `require.resolve` errors with "Cannot find module" because Node refuses `.ts`, skip this check — the relevant validation is the next step (`npm run compile`).

- [ ] **Step 8: Run type check**

Run: `npm run check-types`
Expected: completes with no errors.

- [ ] **Step 9: Run full compile**

Run: `npm run compile`
Expected: completes with no errors.

- [ ] **Step 10: Run production package build**

Run: `npm run package`
Expected: completes with no errors. `dist/extension.js` is produced.

- [ ] **Step 11: Sanity-check bundle no longer contains `react-dom/server`**

Run: `grep -c "react-dom" dist/extension.js`
Expected: `0` (no matches). Confirms React was fully tree-shaken out of the extension bundle.

- [ ] **Step 12: Commit**

```bash
git add package.json packages/webview/package.json package-lock.json
git commit -m "chore: relocate react deps to webview and declare shared dep"
```

---

## Task 6: Manual smoke test in Extension Development Host

**Files:** none (verification only)

- [ ] **Step 1: Ensure clean build artifacts**

Run: `npm run package`
Expected: completes with no errors.

- [ ] **Step 2: Launch the Extension Development Host**

Open the repo in VS Code and press `F5` (or run the configured launch task).
Expected: a new VS Code window opens with the extension loaded.

- [ ] **Step 3: Open a workspace containing a configured VRM file**

In the Extension Development Host, open a workspace where `vrm-companion-vscode.vrmFilePath` points to a valid VRM file (or set it via Settings UI). Open the Explorer view.

- [ ] **Step 4: Verify the webview renders**

Expected: the `vrm-companion` view in the Explorer panel shows the 3D avatar. No errors in the Webview Developer Tools console (`Developer: Open Webview Developer Tools` from the command palette).

- [ ] **Step 5: Verify postMessage round-trip — `mounted` → `loadAssetsUri`**

In Webview Developer Tools console, look for the absence of "Invalid message received" / "Invalid message format" errors.
Expected: no schema validation errors. The avatar idle animation plays (proving `loadAssetsUri` arrived and assets resolved).

- [ ] **Step 6: Verify `updateIssuesCount` propagation**

Open a file in the host workspace and introduce a syntactic error (e.g., a stray `}`). Save.
Expected: the avatar's facial expression changes to reflect the error count, and no schema errors appear in the webview console.

- [ ] **Step 7: Verify `updateVrm` propagation**

Change `vrm-companion-vscode.vrmFilePath` in Settings to a different valid VRM file (or toggle to an invalid one and back).
Expected: the avatar reloads with the new model (or a notification appears for the unset path), and no schema errors appear in the webview console.

- [ ] **Step 8: If any step above fails, roll back**

Per the spec's rollback conditions: if `npm install` fails on hoisting, the bundle is broken, the import cannot be resolved, the webview does not render, or postMessage stops functioning, run `git reset --hard <last-good-commit>` after confirming with the user before discarding work.

- [ ] **Step 9: Commit a verification note (optional)**

If everything passed, no commit is needed for this task. The work is verified and ready to merge.

---

## Notes for the implementing engineer

- **`shared` is source-only.** It has no build script. Both Vite (webview) and esbuild (extension) bundle `shared/src/*.ts` directly. If you see a "Cannot find module 'shared'" error, the most likely cause is a missing `npm install` after Task 1.
- **`vsce package --no-dependencies`** is intentional and required because npm workspace hoisting confuses vsce's dependency walker. Don't remove the flag.
- **Use `trash`, not `rm`.** Per repo convention (CLAUDE.md), file deletions use the `trash` CLI to allow restoration from the macOS trash.
- **No new tests are introduced by this plan.** Existing message schemas already provide runtime validation (valibot). The smoke test in Task 6 is the contract test — schema validation errors in the webview console would surface any breakage.
