# Phasmophobia Map Roulette

Phasmophobia のマップを条件付きでランダムに選ぶ Web ツールです。
ゲーム内のランダム選択ではできない「サイズで絞る」「特定マップを除外する」「直近の結果を避ける」ができます。
OBS のブラウザソースでそのまま表示できます。

## 機能

- マップ単位 / サイズ（小・中・大）単位で対象を ON/OFF
- 直近 N 回の結果を除外、または「全マップ一巡するまで」除外（一巡したら自動で最初から）
- カスタムマップの追加（アップデートで追加された新マップなど）
- 回転時間の調整、履歴表示
- ダークモード / ライトモードの切り替え（初期値はダークモード）
- 日本語 / 英語の切り替え（初期値はブラウザの言語設定で自動判定）
- ページ下部に X / Twitch / YouTube へのリンク
- 設定・履歴はブラウザ（localStorage）に保存
- OBS 用オーバーレイ表示（透過 / グリーンバック / 黒、3 行 / 1 行、見出し文字）
- キーボード操作：スペース or Enter で回す
- 一度開けば、回線が切れても表示できる（OBS のオーバーレイ向け）

## 開発

### 必要なもの

- Node.js 20.19 以上、または 22.12 以上（GitHub Actions では 24 を使用）

### コマンド

```sh
npm install      # 初回のみ。依存パッケージをインストール
npm run dev      # 開発サーバー起動（http://localhost:5173/）。保存すると画面に即反映
npm run build    # 公開用ファイルを dist/ に出力
npm run preview  # dist/ の中身をローカルで確認（http://localhost:4173/）
npm test         # 抽選ロジックと文言のテスト
```

`dist/` は `base: './'`（相対パス）で出力するので、GitHub Pages のサブパスでもそのまま動きます。

### ファイル構成

```
index.html                  エントリ（テーマ・オーバーレイのチラつき防止スクリプトもここ）
vite.config.js              ビルド設定（オフライン対応・SNS 共有画像のタグ追加）
public/og-image.png         SNS 共有画像（1200×630）
public/third-party-licenses.txt  同梱しているライブラリ・フォント・アイコンのライセンス
src/
  main.js                   Vue アプリの起動
  App.vue                   画面全体と「回す」処理
  style.css                 スタイル（ダーク / ライトの色もここ）
  config.js                 SNS リンクの URL
  i18n/messages.js          画面の文言（日本語 / 英語）
  i18n/messages.test.js     訳し忘れ・マップ一覧のチェック
  data/maps.js              マップ一覧
  lib/roulette.js           抽選ロジック（除外・一巡モード・リールの並び）
  lib/roulette.test.js      抽選ロジックのテスト
  lib/view.js               URL パラメータ（オーバーレイ表示かどうか）
  composables/useSettings.js  設定・履歴の状態と localStorage 保存
  composables/useSync.js      操作画面 ⇔ OBS オーバーレイの同期
  composables/useI18n.js      表示言語の判定と文言の取り出し
  components/
    AppHeader.vue           タイトル・言語 / テーマ切り替え
    RouletteReel.vue        ルーレットのリールとアニメーション
    MapSelector.vue         対象マップの選択・カスタムマップ
    OptionsPanel.vue        除外設定・回転時間・履歴
    ObsSettings.vue         OBS 用 URL の作成
    AppFooter.vue           SNS リンク
    controls.js             操作画面だけで使う部品（オーバーレイでは読み込まない）
.github/workflows/deploy.yml  テスト → ビルド → GitHub Pages への自動デプロイ
.github/dependabot.yml        依存パッケージ・Actions の更新 PR を月 1 回作成
```

## GitHub Pages で公開（GitHub Actions で自動デプロイ）

`main` ブランチに push するたびに、GitHub Actions がテスト → ビルド → GitHub Pages への公開を行います。
テストが失敗した場合は公開されません。

## OBS での使い方

### おすすめ構成：ドックで操作 + ブラウザソースで表示

1. 操作画面の「OBS 用設定」で背景・行数・見出しを選び、**オーバーレイ URL をコピー**
2. OBS の「ソース」→「＋」→「ブラウザ」を追加し、URL に貼り付け
   - 幅 800 / 高さ 300（1 行表示なら 800×120 程度）
3. OBS メニュー「ドック」→「カスタムブラウザドック」で、**操作画面の URL**（`?view=overlay` なしの URL）を追加
4. ドックの SPIN を押すと、配信画面のオーバーレイも同じ結果でアニメーションします

ドックとブラウザソースは OBS 内の同じブラウザ環境で動くので、BroadcastChannel / localStorage で結果を共有する仕組みです。
うまく同期しない場合は、下の「ドックを使わない場合」の方法で操作してください。
（普段使いの Chrome などで開いた操作画面と、OBS 内のオーバーレイは同期しません）

グリーンバック背景では、クロマキーで抜きやすいよう当選ラインの帯を塗らずに線だけ表示します。

### ドックを使わない場合

ブラウザソースを右クリック →「対話」を開き、オーバーレイ部分をクリックすると回ります。
対象マップなどの設定は、ドックかブラウザソースの「対話」で操作画面を開いて変更してください（同じ OBS 内で保存が共有されます）。

### オーバーレイ URL のパラメータ

| パラメータ | 値 | 説明 |
| --- | --- | --- |
| `view` | `overlay` | オーバーレイ表示にする（必須） |
| `theme` | `dark` / `light` | テーマ（オーバーレイの文字はどちらでも白） |
| `lang` | `ja` / `en` | 言語（サイズ表示が「小 / 中 / 大」か「S / M / L」になる） |
| `bg` | `transparent` / `green` / `dark` | 背景 |
| `rows` | `3` / `1` | 前後のマップも表示するか |
| `title` | 任意の文字列 | 見出し。空にすると非表示 |

## マップ一覧の更新

`src/data/maps.js` に 1 行追加するだけです。`size` は `S`（小）/ `M`（中）/ `L`（大）。

```js
{ id: 'new-map', name: 'New Map Name', size: 'M' },
```

非公式のファンメイドツールです。Phasmophobia は Kinetic Games の商標です。
