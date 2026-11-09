# 変更前後の実機比較

最新のURI方式の検証結果は [vrm-uri-verification.md](vrm-uri-verification.md) を参照。

2026-11-09、同じmacOS・インストール済みVS Code・ローカルVRMで測定。
モデル：VRM_NekoUmiushi.vrm（1,049,112 bytes）。モデル自体は保存・コピーしていない。

| 対象     | 変更前の中央値 | 変更後の中央値 |       差 | 短縮率 |
| -------- | -------------: | -------------: | -------: | -----: |
| 初期表示 |       318.78ms |       290.92ms |  27.86ms |   8.7% |
| 再表示   |       156.70ms |        21.61ms | 135.09ms |  86.2% |

再表示は中央値で約7.25倍高速化。

| 対象     | 条件 | 回数 |     最小 |      p95 |      最大 |
| -------- | ---- | ---: | -------: | -------: | --------: |
| 初期表示 | 前   |    3 | 297.30ms |        — |  328.53ms |
| 初期表示 | 後   |    3 | 257.10ms |        — |  308.50ms |
| 再表示   | 前   |   30 | 136.48ms | 769.92ms | 1176.32ms |
| 再表示   | 後   |   30 |  11.91ms |  30.11ms |   30.34ms |

再表示は変更後30/30回が300ms以下。初期表示は変更後でも1/3回が300msを超えた。
初期表示は標本が少なく、差が約28msと小さいため、安定した改善率の断定には追加測定が必要。

## 計測範囲

初期表示：WebviewProvider.resolveWebviewViewの開始から、VRMを含むrenderer.renderが返った後の応答受信まで。
再表示：onDidChangeVisibilityによる可視化通知から、同じ描画応答受信まで。
Extension Hostのperformance.nowを両端に用い、プロセス間の時計差を避けた。

初期表示にはHTML生成、Webview内のJS起動、モデルメッセージ受信、VRM解析と描画送信が含まれる。
拡張の起動と、Provider生成前に行うローカルファイル読込・base64化は含まない。
OSのGPU合成完了や画面表示完了、入力から可視化通知までの時間は含まない。
画面は先の実機検証で確認しているが、動画によるフレーム単位の計測ではない。
以前のinitial約51〜58msはModelマウント以降のみの値であり、今回の初期表示値と比較できない。

## 条件と手順

変更前はGit HEADのextension.ts、use-vrm-companion.ts、use-vscode-messages.tsを使った検証コピー。
変更後は作業ツリーの同じファイル。共通のProvider・Model・共有型に同じ計測処理を追加。
双方とも同じViteとesbuildでビルドし、別の一時ディレクトリへ配置した。
GitのコミットIDは同梱のcomparison-environment.jsonに記録。

変更前→変更後を3セット交互に実行。それぞれ専用の新規ユーザーデータでVS Codeを起動。
extensionTestsPathの検証コードが拡張をactivateし、モデルビューをfocus。
最初の描画応答を待ち、検索ビュー→300ms待機→Explorerを10回繰り返し、各応答を待った。
全6回の検証プロセスは終了コード0。
OSのファイルキャッシュやGPUキャッシュは明示的に消していない。
各初期表示は別のVS Codeプロセスだが、マシン全体としての完全なコールドスタートではない。
初回の予備測定（変更前1回＋再表示10回）は比較集計から除外した。

生データ：vrm-performance-comparison.json。
検証コード：../scripts/verify-vrm-performance.cjs。
このコードは検証コピーのProviderがVRM_PERFORMANCE_LOG相当のJSONLを出す構成で使用した。
検証用コピーは/private/tmp/vrm-compare-beforeと/private/tmp/vrm-compare-afterに存在する。
本リポジトリのProviderはVS CodeのVRM Performance出力チャンネルへ記録する。
