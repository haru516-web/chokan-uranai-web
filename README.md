# 潮環占い Web

現行アプリの画面・鑑定ロジックをWeb向けに移した、独立したプロジェクトです。アプリ版の元プロジェクトは D:\chokan-uranai-codex に残し、このフォルダはViteとReact Native Webで動かします。Expo SDKは使いません。

## ローカルで開く

Node.js 22.13以上が必要です。

    npm ci
    npm run dev

ブラウザーで表示されたURLを開きます。

## 公開用ビルド

    npm run build
    npm run preview

静的ファイルは dist/ に出力されます。Viteのパスは相対指定なので、GitHub Pagesの /<リポジトリ名>/ 配下でも画像やスクリプトを読み込めます。

## GitHub Pagesで公開

このフォルダには、main へのpushでビルドと公開を行う .github/workflows/pages.yml を入れてあります。

1. GitHubで空のリポジトリを作ります。無料プランでGitHub Pagesを使う場合は、リポジトリをPublicにします。Pagesのサイト自体もインターネットで公開されます。README・.gitignore・ライセンスはGitHub側では追加しません。
2. リポジトリの Settings → Pages → Build and deployment → Source を GitHub Actions にします。
3. このフォルダでGitを初期化し、作成したリポジトリへpushします。

       git init -b main
       git add .
       git commit -m "Initial web project"
       git remote add origin https://github.com/<アカウント名>/<リポジトリ名>.git
       git push -u origin main

4. Actions タブで Deploy Web が完了すると、公開URLが表示されます。以後 main にpushするたびに更新されます。

## データ保存

入力した鑑定情報は外部へ送信しません。保存を選んだ場合は、そのブラウザーの localStorage に保存されます。
