// 動画A「実際の占いの手順」：入力 → 鑑定の儀式 → 結果。実アプリの画面を録画する。
import { launch, sleep } from './cdp.mjs';
const T = t => `[...document.querySelectorAll('div,span,button')].filter(e=>e.children.length===0&&e.textContent.trim()===${JSON.stringify(t)}).pop()`;
const L = l => `document.querySelector('[aria-label=${JSON.stringify(l)}]')`;
const b = await launch({ url: process.env.URL ?? 'http://localhost:5175/' });
await b.waitFor(`document.querySelector('.opening')||document.body.innerText.includes('占ってみる')`, 60000);
if (await b.evalJs(`!!document.querySelector('.opening')`)) { await b.tapAt(195, 400); await b.waitFor(`!document.querySelector('.opening')`); }
await b.waitFor(T('占ってみる　›'));
await sleep(600);
await b.startRec('a');
await sleep(300);
b.mark('home');
await b.tap(T('占ってみる　›'));
await b.waitFor(L('生年月日の年')); await sleep(500);
b.mark('form'); await b.tap(L('生年月日の年')); await b.type('1998', 70); await b.type('4', 70); await b.type('12', 70);
await b.tap(L('下の名前')); await sleep(150); await b.type('汐里', 200); await sleep(500);
b.mark('typed');
await b.tap(T('海をひらく　✦')); b.mark('submit');
await b.waitFor(`document.querySelector('.ritual')`);
await b.waitFor(`!document.querySelector('.ritual')`, 40000); b.mark('result');
await sleep(2200);
b.mark('scroll');
await b.scrollBy(520, 900); await sleep(1200);
await b.scrollBy(520, 900); await sleep(1200);
console.log('frames', await b.stopRec());
await b.close();
