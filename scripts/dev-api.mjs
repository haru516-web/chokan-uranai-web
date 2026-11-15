// 手元の確認用サーバー。api/ の関数を、そのまま呼ぶ（http://127.0.0.1:5181/api/…）。npm run dev は /api をここへつなぐ。
//   MOCK_STRIPE=1 … Stripeへの通信を、メモリの中の偽物に差し替える（キーなしで、購入→更新→解約の流れを試せる）。
//     偽物のStripeは、購入をすぐ完了にする。解約の確認は、http://127.0.0.1:5181/__mock/cancel（すぐ解約）と /__mock/cancel-at-period-end（期間の終わりに解約。ポータルの標準）で、できる。
//   本物のStripeで試すなら、MOCK_STRIPE を付けずに、テストモードのキーを環境変数に入れる（.env.example）。
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const PORT = Number(process.env.API_PORT ?? 5181);
const FRONT = process.env.FRONT_URL ?? 'http://127.0.0.1:5180';

if (process.env.MOCK_STRIPE === '1') {
  process.env.STRIPE_SECRET_KEY ||= 'sk_test_mock';
  process.env.STRIPE_PRICE_ID ||= 'price_mock';
  process.env.ENTITLEMENT_SECRET ||= 'mock-secret-mock-secret-mock-secret-mock';
  const state = { status: 'incomplete', cancelAtPeriodEnd: false };
  const realFetch = globalThis.fetch;
  const reply = (body, status = 200) => new Response(JSON.stringify(body), { status });
  globalThis.fetch = async (url, init) => {
    const address = String(url);
    if (!address.startsWith('https://api.stripe.com')) return realFetch(url, init);
    const path = new URL(address).pathname.replace('/v1', '');
    if (path === '/checkout/sessions' && init?.method === 'POST') {
      state.status = 'active'; state.cancelAtPeriodEnd = false;
      return reply({ url: `${FRONT}/?checkout=success&session_id=cs_test_${'m'.repeat(24)}` });
    }
    if (path.startsWith('/checkout/sessions/')) return reply({ created: Math.floor(Date.now() / 1000), status: 'complete', mode: 'subscription', customer: 'cus_MOCK123', subscription: { status: state.status } });
    if (path === '/subscriptions') return reply({ data: state.status === 'incomplete' ? [] : [{ status: state.status, cancel_at_period_end: state.cancelAtPeriodEnd, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }] });
    if (path === '/billing_portal/sessions') return reply({ url: `${FRONT}/?portal=mock` });
    return reply({ error: { message: 'mock: unknown ' + path } }, 404);
  };
  globalThis.__mockState = state;
}

const handlers = {};
async function handlerFor(name, method) {
  handlers[name] ??= await import(pathToFileURL(resolve('api', name + '.js')).href);
  return handlers[name][method];
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/__mock/cancel' && globalThis.__mockState) { globalThis.__mockState.status = 'canceled'; res.end('canceled'); return; }
  // ポータルの標準の解約と同じ：契約は active のまま、期間の終わりに終了する予約だけが入る。
  if (url.pathname === '/__mock/cancel-at-period-end' && globalThis.__mockState) { globalThis.__mockState.cancelAtPeriodEnd = true; res.end('cancel_at_period_end'); return; }
  const match = url.pathname.match(/^\/api\/([a-z]+)\/?$/);
  const handler = match && await handlerFor(match[1], req.method ?? 'GET').catch(() => null);
  if (!handler) { res.statusCode = 404; res.end(JSON.stringify({ error: 'not_found' })); return; }
  const response = await handler(new Request(url, { method: req.method, headers: req.headers }));
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(await response.text());
}).listen(PORT, '127.0.0.1', () => console.log(`api: http://127.0.0.1:${PORT}/api/  ${process.env.MOCK_STRIPE === '1' ? '（Stripeは偽物）' : ''}`));
