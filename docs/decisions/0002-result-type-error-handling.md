# 0002. 想定内のエラーを Result 型で表し、握りつぶしを lint で検出する

- Status: Proposed
- Date: 2026-11-18

## Context

拡張機能 (`src/`) と webview (`packages/webview/src`) のエラーは、throw・try/catch・Promise の reject・valibot の `safeParse` が混在していた。
調査時点 (main `64771fc`) のエラー経路は次のとおり。

| 場所                                                   | 発生                                                              | 処理                                                           | 問題                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `src/utils/get-local-vrm-path.ts`                      | `fs.stat` の reject と、try 内の自前 `throw`                      | `catch {}` で通知して `undefined` を返す                       | 原因 (未設定/相対パス/不存在/非ファイル) が消える        |
| `src/extension.ts`                                     | 上記の `undefined`                                                | 未設定の通知を呼び出し側で別途判定 (2 箇所で重複)              | 通知の判断が util と呼び出し側に分散                     |
| `src/webview-provider.ts` 受信                         | `v.safeParse` 失敗                                                | `if (!msg.success) return;`                                    | 不正メッセージを無言で捨てる                             |
| `src/webview-provider.ts` 送信                         | `v.parse` の throw                                                | 未処理 (VS Code のコールバックまで伝播)                        | 型で保証済みでも、失敗がコールバック経由でアプリを止める |
| `webview/utils/get-vrm-from-gltf.ts`                   | VRM が無い glTF で `throw new Error`                              | `loadCompanion` の `.catch` → `String(error)` で拡張機能へ送信 | エラー種別が文字列化で失われる                           |
| `webview/utils/use-vrm-companion.ts`                   | `GLTFLoader.loadAsync` の reject、`vrmAnimations[0]` が undefined | 同上                                                           | アニメーション欠落は後続の例外としてしか現れない         |
| `webview/utils/load-companion.ts`                      | 上記の reject                                                     | アニメーションだけ自前の `{ ok: true as const, value }` に変換 | 局所的な Result もどきが既に生まれていた                 |
| `webview/utils/vscode.ts` `getState`                   | `JSON.parse` の throw (dev の localStorage)                       | 未処理 (`useState` 初期化で React まで伝播)                    | 壊れた localStorage で描画ごと落ちる                     |
| `webview/utils/use-settings.ts` / `use-backgrounds.ts` | `v.safeParse` 失敗                                                | warn して `{}` (同一関数が 2 ファイルに重複)                   | 重複                                                     |
| `webview/utils/use-vscode-messages.ts`                 | `v.safeParse` 失敗                                                | `console.error` して return                                    | —                                                        |
| `webview/utils/env.ts`                                 | `v.parse` の throw (モジュール初期化時)                           | 未処理                                                         | ビルド設定の誤り。throw のまま                           |
| `src/extension.ts` `activate`                          | `setup` の reject                                                 | VS Code が activation 失敗として扱う                           | 境界。throw のまま                                       |

呼び出し側から見て失敗の有無と種類が型に現れないため、「catch して捨てる」「`undefined` で返して理由を失う」が起きやすかった。

## Decision

### 1. Result 型と置き場所

`packages/shared/src/result.ts` に置き、`shared` から再エクスポートする。
拡張機能 (esbuild) と webview (Vite) の双方が既に `shared` を依存に持つため、新しいパッケージは作らない。

```ts
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export function ok<T>(value: T): Result<T, never>;
export function err<E>(error: E): Result<never, E>;
export function fromPromise<T, E>(
  promise: PromiseLike<T>,
  mapError: (cause: unknown) => E,
): Promise<Result<T, E>>;
```

ヘルパーはこの 3 つに限る。
`fromPromise` は reject する外部 API (`fs.stat`, `GLTFLoader.loadAsync`) を Result に変換する唯一の定型処理で、これが無いと各所に同じ try/catch が並ぶため入れた。
`map` / `andThen` / `unwrapOr` などは入れない。
現状の呼び出し側はすべて `if (!r.ok) return r;` の早期 return で書けており、合成関数は読み手に追加の語彙を要求するだけになる。

valibot との接続として `packages/shared/src/validate.ts` に `validate(schema, input): Result<Output, ValidationError>` と `describeValidationError` を置いた。
`v.safeParse` の `success/output/issues` と Result の `ok/value/error` が混在すると、どちらの形かを毎回確認する必要があるため、境界で一度だけ変換する。

### 2. エラー型 E の方針

