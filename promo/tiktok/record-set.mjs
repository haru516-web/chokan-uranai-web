// 4本セットの録画。実アプリを動かして、画面に出ているものと演出だけを撮る。
// 使い方： DPR=2 node promo/tiktok/record-set.mjs <tarot|type|rank|life>
// 出力： out/frames/<名前>/（list.txt と marks.json つき）
import { launch, sleep } from './cdp.mjs';
import { readdirSync } from 'node:fs';
const ART = readdirSync('assets/art').filter(f => /.(webp|png)$/.test(f));

const T = t => `[...document.querySelectorAll('div,span,button,h1,h2,h3,h4')].filter(e=>e.childElementCount===0&&e.textContent.trim()===${JSON.stringify(t)}).pop()`;
const L = l => `document.querySelector('[aria-label=${JSON.stringify(l)}]')`;
const which = process.argv[2];
const APP = process.env.URL ?? 'http://localhost:5175/';
const b = await launch({ url: which === 'opening' ? 'about:blank' : APP });

// 画像を先に読み込んでおく（開発サーバーは大きな画像が遅く、演出の途中で絵が抜けるため）
async function preload() { await b.evalJs('Promise.all(' + JSON.stringify(ART) + '.map(f => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}) : Promise.resolve()).then(r); i.src = "/assets/art/" + f; })))'); }
async function skipOpening() {
  await b.waitFor(`document.querySelector('.opening')||document.body.innerText.includes('占ってみる')`, 60000);
  if (await b.evalJs(`!!document.querySelector('.opening')`)) { await b.tapAt(195, 400); await b.waitFor(`!document.querySelector('.opening')`); }
  await sleep(500);
  await preload();
}
async function profile(fast) {
  await b.tap(T('占ってみる　›')); await sleep(900);
  await b.waitFor(L('生年月日の年'));
  await b.tap(L('生年月日の年')); await b.type('1998', fast ? 50 : 80); await b.type('4', fast ? 50 : 80); await b.type('12', fast ? 50 : 80);
  await b.tap(L('下の名前')); await sleep(150); await b.type('汐里', fast ? 80 : 200); await sleep(fast ? 200 : 600);
  b.mark('submit');
  await b.tap(T('海をひらく　✦'));
  await b.waitFor(`document.querySelector('.ritual')`); b.mark('ritual');
  await b.waitFor(`!document.querySelector('.ritual')`, 60000); b.mark('result');
}
async function tab(label) { await b.tap(L(label)); await sleep(1800); }

if (which === 'tarot') {
  await skipOpening();
  await tab('タロット');
  await b.reveal(L('カードを選ぶ（12枚目）'), 380, 470);
  await sleep(1200);
  await b.startRec('tarot'); await sleep(1500); b.mark('spread');
  await b.tap(L('カードを選ぶ（12枚目）')); b.mark('pick');
  await sleep(6500); b.mark('landed');
  await b.tapAt(195, 600); await sleep(1500); b.mark('reading');
  await b.scrollBy(380, 1600); await sleep(1600);
  await b.scrollBy(380, 1600); await sleep(1600);
}

if (which === 'type') {
  await skipOpening();
  await tab('住人図鑑');
  await b.reveal(T('あなたはどのタイプ？'), 120, 200);
  await sleep(1000);
  await b.startRec('type'); await sleep(1200); b.mark('grid');
  await b.scrollBy(1500, 3800); await sleep(500); b.mark('gridEnd');
  await tab('今日の占い'); b.mark('today');
  await profile(false);
  await sleep(4500); b.mark('resultSettled');
  await tab('住人図鑑'); b.mark('zukan2');
  await b.tap(T('自分のタイプを見る　›')); await sleep(2500); b.mark('own');
  await b.scrollBy(500, 1500); await sleep(1500);
  await b.scrollBy(500, 1500); await sleep(1500);
}

if (which === 'rank') {
  await skipOpening();
  await profile(true);
  await sleep(1500);
  await tab('二人の相性');
  await b.waitFor(L('相手の生年月日の年')); await sleep(600);
  await b.tap(L('相手の生年月日の年')); await b.type('2001', 70); await b.type('9', 70); await b.type('3', 70);
  await b.tap(L('相手の下の名前')); await b.type('健太', 80); await sleep(300);
  await b.reveal(T('この人との相性を読む　✦'), 420, 560);
  await sleep(800);
  await b.startRec('rank'); await sleep(800);
  await b.tap(T('この人との相性を読む　✦')); b.mark('submit');
  await b.waitFor(`document.querySelector('.ritual')`); b.mark('ritual');
  await b.waitFor(`!document.querySelector('.ritual')`, 60000); b.mark('result');
  await sleep(3000);
  // 「全タイプとの相性」の1位の行まで、なめらかに下る
  const head = String.raw`[...document.querySelectorAll('[role=button]')].find(e=>/^1\n/.test(e.innerText)&&e.querySelector('img'))`;
  await b.evalJs(head + ".scrollIntoView({ behavior: 'smooth', block: 'center' })"); await sleep(3000);
  b.mark('ranking'); await sleep(2500);
  await b.scrollBy(300, 2500); await sleep(1500); b.mark('end');
}

if (which === 'life') {
  await sleep(1500);
  await b.startRec('life'); b.mark('load');           // オープニングを最初から撮る
  await b.waitFor(`document.querySelector('.opening')`, 60000); b.mark('opening');
  await b.waitFor(`!document.querySelector('.opening')`, 30000); b.mark('home');
  await preload();
  await sleep(1200);
  await profile(true);
  await sleep(2500);
  await tab('人生の流れ'); b.mark('life');
  await sleep(3000);
  await b.scrollBy(330, 1500); await sleep(2500); b.mark('chart');
  await b.scrollBy(420, 1500); await sleep(3500); b.mark('thisYear');
  await b.scrollBy(430, 1500); await sleep(3500); b.mark('next');
}

if (which === 'opening') {
  // オープニングを頭から撮る：白紙の状態で録画を始めてから、サイトを開く
  await sleep(1000); await b.startRec('opening'); await b.send('Page.navigate', { url: APP }); b.mark('nav');
  await b.waitFor(`document.querySelector('.opening')`, 60000); b.mark('opening');
  await b.waitFor(`!document.querySelector('.opening')`, 30000); b.mark('home'); await sleep(1500);
}

console.log('frames', await b.stopRec());
await b.close();
