# 0001. スキーマバリデーションを zod から valibot に移行

- Status: Accepted
- Date: 2026-05-03

## Context

webview と extension 双方でメッセージ/状態スキーマの検証に `zod` を使用していた。
zod は単一エクスポートで tree-shake が効かず、バンドルへ全体が含まれる。
本拡張は VS Code の Explorer ビューで動く webview を含み、3D描画ライブラリ群 (three.js, @pixiv/three-vrm) で既にバンドルが大きいため、依存ペイロードの削減余地を検討した。

候補として valibot を評価した。API は関数ベース (`v.parse(schema, value)`) で zod のメソッドチェーンとは形が異なるが、必要な機能 (object/union/literal/array/optional/default/infer/safeParse) は全てカバーされる。

## Decision

`zod` を削除し `valibot` に置き換える。

### API 対応

| zod                                                                                                      | valibot                              |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `z.object` / `z.string` / `z.number` / `z.boolean` / `z.array` / `z.union` / `z.literal` / `z.undefined` | `v.object` / `v.string` / ... (同名) |
| `schema.parse(v)`                                                                                        | `v.parse(schema, v)`                 |
| `schema.safeParse(v)`                                                                                    | `v.safeParse(schema, v)`             |
| `result.data`                                                                                            | `result.output`                      |
| `result.error`                                                                                           | `result.issues`                      |
| `.optional()`                                                                                            | `v.optional(schema)`                 |
| `.default(x)`                                                                                            | `v.optional(schema, x)`              |
| `z.infer<typeof S>`                                                                                      | `v.InferOutput<typeof S>`            |

### 影響範囲

スキーマ定義 (3ファイル):

- `packages/webview/src/models/state.ts`
- `packages/webview/src/models/message.ts`
- `packages/webview/src/utils/env.ts`

スキーマ消費側 (5ファイル):

- `src/webview-provider.ts`
- `packages/webview/src/utils/vscode.ts`
- `packages/webview/src/utils/use-vscode-messages.ts`
- `packages/webview/src/utils/use-settings.ts`
- `packages/webview/src/utils/use-backgrounds.ts`

依存:

- ルート `package.json` の `dependencies` から `zod` を削除し `valibot` を追加。

## Consequences

### バンドルサイズ削減

production ビルド (`npm run package`) で前後比較した結果:

| バンドル                              |         zod |     valibot |      差分 | 削減率 |
| ------------------------------------- | ----------: | ----------: | --------: | -----: |
| webview `dist/assets/index.js` (raw)  | 1,413.40 kB | 1,357.32 kB | −56.08 kB | −3.97% |
| webview `dist/assets/index.js` (gzip) |   391.01 kB |   378.02 kB | −12.99 kB | −3.32% |
| extension `dist/extension.js` (raw)   |      568 kB |      513 kB |    −55 kB | −9.68% |

両バンドル合計で生サイズ約 **111 kB** 削減。
VS Code 拡張機能はローカル展開のため gzip 値はネットワーク配信に効かないが、`.vsix` パッケージサイズと拡張機能ロード時のパース時間に raw サイズが効く。

### トレードオフ

- API 形式がメソッドチェーンから関数呼び出しに変わるため、新規スキーマ追加時の書き味が異なる。
- `safeParse` の戻り値プロパティ名 (`data` → `output`、`error` → `issues`) を意識する必要がある。
- valibot は zod に比べエコシステム/ドキュメント量が小さい。複雑な変換 (transform/refine 相当) を導入する場合は API 差分の確認が必要。

### 計測手順 (再現用)

```bash
# Before/After 切り替えて npm run package を実行し
# packages/webview/dist/assets/index.js と dist/extension.js のサイズを比較する
git stash -u && npm install
npm run package
ls -lh packages/webview/dist/assets/ dist/
git stash pop && npm install
npm run package
ls -lh packages/webview/dist/assets/ dist/
```