- `type` を判別子にした文字列リテラルの判別可能ユニオンにする。Error のサブクラスは作らない。
  - postMessage で webview と拡張機能をまたいでもそのまま構造化複製できる。
  - `typescript/switch-exhaustiveness-check` で網羅性を検査できる。
- 外部の例外を包むときは `cause: unknown` に元の値を残す。
- エラー型はそれを返す関数の隣に置き、ドメインごとに分ける。
  - `VrmPathError` (`src/utils/get-local-vrm-path.ts`): `notSet` / `notAbsolute` / `notFound` / `notAFile`
  - `CompanionLoadError` (`packages/webview/src/models/companion-load-error.ts`): `fetchFailed` / `notVrm` / `notVrmAnimation`
  - `StorageError` (`packages/webview/src/utils/vscode.ts`): `corruptedStorage`
  - `ValidationError` (`shared`): `invalidSchema`
  - `UnexpectedError`: `unexpected`。`loadCompanion` が受け取ったコールバックの予期しない reject を受け止めるためだけに使う。

### 3. Result にするもの、throw のままにするもの

Result にするのは「正しく動くプログラムでも起こる失敗」 (ユーザー入力・ファイル・ネットワーク・外部データ) に限る。
次は throw のままにする。

| 箇所                                             | 理由                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `activate` / VS Code のイベントコールバック      | VS Code API がコールバックの戻り値を見ないため、Result を返しても誰も受け取らない。境界内で Result を解いて通知する |
| `packages/webview/src/utils/env.ts` の `v.parse` | ビルド時の環境変数の誤り。起動直後に落ちるのが最も早く気付ける                                                      |
| React のレンダリング・`useFrame`                 | React はエラーを throw で Error Boundary に伝える設計。描画関数から Result を返す手段が無い                         |
| `src/test/`、`scripts/*.cjs`                     | テストと開発スクリプトは失敗＝中断でよい                                                                            |
| パフォーマンスログの `appendFileSync`            | 開発時のみ (`VRM_PERFORMANCE_LOG` 指定時) 動く計測用コード。失敗は計測者に即座に見えるべき                          |

### 4. 移行したもの

- `getLocalVrmPath` → `Promise<Result<string, VrmPathError>>`。通知は呼び出し側の `notifyVrmPathError` に一本化し、設定変更時は古いリクエストの結果を通知しないようにした。
- `getVrmFromGltf` → `Result<VRM, { type: "notVrm" }>`。
- `loadCompanion` の `loadModel` / `loadAnimation` → `Promise<Result<_, E>>`。自前の Result もどきを廃止。
- `useVrmCompanion` の glTF 取得を `fromPromise` で `fetchFailed` に、アニメーション欠落を `notVrmAnimation` に変換し、`describeCompanionLoadError` で拡張機能へ送る文言を組み立てる。
- `vscode.getState` → `Result<unknown, StorageError>`。`use-settings` / `use-backgrounds` の重複した `loadState` を `utils/load-state.ts` に統合。
- valibot の `safeParse` 4 箇所 → `validate`。拡張機能側の受信で無言だった不正メッセージは `console.warn` するようにした。
- 拡張機能側の送信 (`WebviewProvider.postMessage`) の `v.parse` → `validate`。型で保証済みの値でも、throw は VS Code のイベントコールバックを途中で止め、後続のメッセージ (`sendState` の残り) まで送られなくなる。webview 側の `vscode.postMessage` と同じく、ログを出してそのメッセージだけ送らない。
  `postMessage` 自体は Result を返さない。呼び出し元はすべてイベントコールバックで、受け取っても打てる手が無いため。

### 5. lint ルール

`lint/oxlint-plugin-result/` に oxlint の JS プラグイン (`result/*`) を作り、`.oxlintrc.json` の `jsPlugins` で読み込む。
テストは `oxlint/plugins-dev` の `RuleTester` を `node:test` で動かす (`npm run test:lint-rules`、`pretest` にも追加)。

throw する層:

| ルール                               | 検出するもの                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `result/no-swallowed-error`          | 空の catch、catch 変数を使わず rethrow も `err()` もしない catch、同様の `.catch()` / `.then(_, h)`          |
| `result/no-throw-in-result-function` | 戻り値が `Result` / `Promise<Result>` と注釈された関数、または `ok()` / `err()` を直接返す関数の中の `throw` |

Result を受け取る層:

| ルール                    | 検出するもの                                                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `result/no-unused-result` | Result を返す関数の呼び出しを式文で捨てる (`f();` / `await f();`)。意図的に捨てる場合は `void f()`                                                                                 |
| `result/handle-error`     | Result を受けた変数で `.ok` / `.value` しか読まず、`.error` も Result 自体の受け渡しも無い (`if (!r.ok) return;` や `r.ok ? r.value : fallback`)。`error` を含まない分割代入も検出 |

