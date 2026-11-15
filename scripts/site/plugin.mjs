// 公開用の静的ページ・サイトマップ・robots.txt を、ふだんのビルド（vite build）の中で一緒に書き出す Vite プラグイン。
//   SITE_URL   … このビルドを公開するURL（例 https://haru516-web.github.io/chokan-uranai-web/）。canonical・サイトマップ・OG画像のURLに使う。
//   SITE_INDEX … 1 のときだけ「検索に出す」設定にする。ない場合（確認用のブランチ公開・手元の確認）は、全ページ noindex。
// アプリ本体（index.html）の入口はそのまま。ベースURLも変えない（vite build --base ./ のまま、どの場所に置いても動く）。
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildPages, robotsTxt, sitemapXml, SITE_NAME } from './pages.mjs';

const readJson = file => JSON.parse(readFileSync(resolve(file), 'utf8'));
const pad = number => String(number).padStart(2, '0');

/** 静的ページが使う画像・CSS。公開物（site/）の中身 → 元のファイル。 */
const siteAssets = () => ({
  'site/site.css': 'scripts/site/site.css',
  'site/og.png': 'assets/art/og.png',
  'site/favicon.png': 'assets/art/favicon.png',
  ...Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`site/resident-${pad(i + 1)}.webp`, `assets/art/resident-${pad(i + 1)}.webp`])),
});

const contentTypes = { '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp' };

export function publicSite({ siteUrl = '', index = false } = {}) {
  const url = siteUrl ? siteUrl.replace(/\/?$/, '/') : '';
  const site = { url, index: Boolean(index && url) };

  const pages = () => {
    const meta = readJson('src/siteMeta.json');
    return buildPages({
      site, questions: readJson('src/questions.json'), residents: readJson('src/residents.json'),
      extensions: readJson('content/question-extensions.json'), legal: readJson('content/legal.json'), categories: meta.categories, featured: meta.featuredQuestions,
    });
  };

  return {
    name: 'chokan-public-site',

    /** アプリの入口（index.html）にも、検索向けの設定と、JavaScriptなしで読める案内を足す。 */
    transformIndexHtml() {
      const og = (url || './') + 'site/og.png';
      const tags = [
        { tag: 'meta', attrs: { name: 'robots', content: site.index ? 'index, follow' : 'noindex, nofollow' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: og }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: og }, injectTo: 'head' },
      ];
      if (site.index) {
        tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' });
        tags.push({ tag: 'meta', attrs: { property: 'og:url', content: url }, injectTo: 'head' });
        tags.push({
          tag: 'script', attrs: { type: 'application/ld+json' }, injectTo: 'head',
          children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url, inLanguage: 'ja' }),
        });
      }
      tags.push({
        tag: 'noscript', injectTo: 'body-prepend',
        children: `<main style="max-width:640px;margin:0 auto;padding:24px 16px;color:#fbf3e0;font:16px/1.8 sans-serif"><h1>${SITE_NAME}</h1>`
          + '<p>生年月日と名前から、今日の運勢と人生の流れを、海に見立てて読む創作の占いです。占うには、JavaScriptを有効にしてください。</p>'
          + '<p><a style="color:#eacc8c" href="./questions/">問いの海</a>・<a style="color:#eacc8c" href="./types/">16のタイプ</a>・<a style="color:#eacc8c" href="./about/">このサイトについて</a></p></main>',
      });
      return tags;
    },

    /** ビルド：静的ページ・画像・CSS・サイトマップ・robots.txt を、成果物に足す。 */
    generateBundle() {
      for (const page of pages()) {
        this.emitFile({ type: 'asset', fileName: page.path.endsWith('/') ? page.path + 'index.html' : page.path, source: page.html });
      }
      for (const [fileName, from] of Object.entries(siteAssets())) {
        if (existsSync(resolve(from))) this.emitFile({ type: 'asset', fileName, source: readFileSync(resolve(from)) });
      }
      if (site.index) {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(site, pages()) });
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(site) });
      }
    },

    /** 手元の確認（npm run dev）でも、同じページを見られるようにする。 */
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = decodeURIComponent((request.url ?? '/').split('?')[0]).replace(/^\/+/, '');
        const asset = siteAssets()[path];
        if (asset && existsSync(resolve(asset))) {
          const ext = asset.slice(asset.lastIndexOf('.'));
          response.setHeader('Content-Type', contentTypes[ext] ?? 'application/octet-stream');
          response.end(readFileSync(resolve(asset)));
          return;
        }
        const page = path === '' ? null : pages().find(item => item.path === path || item.path === path + '/');
        if (!page) { next(); return; }
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(page.html);
      });
    },
  };
}
