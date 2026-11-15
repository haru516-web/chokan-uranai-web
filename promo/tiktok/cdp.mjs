// 実際のアプリ画面を、ヘッドレスChromeで動かして録画する小さな道具（依存なし。Node 22+）。
// 録画は Page.startScreencast のフレームを、時刻つきで out/frames/<名前>/ に保存する。
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export { sleep };

export async function launch({ url, width = 390, height = 693, scale = Number(process.env.DPR ?? 2), port = 9400 + Math.floor(Math.random() * 500) }) {
  const dir = join(tmpdir(), 'chrome-rec-' + Date.now());
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + dir, '--no-first-run', '--hide-scrollbars',
    '--force-device-scale-factor=' + scale, '--window-size=' + width + ',' + height, 'about:blank'], { stdio: 'ignore' });
  let list;
  for (let i = 0; i < 50; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (list.length) break; } catch { /* retry */ } await sleep(200); }
  const target = list.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const waits = new Map(); const handlers = [];
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); } else handlers.push(m) && onEvent(m); });
  const listeners = [];
  function onEvent(m) { listeners.forEach(f => f(m)); }
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; waits.set(i, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='*{-webkit-user-select:none!important;user-select:none!important}';document.head.appendChild(s)})" });
  await send('Page.navigate', { url });

  const evalJs = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description ?? '')); return r.result.value; };

  // 録画
  let rec = null;
  listeners.push(async m => {
    if (m.method !== 'Page.screencastFrame' || !rec) return;
    const { data, sessionId, metadata } = m.params;
    send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    rec.frames.push({ t: metadata.timestamp, file: join(rec.dir, String(rec.frames.length).padStart(5, '0') + '.jpg') });
    writeFileSync(rec.frames.at(-1).file, Buffer.from(data, 'base64'));
  });
  const api = {
    send, evalJs, sleep,
    async startRec(dirName) { const d = join('promo/tiktok/out/frames', dirName); rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); rec = { dir: d, frames: [], marks: [] };
      await send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 2000, maxHeight: 3000, everyNthFrame: 1 }); },
    mark(name) { rec?.marks.push({ name, wall: Date.now() / 1000 }); },
    async stopRec() { await send('Page.stopScreencast'); const r = rec; rec = null;
      // ffmpeg concat 用の一覧（各フレームを次のフレームまでの時間だけ見せる）
      const lines = []; r.frames.forEach((f, i) => { const next = r.frames[i + 1]; const d = next ? Math.max(0.001, next.t - f.t) : 0.1; lines.push(`file '${f.file.replace(/\\/g, '/').split('/').pop()}'`, `duration ${d.toFixed(4)}`); });
      lines.push(`file '${r.frames.at(-1).file.replace(/\\/g, '/').split('/').pop()}'`);
      writeFileSync(join(r.dir, 'list.txt'), lines.join('\n'));
      writeFileSync(join(r.dir, 'marks.json'), JSON.stringify(r.marks.map(m => ({ name: m.name, t: +(m.wall - r.frames[0].t).toFixed(2) })))); return r.frames.length; },
    async rect(js) { return evalJs(`(()=>{const el=(${js});if(!el)return null;const b=el.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2,w:b.width,h:b.height}})()`); },
    async waitFor(js, ms = 15000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = await evalJs(`!!(${js})`).catch(() => false); if (v) return true; await sleep(100); } throw new Error('timeout: ' + js); },
    async tapAt(x, y) { // 指のタップの輪を出してから、タップ
      await evalJs(`(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:${x - 28}px;top:${y - 28}px;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.8);z-index:99999;pointer-events:none;transition:transform .35s ease-out,opacity .35s ease-out';document.body.appendChild(d);requestAnimationFrame(()=>{d.style.transform='scale(1.5)';d.style.opacity='0'});setTimeout(()=>d.remove(),450)})()`);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await sleep(60);
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); },
    async reveal(js, lo = 170, hi = 520) { await api.waitFor(js); for (let i = 0; i < 80; i++) { const r = await api.rect(js); if (r.y >= lo && r.y <= hi) return r; await api.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 195, y: 400, deltaX: 0, deltaY: r.y > hi ? 36 : -36 }); await sleep(16); } return api.rect(js); },
    async tap(js) { const r = await api.reveal(js); await sleep(150); await api.tapAt(r.x, r.y); },
    async type(text, perChar = 110) { for (const ch of text) { /\d/.test(ch) ? await send('Input.dispatchKeyEvent', { type: 'keyDown', text: ch, key: ch }).then(() => send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch })) : await send('Input.insertText', { text: ch }); await sleep(perChar); } },
    async scrollBy(dy, ms = 700) { const n = Math.ceil(ms / 16); for (let i = 0; i < n; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 195, y: 400, deltaX: 0, deltaY: dy / n }); await sleep(16); } },
    async shot(file) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(file, Buffer.from(r.data, 'base64')); },
    async close() { try { await send('Browser.close'); } catch { /* */ } proc.kill(); },
  };
  return api;
}
