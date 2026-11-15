// ビルド後（dist/）の検査。静的ページ・サイトマップ・検索向けの設定が、設計どおりに出ているかを確かめる。
//   npm run build && npm run check:site
//   本番と同じ設定で確かめるなら： SITE_URL=https://example.com/app/ SITE_INDEX=1 npm run build && SITE_URL=... SITE_INDEX=1 npm run check:site
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { resolveSite } from './site/env.mjs';

const dist = resolve(process.env.DIST_DIR ?? 'dist');
const resolved = resolveSite();
const siteUrl = resolved.siteUrl ? resolved.siteUrl.replace(/\/?$/, '/') : '';
const index = resolved.index;
const read = file => readFileSync(resolve(file), 'utf8');
const json = file => JSON.parse(read(file));

const questions = json('src/questions.json');
const residents = json('src/residents.json');
const extensions = json('content/question-extensions.json');
const { featuredQuestions } = json('src/siteMeta.json');

/** 検査する公開ページ。path は dist の中の場所。 */
const pages = [
  { path: '', file: 'index.html', app: true },
  { path: 'questions/', file: 'questions/index.html', listed: true },
  ...featuredQuestions.map(id => ({ path: `questions/${id.toLowerCase()}/`, file: `questions/${id.toLowerCase()}/index.html`, listed: true, id })),
  { path: 'types/', file: 'types/index.html', listed: true },
  { path: 'about/', file: 'about/index.html', listed: true },
  { path: 'privacy/', file: 'privacy/index.html', listed: false, legal: true },
  { path: 'tokushoho/', file: 'tokushoho/index.html', listed: false, legal: true },
  { path: 'terms/', file: 'terms/index.html', listed: false, legal: true },
  { path: 'refund/', file: 'refund/index.html', listed: false, legal: true },
  { path: '404.html', file: '404.html', listed: false },
];

const htmlOf = page => {
  const file = resolve(dist, page.file);
  assert.ok(existsSync(file), `ページがありません：${page.file}`);
  return readFileSync(file, 'utf8');
};
const count = (source, expression) => [...source.matchAll(expression)].length;
const attr = (html, expression) => html.match(expression)?.[1] ?? '';

const titles = new Map();
let linkCount = 0;
for (const page of pages) {
  const html = htmlOf(page);
  assert.match(html, /<html lang="ja"/i, `${page.file}：lang="ja" がありません`);
  assert.equal(count(html, /<title>/gi), 1, `${page.file}：title は1つだけです`);
  const title = attr(html, /<title>([^<]+)<\/title>/);
  assert.ok(title, `${page.file}：title が空です`);
  assert.ok(!titles.has(title), `${page.file}：title が ${titles.get(title)} と同じです`);
  titles.set(title, page.file);
  if (!page.app) assert.ok(attr(html, /<meta name="description" content="([^"]+)"/), `${page.file}：description がありません`);

  // 検索に出す設定は、本番（SITE_INDEX=1）の、一覧に載せるページだけ。ほかは必ず noindex。
  const robots = attr(html, /<meta name="robots" content="([^"]+)"/);
  const shouldIndex = index && (page.app || page.listed);
  assert.equal(robots, shouldIndex ? 'index, follow' : 'noindex, nofollow', `${page.file}：robots の設定が違います（${robots}）`);
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
  if (shouldIndex) assert.equal(canonical, siteUrl + page.path, `${page.file}：canonical が違います（${canonical}）`);
  else assert.equal(canonical, '', `${page.file}：検索に出さないページに canonical があります`);

  // 内部リンク・画像・CSS が、成果物の中に実在すること（相対パスだけ）。404は本番では絶対URLなので対象外。
  if (page.path !== '404.html') {
    for (const [, target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|#|data:)/.test(target)) continue;
      const clean = target.split('#')[0].split('?')[0];
      const resolved = resolve(dirname(resolve(dist, page.file)), clean);
      const file = clean === '' ? null : (clean.endsWith('/') ? resolve(resolved, 'index.html') : resolved);
      if (file) { assert.ok(existsSync(file), `${page.file}：リンク先がありません ${target}`); linkCount++; }
    }
  }

  // 今のアプリにない機能・古い言い回しを、公開ページに残さない。
  if (!page.app) for (const banned of ['自己診断', '自己純度', '無料の', 'Q01 の', '5タブ']) {
    assert.ok(!html.includes(banned), `${page.file}：使わない言葉「${banned}」が入っています`);
  }
}

