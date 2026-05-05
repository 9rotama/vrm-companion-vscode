# `packages/shared` 追加とコントラクト層分離

## 背景と動機

現状、extension（リポジトリルート）と webview（`packages/webview/`）は postMessage で通信しており、その contract（valibot スキーマ＋型）は `packages/webview/src/models/message.ts` に置かれている。extension 側はこのファイルを cross-package の相対パス（`../packages/webview/src/models/message`）で直接 import しているため、パッケージ境界が成立していない。

加えて、本来 webview のみが必要とする `react` / `react-dom` / `@types/react` / `@types/react-dom` がリポジトリルートの `package.json`（＝拡張本体の package.json）に dependency として残っており、依存の所在が不明瞭になっている。さらに extension 側で唯一 React を利用していた `get-webview-html.tsx`（webview の初期 HTML を `renderToStaticMarkup` で生成）は、補間値が全て内部生成のため XSS リスクが無く、JSX を維持する必要が無い。

これらの問題に対して、最小限のスコープ（`packages/extension` への移行は今回のスコープ外）で対処する。

## ゴール

- extension⇔webview の通信 contract を独立した `packages/shared` パッケージに切り出し、cross-package の相対パス import を消す
- extension から `react` / `react-dom` を完全排除する
- webview 専用の依存をルートから webview パッケージへ移し、ルート（拡張本体）の `dependencies` を実際に拡張が使うものだけに絞る

## 非ゴール（今回やらないこと）

- 拡張本体を `packages/extension/` に移すこと（`vsce` や CI、`extensionUri` 起点パスへの影響が大きく、現状の構成は VS Code 拡張のデファクト配置として妥当）
- `shared` をビルド成果物を持つパッケージにすること（source-only に保つ）
- ビルドフローの並列化や orchestration の改修
- 依存の包括的な棚卸し（valibot の所在変更などはスコープに含めない。明確に react 系のみが対象）

## 設計

### パッケージ構成

```
vrm-companion-vscode/                ← workspace root = 拡張本体（現状維持）
├─ package.json                      ← VS Code manifest を保持、deps から react 系を除去
├─ src/                              ← 拡張ソース（現状維持）
├─ esbuild.js                        ← 現状維持
├─ tsconfig.json                     ← 現状維持（"jsx": "react-jsx" のみ削除）
├─ packages/
│  ├─ shared/                        ← 新規・source-only
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ index.ts                 ← message.ts を re-export
│  │     └─ message.ts               ← webview から移動
│  └─ webview/
│     ├─ package.json                ← deps に react / react-dom / "shared": "*" を追加
│     └─ src/
│        ├─ models/                  ← message.ts は削除
│        └─ utils/                   ← import を "shared" 経由に変更
```

### `packages/shared/package.json`

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

- ビルドステップを持たず、consumer のバンドラ（webview の Vite、extension の esbuild）が TS ソースをそのまま取り込む
- `valibot` は shared が直接スキーマ定義に使うため runtime dep として宣言する

### `packages/shared/src/index.ts`

```ts
export * from "./message";
```

### `packages/shared/src/message.ts`

`packages/webview/src/models/message.ts` の内容をそのまま移動する。エクスポートは現状の `messageToWebviewSchema` / `MessageToWebview` / `messageToVscodeSchema` / `MessageToVscode` / `Assets` を維持する。

### import 書き換え

| ファイル                                            | 変更前                                          | 変更後          |
| --------------------------------------------------- | ----------------------------------------------- | --------------- |
| `src/webview-provider.ts`                           | `from "../packages/webview/src/models/message"` | `from "shared"` |
| `packages/webview/src/utils/use-vscode-messages.ts` | `from "../models/message"`                      | `from "shared"` |
| `packages/webview/src/utils/vscode.ts`              | `from "../models/message"`                      | `from "shared"` |

書き換え後、`packages/webview/src/models/message.ts` を削除する。`models/` ディレクトリに他のファイルが無ければディレクトリも削除する。

### React の排除

#### `src/utils/get-webview-html.tsx` → `get-webview-html.ts`