併せて有効化した組み込みルール:

| ルール                                                                                                               | 役割                                                                                |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `typescript/no-floating-promises` (type-aware)                                                                       | `Promise<Result>` を await せず捨てるケース。型情報で全モジュールを正確に判定できる |
| `typescript/switch-exhaustiveness-check` (type-aware)                                                                | エラーユニオンの `switch` で分岐漏れを検出                                          |
| `typescript/only-throw-error`, `prefer-promise-reject-errors`, `use-unknown-in-catch-callback-variable` (type-aware) | throw のまま残す境界で、投げる値と受ける値の型を揃える                              |
| `typescript/ban-ts-comment`                                                                                          | 判別ユニオンの絞り込みを `@ts-ignore` で回避させない                                |
| `no-empty`, `no-useless-catch`, `preserve-caught-error`                                                              | catch の基本的な誤用。rethrow 時の `cause` 付与                                     |

「`ok` を確認せずに `value` を参照する」は lint ルールを作らなかった。
判別ユニオンなので TypeScript 自身がコンパイルエラーにする。
この保証が崩れないことを `src/test/result-types.ts` の `@ts-expect-error` で `check-types` に固定した。

## Consequences

### JS プラグインの限界

oxlint の JS プラグインは型情報を参照できない (公式ドキュメントの "Not supported yet: Lint rules that rely on TypeScript type-awareness")。
そのため `result/*` は構文ベースの近似で、次を取りこぼす。

- 「Result を返す関数」の判定は、同一ファイルの宣言 (注釈付き、または `ok()` / `err()` / 既知の Result 関数を返すもの) と、import 先ファイルのテキストから読める **戻り値型を注釈した export** に限る。注釈の無い export、オブジェクトのメソッド、高階関数の戻り値、コールバック引数 (`loadModel` など) は判定できない。
- 名前で照合するため、同名の別関数によるシャドーイングは区別しない。
- `handle-error` は Result 関数の呼び出しで初期化された変数と、`Result<...>` と注釈された引数だけを対象にする。
- `.error` を読んでいれば処理したとみなす。読んだ後に捨てていても検出しない。

これらは type-aware な既存ルールで部分的に補っている (`no-floating-promises` が非同期の Result 関数を全モジュール横断で検出する)。
同期の Result 関数の戻り値無視を型で正確に検出する既存ルールは oxlint / tsgolint に無く、限界として残る。
oxlint が JS プラグインに型情報を提供した時点で、`no-unused-result` と `handle-error` を型ベースに置き換える。

### その他

- 別 issue に切り出したもの:
  - VRM パス未設定時の警告表示。現状は `notSet` を既存の情報通知に流しているだけで、webview 側の表示は無い。
  - React の Error Boundary。描画中の例外 (WebGL コンテキスト取得失敗など) の受け皿が無い。

- `throw` のまま残す境界を明文化したので、新しいコードで迷ったら「正しいプログラムでも起こるか」で判断する。
- 意図的にエラーを捨てる場合は `// oxlint-disable-next-line result/<rule> -- 理由` を書く。理由の無い抑制はレビューで差し戻す。

## 採用しなかった案

| 案                                                                                                           | 理由                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| neverthrow / byethrow などの Result ライブラリ                                                               | メソッドチェーン中心の API と独自の型で、この規模では語彙の追加に見合わない。webview バンドルへの依存も増える。0001 で依存削減を選んだ方針とも合わない |
| `map` / `andThen` / `match` などのユーティリティ                                                             | 早期 return で足りている。必要になった時点で追加する                                                                                                   |
| Error サブクラスで種別を表す                                                                                 | postMessage の構造化複製でプロトタイプが失われる。`instanceof` 判定は網羅性検査できない                                                                |
| すべての throw を禁止する                                                                                    | VS Code / React の境界では throw が API の前提で、禁止すると境界ごとに抑制コメントが要る                                                               |
| `typescript/explicit-module-boundary-types` で export の戻り値注釈を必須にし、クロスファイル判定を確実にする | React コンポーネントを含む全 export に注釈が要り、変更量に対して得るものが少ない。必要なら将来 `overrides` で `utils/` に限って有効化する              |
| JS プラグインで import 先を正式にパースする                                                                  | プラグインから使える TS パーサが同梱されていない。テキスト走査で注釈付き export に絞った                                                               |