// 法的ページ：未記入（運営者の情報の空欄）が残っていないか。LAUNCH=1（有料版の公開前）のときは、残っていたら止める。
const legalGaps = pages.filter(page => page.legal).map(page => ({ file: page.file, gaps: count(htmlOf(page), /class="todo"/g) }));
const totalGaps = legalGaps.reduce((sum, item) => sum + item.gaps, 0);
if (process.env.LAUNCH === '1') {
  assert.equal(totalGaps, 0, '法的ページに未記入が残っています（content/legal.json を入力してください）：' + legalGaps.filter(item => item.gaps).map(item => item.file + '×' + item.gaps).join('、'));
}
// 法的ページに、金額の食い違いがないこと（特商法・規約・返金の方針が、同じ月額を書いている）。
const yen = Number(json('content/legal.json').plan.monthlyYen).toLocaleString('ja-JP') + '円';
for (const page of pages.filter(item => ['tokushoho/', 'terms/', 'refund/'].includes(item.path))) assert.ok(htmlOf(page).includes(yen), page.file + '：月額（' + yen + '）が書かれていません');

// アプリの入口：JavaScriptなしの案内があり、静的ページへのリンクがあること。
const app = htmlOf(pages[0]);
assert.ok(app.includes('<noscript>') && app.includes('./questions/'), 'アプリの入口に、JavaScriptなしの案内がありません');
assert.ok(/<script type="module"/.test(app), 'アプリ本体のscriptが消えています');

// 問いの一覧：24問すべて。個別ページがある問いは静的ページへ、それ以外はアプリ（?question=）へ。
const list = htmlOf(pages[1]);
for (const question of questions) {
  assert.ok(list.includes(question.question.replace(/&/g, '&amp;')), `問いの一覧に ${question.id} がありません`);
  const href = featuredQuestions.includes(question.id) ? `questions/${question.id.toLowerCase()}/` : `?question=${question.id}`;
  assert.ok(list.includes(`href="../${href}"`) || list.includes(`href="./${href}"`) || list.includes(`href="${href}"`), `${question.id} のリンク先が違います`);
}

// 問いの個別ページ：原文（アプリと同じ文）と、補足原稿が入っていること。
for (const page of pages.filter(item => item.id)) {
  const html = htmlOf(page);
  const question = questions.find(item => item.id === page.id);
  const extension = extensions[page.id];
  assert.ok(html.includes(question.answer), `${page.file}：原文の答えがありません`);
  assert.ok(html.includes(question.followUp) && html.includes(question.action), `${page.file}：問い返しと試せることがありません`);
  assert.ok(html.includes(extension.title), `${page.file}：補足原稿のタイトルがありません`);
  assert.ok(html.includes(`?question=${page.id}`), `${page.file}：アプリへのリンクがありません`);
}

// 16のタイプ。
const types = htmlOf(pages.find(page => page.path === 'types/'));
for (const resident of residents) assert.ok(types.includes(resident.band) && types.includes(resident.summary), `タイプの一覧に ${resident.band} がありません`);
assert.equal(count(types, /<img /g), 16, 'タイプの画像は16枚です');

// サイトマップとrobots.txt：本番だけ。確認用のビルドには出さない。
const sitemap = resolve(dist, 'sitemap.xml');
const robots = resolve(dist, 'robots.txt');
if (index) {
  assert.ok(existsSync(sitemap) && existsSync(robots), 'sitemap.xml と robots.txt がありません');
  const urls = [...read('dist/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const expected = pages.filter(page => page.app || page.listed).map(page => siteUrl + page.path);
  assert.deepEqual(urls.sort(), expected.sort(), 'sitemap.xml の中身が、検索に出すページと一致しません');
  assert.ok(read('dist/robots.txt').includes(`Sitemap: ${siteUrl}sitemap.xml`), 'robots.txt に sitemap の行がありません');
} else {
  assert.ok(!existsSync(sitemap) && !existsSync(robots), '確認用のビルドに sitemap.xml / robots.txt があります');
}

console.log(`OK：${pages.length}ページ、法的ページの未記入${totalGaps}か所、内部リンク${linkCount}件、問い${questions.length}問、タイプ${residents.length}、設定＝${index ? '本番（検索に出す）' : '確認用（noindex）'}`);
