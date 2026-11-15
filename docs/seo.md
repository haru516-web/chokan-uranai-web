# 公開ページと検索向けの設定

アプリ本体（`index.html`、URLは `/` のまま）は変えず、検索向けの静的ページを、同じビルドの中で一緒に書き出します。

## 出るページ

| URL | 中身 | 検索 |
|---|---|---|
| `/` | アプリ本体。JavaScriptなしの案内、canonical、OGP、WebSiteの構造化データを足す | 出す |
| `/questions/` | 24問の一覧。読み物のある6問は静的ページへ、ほかはアプリ（`/?question=Q02` など）へ | 出す |
| `/questions/q01/` ほか5問 | 原文（`src/questions.json`）に、補足原稿（`content/question-extensions.json`）を添えた読み物 | 出す |
| `/types/` | 16のタイプ（季節×深さ）の一覧 | 出す |
| `/about/` | このサイトについて（できること・考え方） | 出す |
| `/privacy/` `/terms/` `/tokushoho/` `/refund/` | プライバシーポリシー・利用規約・特定商取引法に基づく表記・返金の方針（`scripts/site/legal.mjs`） | 出さない |
| `/404.html` | 404ページ | 出さない |
| `/sitemap.xml`・`/robots.txt` | 本番のビルドだけ | — |

文章は、アプリと同じ原文（`src/questions.json`、`src/residents.json`）と `content/question-extensions.json` から作ります。カテゴリと、読み物のある問いの一覧は `src/siteMeta.json` が正本で、アプリ（`voyage.ts`）と共有しています。

## 検索に出す設定は、本番のビルドだけ

| 環境変数 | 意味 |
|---|---|
| `SITE_URL` | このビルドの公開URL（例 `https://haru516-web.github.io/chokan-uranai-web/`）。canonical・サイトマップ・OG画像に使う |
| `SITE_INDEX=1` | 検索に出す設定にする。ない場合は、全ページ `noindex, nofollow`、canonicalなし、サイトマップなし |

ブランチごとの確認用ページ（`/<ブランチ名>/`）は、この環境変数なしでビルドするので、必ず noindex になります。

## 公開の仕組み（`.github/workflows/pages.yml`）

- `main` を、サイトの根元（`/`）に、本番の設定でビルドします。
- 全ブランチを、これまでどおり `/<ブランチ名>/` に、確認用としてビルドします（noindex）。
- ブランチの一覧は `/branches/` に移しました（robots.txt で検索から外しています）。
- main が作れなかったときだけ、根元にブランチ一覧を置きます。
- `public/` に置いたファイル（Search Console の所有権確認ファイルなど）は、ビルドのときに、各ビルドの根元にそのまま入ります。本番のビルドなら、サイトの根元に出ます。

## 手元で確認する

```powershell
npm run dev                         # 静的ページも、同じURLで見られる（/questions/q01/ など）
npm run build; npm run check:site   # 確認用の設定で、ビルドと検査
```

本番と同じ設定で検査する場合：

```powershell
$env:SITE_URL = "https://haru516-web.github.io/chokan-uranai-web/"; $env:SITE_INDEX = "1"
npm run build; npm run check:site
```

`check:site` は、全ページの title・description・robots・canonical、内部リンクの実在、24問・16タイプの掲載、原文の一致、サイトマップの中身、使わない言葉（自己診断など）を検査します。

## 文面を変えるとき

- タイトル・説明文に、「無料の〜」と書かないでください（有料版を始めると、事実と合わなくなります）。検査で止まります。
- 運営者の情報（`/about/`・`/privacy/`）は、公開の準備ができたら、書き換えてください。
- 新しいタブや機能を足したら、`/about/` の「できること」も更新してください。

## 法的ページ（有料版を始める前に）

- 運営者の氏名・住所・電話・メール、制定日、管轄の裁判所は、`content/legal.json` に入れます。空欄のところは、ページに赤い「【未記入：…】」の印で出ます。
- 月額（`plan.monthlyYen`）は、特定商取引法の表記・利用規約・返金の方針が同じ値を使います。
- 有料版の公開前に、`LAUNCH=1 npm run check:site` を通してください。未記入が残っていると止まります。
- 文面は、実際の作り（Stripe決済、メールでの本人確認、1か月ごとの自動更新、解約は管理ページ、返金は例外のみ）に合わせた下書きです。公開前に、専門家の確認を受けてください。
- アプリの「記録・設定」画面に、4つのページへのリンクがあります。申込みの画面にも、同じリンクと、金額・自動更新・解約方法の表示を置いてください（決済をつなぐときに）。
