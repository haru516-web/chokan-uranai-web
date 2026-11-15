# Vercel で公開する（持ち主向けの手順）

このリポジトリを、Vercel で公開します。コードの中に、公開URLや秘密の値は、書いていません。コピーしたリポジトリでも、そのまま動きます。

## 1. リポジトリをコピーして、Vercel につなぐ

1. GitHub で、このリポジトリを、自分のアカウントにコピー（Fork）します。
2. Vercel で、Add New → Project → 自分のコピーしたリポジトリを選びます。
3. 設定は、自動で入ります（Framework: Vite、Build Command: `npm run build`、Output: `dist`、Node.js: 22系）。そのまま Deploy します。
4. 公開のURLは、`https://<プロジェクト名>.vercel.app/` です。独自ドメインを使うときは、Settings → Domains で追加します。

URLは、Vercel が渡す環境変数から、自動で決まります。

| 環境 | 検索に出すか | URL |
|---|---|---|
| Production（本番） | 出す（サイトマップ・canonical つき） | 本番のドメイン |
| Preview（ブランチ・プルリクエスト） | 出さない（noindex） | そのプレビューのURL |

独自ドメインを使うときに、サイトマップ・canonical のURLを、そのドメインにしたい場合は、環境変数 `SITE_URL`（例 `https://example.com/`）を入れてください。

## 2. 環境変数

Vercel の Settings → Environment Variables に、`.env.example` の項目を入れます。値は、リポジトリに書かないでください。

## 3. Stripe（有料版）

1. Stripe のアカウントを作り、まず、テストモードで進めます。
2. 商品カタログで、商品「潮環占い 有料版」を作り、価格を「定期支払い・月額450円」にします。その価格のID（`price_…`）を、`STRIPE_PRICE_ID` に入れます。
3. 開発者 → APIキーの、シークレットキー（`sk_test_…`）を、`STRIPE_SECRET_KEY` に入れます。
4. 設定 → 請求 → カスタマーポータルを有効にして、「サブスクリプションのキャンセル」を許可します（解約の管理ページになります）。
5. 商品名は、サイトの表記（content/legal.json の plan.name）と、そろえてください（今は「潮環占い プレミアム」）。
6. 本番に切り替えるときは、キーと価格のIDを、本番のものに入れ替えます。

## 4. 有料版を始める（スイッチ）

- 決済の設定（`STRIPE_SECRET_KEY`・`STRIPE_PRICE_ID`・`ENTITLEMENT_SECRET`）と、`VITE_BILLING=1` が、すべてそろうと、有料の枠が閉じて、購入できるようになります。
- 設定がそろうまでは、有料の枠は開いたままです（準備中の表示）。公開と、有料版の開始を、別々の日にできます。
- `VITE_BILLING` は、ビルドのときに読まれるので、入れたあとに、再デプロイしてください。
- 先に、Stripe のテストモードで、通しで試してください（テストカード 4242 4242 4242 4242）。

### Stripe のキーを、他の人に渡すとき

Stripe のアカウントの持ち主と、Vercel の持ち主が、別の人の場合は、**制限付きのキー（`rk_…`）**を使ってください。Stripe の開発者 → APIキー → 制限付きのキーを作成、で、次の権限だけを与えます。

| 権限 | 内容 |
|---|---|
| Checkout Sessions | 書き込み |
| Customer portal | 書き込み |
| Subscriptions | 読み取り |
| Customers | 読み取り |

このキーを、`STRIPE_SECRET_KEY` に入れます。漏れても、被害を小さくできます。

## 5. 販売事業者について（重要）

`content/legal.json` の販売事業者は、**実際に代金を受け取る人（Stripeのアカウントの持ち主）**にしてください。特定商取引法に基づく表記・利用規約・プライバシーポリシーの事業者が、決済の名義と食い違うと、問題になります。

## 6. 公開後の確認

- 有料版：`/api/config` が `{"billing":true,…}` を返し、Stripe のテストモードで、申込み → 有料の枠が開く → 管理ページで解約 → 枠が閉じる、が通ること
- `/`、`/questions/`、`/about/`、`/tokushoho/`、`/terms/`、`/privacy/`、`/refund/` が開くこと
- `/sitemap.xml`、`/robots.txt` が開くこと
- プレビューのページが、検索に出ない設定（`<meta name="robots" content="noindex, nofollow">`）になっていること
- GitHub Pages の自動公開は、止めています（二重に公開すると、検索で重複するため）。

## 手元で試す（Stripeのキーなし）

```powershell
$env:MOCK_STRIPE = "1"; npm run dev:api      # 偽物のStripeで動く確認用サーバー（http://127.0.0.1:5181）
$env:VITE_BILLING = "1"; npm run dev          # 別の画面で。/api は、上のサーバーへつながる
npm test                                      # APIのテスト（18項目）
```

偽物のStripeは、購入をすぐ完了にします。解約の確認は、`http://127.0.0.1:5181/__mock/cancel` を開くと、契約が解約済みになります。
