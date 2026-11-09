# 変更前と最終版の比較

2026-11-09、同じ検証コード・起動条件で変更前と最終URI版を測定した。
モデルはユーザー配置のVRM_NekoUmiushi.vrm（1,049,112 bytes）。
変更前→最終版を交互に3セット実行し、各プロセスで初期表示1回と検索→Explorerの往復10回を測定した。
全6プロセスは終了コード0。

| 対象              | 変更前の中央値 | 最終版の中央値 | 短縮時間 | 短縮率 | 速度比 |
| ----------------- | -------------: | -------------: | -------: | -----: | -----: |
| 初期表示（各3回） |       266.79ms |       243.03ms |  23.76ms |   8.9% | 1.10倍 |
| 再表示（各30回）  |       152.61ms |        21.91ms | 130.70ms |  85.6% | 6.97倍 |

| 再表示 |     変更前 |  最終版 |
| ------ | ---------: | ------: |
| p95    |   669.35ms | 29.13ms |
| 最大   | 1,116.68ms | 30.09ms |

初期表示の範囲は変更前202.87〜296.60ms、最終版217.29〜275.83ms。
初期表示は回数が少なく、分布も重なるため、8.9%を一般的な改善率として保証する結果ではない。
再表示では中央値と遅い回の双方が改善した。

## 比較条件

- 変更前：44ea49193c8e3cb72331d755b413f107cbccb887の起動処理、モデルロード処理、メッセージ受信処理。
- 最終版：eb39e98a91e2c009679858ba8b5abf663327446f。
- macOS 27.0.1 arm64、VS Code 1.145.2。
- 両版で同じ開始点と、VRMを含むrenderer.render後の応答を計測。
- 共通のscripts/compare-vrm-performance.cjsで操作し、毎回新規のユーザーデータ・空の拡張ディレクトリで起動。
- OSのファイルキャッシュやGPUキャッシュは明示的に消していない。

変更前の検証コピーには、旧版を識別するモデルロード処理を変えずに、描画応答と可視化通知の計測処理だけ追加した。
コピーのnode_modulesは元リポジトリへのリンクだが、共有メッセージ型は検証コピー内の旧型へ明示的に解決してビルドした。
これにより、最終版のURI用共有型が変更前のbase64方式へ混ざることを避けた。

初期表示の開始点はresolveWebviewView、再表示の開始点はonDidChangeVisibility。
終点はExtension Hostが描画処理後の応答を受信した時点。
拡張起動・Provider作成前のファイル読込やstat、入力から可視化通知まで、GPU・OSによる表示完了は含まない。
今回の比較は全変更の効果であり、URI化単独の効果を切り分けたものではない。
以前の個別測定値と混ぜず、最終的な変更前後比較には本書の値を使う。

## 再現用の共通ハーネス

ビルド済み検証コピーが共通の描画計測メッセージとJSONLログを実装している状態で、次のように実行できる。
通常のユーザー設定は変更しない。

```sh
export VSCODE_EXECUTABLE_PATH='/Applications/Visual Studio Code.app/Contents/MacOS/Code'
export VRM_MODEL_PATH='/absolute/path/to/model.vrm'
export VRM_EXTENSION_PATH='/absolute/path/to/instrumented-extension'
export VRM_PERFORMANCE_LOG="$(mktemp /tmp/vrm-comparison.XXXXXX)"
node scripts/run-vscode-verification.cjs scripts/compare-vrm-performance.cjs
```

VRM_EXTENSION_PATHを省略すると、このリポジトリの最終版を測定する。
生データと集計値はvrm-final-comparison.jsonに保存した。
各回の11件の先頭が初期表示、残りの10件が再表示。

URI方式の状態同期・資源解放などの回帰検証は [vrm-uri-verification.md](vrm-uri-verification.md) を参照。
