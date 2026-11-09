# VRM再表示の実機検証

2026-11-09、macOS上のVS Code Extension Development Hostで実施。
ユーザー配置の `VRM_NekoUmiushi.vrm`（1,049,112 bytes）を使用。
モデルはリポジトリへコピーしていない。

## 結果

検索サイドバー→Explorerを30回往復し、最終画面でモデルの表示を確認した。
同一Webviewで初回描画の記録が増えず、resume:1〜30が記録された。

| 可視化通知→描画応答 |    ms |
| ------------------- | ----: |
| 最小                | 10.51 |
| 中央値              | 13.57 |
| p95（nearest rank） | 22.38 |
| 最大                | 22.47 |

30/30回で300ms以下。生データは `vrm-performance-results.json`。

Extension HostのonDidChangeVisibilityから、Webviewでモデルを含む
renderer.renderが返った後の応答受信までを、Hostのperformance.nowで計測した。
GPU完了・OSコンポジタによる表示完了、入力から可視化通知までの時間は含まない。
したがって、操作から実際の画面表示まで300ms以内という厳密な保証ではない。
スクリーンショットで描画は確認したが、高速動画によるフレーム単位の検証は未実施。
変更前の同条件の基準値も未計測。

initialの約51〜58msはModelコンポーネントのマウントから描画送信まで。
Webview起動、JS読込、モデル転送前の時間を含まないので初回起動時間として扱わない。

## 再現

1. npm run compileを実行。
2. extensionDevelopmentPathをこのリポジトリにしてVS Codeを起動。
3. 検証用ワークスペースのvrm-companion-vscode.vrmFilePathにローカルVRMを設定。
4. Explorerのvrm-companionを開き、モデルの描画を待つ。
5. Cmd+Shift+FとCmd+Shift+Eで検索とExplorerを往復。
6. 出力の「VRM Performance」ログのhostElapsedを集計。

ウィンドウ再読込でもモデル表示を確認済み。
長時間非表示、設定切替・ファイル削除・VRMA失敗・メモリやCPU負荷の回帰検証は未実施。
型チェック、lint、Webview/拡張ビルドは成功。既存lint警告3件、bundleサイズ警告あり。

## URI化の実装状況

上記の実機測定はbase64方式での測定結果。
その後、ローカルVRMをasWebviewUriで渡す方式へ変更し、非表示時のframeloop停止と復帰時の状態同期を追加した。
URI化後の型チェック・lint・ビルドは成功。URI化後の実機性能測定と回帰テストは次の検証段階で行う。
