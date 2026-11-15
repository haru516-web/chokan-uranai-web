// 検索向けの静的ページを作る。アプリ本体（/）はそのまま、問い・タイプ・説明の文章を、JavaScriptなしでも読める形で出す。
// 文章はすべて src/questions.json・src/residents.json（アプリと同じ原文）と content/question-extensions.json から作る。
// リンクは相対パスで作る。どこに置いても（/ でも /ブランチ名/ でも）壊れない。
import { legalPages } from './legal.mjs';

export const SITE_NAME = '潮環占い';

const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SEASONS = ['春', '夏', '秋', '冬'];
const DEPTHS = ['浅瀬', '沿岸', '沖合', '深海'];

/** ルートからの深さ（questions/q01/ なら 2）に応じた、ルートへの相対パス。 */
const up = depth => depth === 0 ? './' : '../'.repeat(depth);
const depthOf = path => path.split('/').filter(Boolean).filter(part => !part.endsWith('.html')).length;

export const FEATURED_PATH = id => `questions/${id.toLowerCase()}/`;

function layout({ site, path, title, description, body, noindex = false, ogType = 'website', jsonLd, forceAbsolute = false }) {
  const depth = depthOf(path);
  const rel = forceAbsolute && site.url ? site.url : up(depth);
  const canonical = site.index && site.url && !noindex ? site.url + path : '';
  const ogImage = (site.url || rel) + 'site/og.png';
  const robots = site.index && !noindex ? 'index, follow' : 'noindex, nofollow';
  const ld = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '';
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#10172a">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="ja_JP">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="${rel}site/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap">
<link rel="stylesheet" href="${rel}site/site.css">
${ld}
</head>
<body>
<header class="head">
  <a class="brand" href="${rel}">${SITE_NAME}</a>
  <nav aria-label="主なページ">
    <a href="${rel}questions/">問いの海</a>
    <a href="${rel}types/">16のタイプ</a>
    <a href="${rel}about/">このサイトについて</a>
    <a class="cta" href="${rel}">占ってみる</a>
  </nav>
</header>
<main>
${body(rel)}
</main>
<footer class="foot">
  <p>${SITE_NAME}は、四季と海の深さ、月の流れを手がかりに、人生と今日を読む創作の占いです。結果は娯楽であり、診断や助言の代わりにはなりません。</p>
  <p><a href="${rel}about/">このサイトについて</a>・<a href="${rel}terms/">利用規約</a>・<a href="${rel}privacy/">プライバシーポリシー</a>・<a href="${rel}tokushoho/">特定商取引法に基づく表記</a>・<a href="${rel}refund/">返金の方針</a></p>
</footer>
</body>
</html>
`;
}

const paragraphs = list => list.map(text => `<p>${esc(text)}</p>`).join('\n');

/** 問いの個別ページ。原文（アプリと同じ文）を正本にして、補足原稿（content/question-extensions.json）を添える。 */
function questionPage(site, question, extension, categoryName, siblings) {
  const path = FEATURED_PATH(question.id);
  const title = `${extension.title}｜問いの海｜${SITE_NAME}`;
  return {
    path, priority: true,
    html: layout({
      site, path, title, description: extension.description, ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org', '@type': 'Article', headline: extension.title, description: extension.description, inLanguage: 'ja',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME },
      },
      body: rel => `
<article class="prose">
  <p class="crumbs"><a href="${rel}questions/">問いの海</a> › ${esc(categoryName)}</p>
  <p class="kicker">${esc(question.id)}　${esc(categoryName)}</p>
  <h1>${esc(extension.title)}</h1>
  <p class="lead">${esc(question.question)}</p>
  <h2>${esc(question.title)}</h2>
  <p>${esc(question.answer)}</p>
  <h2>考えるときの見方</h2>
  ${paragraphs(extension.context)}
  <h2>こんな場面で浮かぶことがあります</h2>
  <ul>${extension.examples.map(text => `<li>${esc(text)}</li>`).join('')}</ul>
  <h2>自分に問い返してみる</h2>
  <p>${esc(question.followUp)}</p>
  <p class="note">${esc(extension.reflection)}</p>
  <h2>今日、試せること</h2>
  <p>${esc(question.action)}</p>
  <p class="aside">ここに書いたのは、この問いを考えるための例です。診断や一般論ではなく、あなたに当てはまるとは限りません。</p>
  <p class="actions"><a class="button" href="${rel}?question=${esc(question.id)}">自分の海と重ねて、この問いを読む</a></p>
</article>
<section class="prose">
  <h2>ほかの問い</h2>
  <ul class="links">${siblings.map(item => `<li><a href="${rel}${item.href}">${esc(item.label)}</a></li>`).join('')}</ul>
</section>`,
    }),
  };
}

export function buildPages({ site, questions, residents, extensions, categories, featured, legal }) {
  const pages = [];
  const categoryName = id => categories.find(item => item.id === id)?.name ?? '';
  const featuredSet = new Set(featured);
  const hrefOf = question => featuredSet.has(question.id) ? FEATURED_PATH(question.id) : `?question=${question.id}`;

  // 問いの一覧。24問すべて。個別ページがある問いは静的ページへ、ほかはアプリで開く。
  pages.push({
    path: 'questions/', priority: true,
    html: layout({
      site, path: 'questions/',
      title: `問いの海｜言葉にならない悩みを読む｜${SITE_NAME}`,
      description: `「不満はないのに満たされない」「人の成功を喜べない」など、言葉にならない悩みを24の問いにして、読み物と今日試せることを添えました。登録なしで読めます。`,
      jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: '問いの海', inLanguage: 'ja', isPartOf: { '@type': 'WebSite', name: SITE_NAME } },
      body: rel => `
<section class="prose">
  <p class="kicker">QUESTIONS</p>
  <h1>問いの海</h1>
  <p class="lead">はっきりした悩みにならないまま、心に残っていることを、24の問いにしました。答えを決めるためではなく、考えるきっかけとして読んでください。</p>
</section>
${categories.map(category => `
<section class="prose">
  <h2>${esc(category.name)}</h2>
  <ul class="questions">
    ${questions.filter(question => question.category === category.id).map(question => `<li>
      <a href="${rel}${hrefOf(question)}"><span class="qid">${esc(question.id)}</span>${esc(question.question)}</a>
    </li>`).join('\n')}
  </ul>
</section>`).join('\n')}
<section class="prose">
  <p class="aside">読み物のあるページは、問いごとに用意しています。それ以外の問いは、アプリの「問いの海」で開きます。</p>
  <p class="actions"><a class="button" href="${rel}">アプリで、自分の海と重ねて読む</a></p>
</section>`,
    }),
  });

  // 問いの個別ページ（補足原稿のある問いだけ）。
  for (const id of featured) {
    const question = questions.find(item => item.id === id);
    const extension = extensions[id];
    if (!question || !extension) continue;
    const siblings = featured.filter(other => other !== id).map(other => questions.find(item => item.id === other))
      .filter(Boolean).map(item => ({ href: FEATURED_PATH(item.id), label: extensions[item.id]?.title ?? item.question }));
    pages.push(questionPage(site, question, extension, categoryName(question.category), siblings));
  }

  // 16のタイプ。季節ごとに、浅瀬から深海へ。
  pages.push({
    path: 'types/', priority: true,
    html: layout({
      site, path: 'types/',
      title: `16の潮札（タイプ）｜春夏秋冬と海の深さ｜${SITE_NAME}`,
      description: '生まれ持った季節（春夏秋冬）と、海の深さ（浅瀬・沿岸・沖合・深海）で決まる16のタイプを、一覧で紹介します。',
      body: rel => `
<section class="prose">
  <p class="kicker">TYPES</p>
  <h1>16の潮札（タイプ）</h1>
  <p class="lead">${SITE_NAME}では、生年月日から季節（春夏秋冬）が、名前の画数から海の深さが決まり、16のタイプに分かれます。実際の占いでは、深さの数値や「−」「A」などの特徴も重ねて読みます。</p>
</section>
${SEASONS.map((season, s) => `
<section class="prose">
  <h2>${season}</h2>
  <div class="cards">
    ${DEPTHS.map((depth, d) => {
      const resident = residents[s * 4 + d];
      const number = String(s * 4 + d + 1).padStart(2, '0');
      return `<article class="card">
      <img src="${rel}site/resident-${number}.webp" alt="${esc(resident.band)}の住人" width="160" height="160" loading="lazy">
      <h3>${esc(resident.band)}</h3>
      <p class="sub">${esc(resident.subtitle)}</p>
      <p>${esc(resident.summary)}</p>
    </article>`;
    }).join('\n')}
  </div>
</section>`).join('\n')}
<section class="prose">
  <p class="actions"><a class="button" href="${rel}">自分のタイプを占う</a></p>
</section>`,
    }),
  });

  // このサイトについて。いまのアプリにある機能だけを書く。
  pages.push({
    path: 'about/', priority: true,
    html: layout({
      site, path: 'about/',
      title: `このサイトについて｜${SITE_NAME}`,
      description: `${SITE_NAME}は、四季と海の深さ、月の流れを手がかりに、人生と今日を読む創作の占いです。できること、考え方、データの扱いを説明します。`,
      body: rel => `
<article class="prose">
  <p class="kicker">ABOUT</p>
  <h1>このサイトについて</h1>
  <p class="lead">${SITE_NAME}は、生年月日と名前から、その人の「名札」を決めて、今日の運勢や人生の流れを、海に見立てて読む占いです。</p>
  <h2>できること</h2>
  <ul>
    <li><b>今日の占い</b>：今日の順位、ひとこと、今日の一手、分野ごとの運、ラッキー、明日の潮。</li>
    <li><b>タロット</b>：今日の1枚を引く。</li>
    <li><b>二人の相性</b>：恋愛・結婚・仕事・友情の相性と、今日・今月・今年の相性。</li>
    <li><b>人生の流れ</b>：年ごとの運勢の波と、月ごとの海況、運勢の輪と暦。</li>
    <li><b>問いの海</b>：言葉にならない悩みを24の問いにした読み物。</li>
    <li><b>住人図鑑</b>：16のタイプの住人と、潮環神話。</li>
  </ul>
  <h2>読み方の考え方</h2>
  <p>結果は、乱数ではなく、生年月日・名前の画数・暦・月の満ち欠けなどの数値から、決まった計算で出します。同じ入力なら、同じ日には同じ結果になります。</p>
  <p>これは創作の占いです。将来を断定するものではなく、心理・医療・法律・投資などの判断の代わりにもなりません。気持ちを整理したり、考えるきっかけにしたりする目的で、お使いください。</p>
  <h2>運営について</h2>
  <p>運営者の情報は、公開の準備ができ次第、このページに掲載します。</p>
  <h2>データの扱い</h2>
  <p>入力した内容の扱いは、<a href="${rel}privacy/">プライバシーポリシー</a>に書いています。</p>
  <p class="actions"><a class="button" href="${rel}">占ってみる</a></p>
</article>`,
    }),
  });

  // 法的ページ（特定商取引法に基づく表記・利用規約・プライバシーポリシー・返金の方針）。
  pages.push(...legalPages({ site, layout, legal }));

  // 404。公開サイトのどの深さからでも開けるよう、本番ではサイトのURLを絶対指定でつなぐ。
  pages.push({
    path: '404.html', priority: false,
    html: layout({
      site, path: '404.html', noindex: true, forceAbsolute: true,
      title: `ページが見つかりません｜${SITE_NAME}`,
      description: 'ページが見つかりませんでした。',
      body: rel => `
<section class="prose">
  <h1>海図にない航路です</h1>
  <p class="lead">お探しのページは見つかりませんでした。</p>
  <p class="actions"><a class="button" href="${rel}">占いをひらく</a> <a class="button ghost" href="${rel}questions/">問いの海へ</a></p>
</section>`,
    }),
  });
  return pages;
}

/** サイトマップ。検索に出すページだけ。 */
export function sitemapXml(site, pages) {
  const urls = ['', ...pages.filter(page => page.priority).map(page => page.path)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path => `  <url><loc>${esc(site.url + path)}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export function robotsTxt(site) {
  return `User-agent: *\nAllow: /\nDisallow: /branches/\nSitemap: ${site.url}sitemap.xml\n`;
}