JSX を廃止し、`String.raw` を `html` にエイリアスしたタグ付きテンプレートリテラルへ書き換える。引数のシグネチャ（`stylesUri: string, scriptUri: string, nonce: string, cspSource: string`）と戻り値型 `string` は維持する。

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

呼び出し元（`src/webview-provider.ts` の `_getHtml`）はファイル拡張子の差異だけで、import path とシグネチャは変わらない。

#### tsconfig

`tsconfig.json` の `"jsx": "react-jsx"` を削除する。残りの設定は維持する。

### 依存の整理

#### root `package.json`

- `dependencies` から削除: `react`, `react-dom`
- `dependencies` に追加: `"shared": "*"`
- `devDependencies` から削除: `@types/react`, `@types/react-dom`, `eslint-plugin-react`
- `valibot` は extension 側でも直接使用しているため `dependencies` に維持
- `workspaces: ["packages/*"]` は現状維持（`packages/shared` が `*` グロブで自動的に拾われる）

#### `packages/webview/package.json`

- `dependencies` に追加: `react`, `react-dom`, `"shared": "*"`
- `devDependencies` に追加: `@types/react`, `@types/react-dom`
- `valibot` は本 spec のスコープ外。現状通りルートからの hoisting で暗黙参照のままとする
- 既存のパッケージ（vite/three/tailwind/base-ui 系等）は現状維持

### バージョン整合

`react` / `react-dom` / `@types/react` / `@types/react-dom` の version 指定は、移動の際にルートで使われていた指定（`react`/`react-dom` は `^19.0.0`、型は `@types/react ^19.0.8` / `@types/react-dom ^19.0.4`）をそのまま webview 側にコピーする。

## 検証順序

1. `packages/shared/` 作成（`package.json` / `src/index.ts` / `src/message.ts`）。`message.ts` の内容は webview から物理コピー
2. `npm install` を実行し、ワークスペースに `shared` が認識され `node_modules/shared` が symlink として作成されることを確認
3. import 書き換え 3 箇所（extension 1 箇所、webview 2 箇所）。書き換え後、旧 `packages/webview/src/models/message.ts` を削除
4. `npm run check-types` が通ることを確認
5. `get-webview-html.tsx` を `.ts` に rename し、`String.raw` テンプレ実装に書き換え
6. `tsconfig.json` から `"jsx": "react-jsx"` を削除
7. root `package.json` から `react` / `react-dom` / `@types/react` / `@types/react-dom` / `eslint-plugin-react` を削除し、`"shared": "*"` を追加
8. `packages/webview/package.json` に `react` / `react-dom` / `"shared": "*"` を deps、`@types/react` / `@types/react-dom` を devDeps として追加
9. `npm install` で hoisting/重複が想定通りであることを確認（`node_modules/react` がリポジトリルートに 1 つだけ存在すること）
10. `npm run compile` が通ることを確認
11. `npm run package` が通り、`dist/extension.js` のバンドルサイズが減少していることを確認（`react-dom/server` が消えた分）
12. F5 で Extension Development Host を起動し、webview が正しく描画されること、postMessage 経由のメッセージ（`mounted` / `loadAssetsUri` / `updateVrm` / `updateIssuesCount`）が往復することを実機確認

## 影響を受けないもの

- `vsce` の実行方法（ルートで実行のまま）
- `.vscodeignore` の内容
- `esbuild.js` の設定
- `packages/webview/vite.config.ts` の設定
- CI ワークフロー（`.github/workflows/`）
- `lefthook.yml` / `oxlintrc.json` / `.oxfmtrc.json`
- README.md / CHANGELOG.md / LICENCE / icon.png の所在
- `extensionUri` 起点のリソース解決パス（`packages/webview/dist/...`）

## ロールバック条件

実装後の検証で以下のいずれかが起きた場合はロールバックする：

- `npm install` が hoisting の問題で失敗する
- バンドルが壊れる、または extension が webview の import を解決できない
- 拡張ホストで webview が描画されない、または postMessage が機能しない
