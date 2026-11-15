// API のテスト。Stripeへの通信は、偽物（fetchの差し替え）で確かめる。実行： node --test tests/
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { signToken, verifyToken } from '../api/_lib/token.js';
import { encode } from '../api/_lib/stripe.js';

const SECRET = 'x'.repeat(40);
const env = { ENTITLEMENT_SECRET: SECRET, STRIPE_SECRET_KEY: 'sk_test_dummy', STRIPE_PRICE_ID: 'price_dummy' };
const realFetch = globalThis.fetch;
let calls;
/** Stripeへの通信を、渡した関数の結果に差し替える。 */
const mockStripe = respond => {
  globalThis.fetch = async (url, init) => {
    const call = { url: String(url), init };
    calls.push(call);
    const { status = 200, body } = respond(call);
    return new Response(JSON.stringify(body), { status });
  };
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
const request = (path, { method = 'GET', headers = {} } = {}) => new Request('https://example.test' + path, { method, headers });

beforeEach(() => { calls = []; Object.assign(process.env, env); });
afterEach(() => { globalThis.fetch = realFetch; for (const key of Object.keys(env)) delete process.env[key]; });

describe('token', () => {
  test('署名したしるしは、同じ顧客IDで戻る', () => assert.equal(verifyToken(signToken('cus_ABC123', env), env), 'cus_ABC123'));
  test('改ざんは通らない', () => {
    const token = signToken('cus_ABC123', env);
    const [payload, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ v: 1, cus: 'cus_OTHER', iat: 1 })).toString('base64url');
    assert.equal(verifyToken(`${forged}.${signature}`, env), null);
    assert.equal(verifyToken(`${payload}.${signature.slice(0, -2)}AA`, env), null);
    assert.equal(verifyToken('', env), null);
    assert.equal(verifyToken('a.b.c', env), null);
  });
  test('別の秘密で署名したものは通らない', () => assert.equal(verifyToken(signToken('cus_ABC123', { ENTITLEMENT_SECRET: 'y'.repeat(40) }), env), null));
  test('秘密が短いと、署名できない', () => assert.throws(() => signToken('cus_A', { ENTITLEMENT_SECRET: 'short' })));
});

test('Stripe形式のエンコード（入れ子・配列）', () => {
  const pairs = encode({ mode: 'subscription', line_items: [{ price: 'p', quantity: 1 }], custom_text: { submit: { message: 'm' } }, expand: ['subscription'], skip: undefined });
  assert.deepEqual(pairs, [['mode', 'subscription'], ['line_items[0][price]', 'p'], ['line_items[0][quantity]', '1'], ['custom_text[submit][message]', 'm'], ['expand[0]', 'subscription']]);
});

describe('Stripe-Version', () => {
  test('STRIPE_API_VERSION を入れたときだけ、ヘッダーに付く', async () => {
    mockStripe(() => ({ body: { data: [] } }));
    const { stripe } = await import('../api/_lib/stripe.js');
    await stripe('/subscriptions', { env: { STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_API_VERSION: '2099-01-01.test' } });
    await stripe('/subscriptions', { env: { STRIPE_SECRET_KEY: 'sk_test_x' } });
    assert.equal(calls[0].init.headers['Stripe-Version'], '2099-01-01.test');
    assert.equal(calls[1].init.headers['Stripe-Version'], undefined);
  });
});

describe('GET /api/config', () => {
  test('設定がそろっていれば billing: true', async () => {
    const { GET } = await import('../api/config.js');
    const body = await (await GET(request('/api/config'))).json();
    assert.equal(body.billing, true);
    assert.equal(body.monthlyYen, 450);
  });
  test('Stripeのキーがなければ billing: false（有料の枠は開いたまま）', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { GET } = await import('../api/config.js');
    assert.equal((await (await GET(request('/api/config'))).json()).billing, false);
  });
});

describe('POST /api/checkout', () => {
  test('月額の定期購入を作り、URLを返す（日本語・同意文つき）', async () => {
    mockStripe(() => ({ body: { url: 'https://checkout.stripe.com/c/pay/cs_test_x' } }));
    const { POST } = await import('../api/checkout.js');
    const response = await POST(request('/api/checkout', { method: 'POST' }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).url, 'https://checkout.stripe.com/c/pay/cs_test_x');
    const sent = new URLSearchParams(calls[0].init.body);
    assert.equal(sent.get('mode'), 'subscription');
    assert.equal(sent.get('line_items[0][price]'), 'price_dummy');
    assert.equal(sent.get('locale'), 'ja');
    assert.equal(sent.get('success_url'), 'https://example.test/?checkout=success&session_id={CHECKOUT_SESSION_ID}');
    assert.match(sent.get('custom_text[submit][message]'), /月額450円（税込）.*自動で更新.*解約/s);
    assert.equal(calls[0].init.headers.Authorization, 'Bearer sk_test_dummy');
  });
  test('設定がなければ 503', async () => {
    delete process.env.STRIPE_PRICE_ID;
    const { POST } = await import('../api/checkout.js');
    assert.equal((await POST(request('/api/checkout', { method: 'POST' }))).status, 503);
  });
});

describe('GET /api/session', () => {
  const sessionId = 'cs_test_' + 'a'.repeat(20);
  test('購入が完了していれば、しるしを返す', async () => {
    mockStripe(() => ({ body: { created: nowSeconds(), status: 'complete', mode: 'subscription', customer: 'cus_ABC123', subscription: { status: 'active' } } }));
    const { GET } = await import('../api/session.js');
    const body = await (await GET(request('/api/session?session_id=' + sessionId))).json();
    assert.equal(body.active, true);
    assert.equal(verifyToken(body.token, env), 'cus_ABC123');
    assert.match(calls[0].url, /expand%5B0%5D=subscription/);
  });
  test('購入から30分より前のセッションは、しるしを出さない（URLが漏れても、あとから作れない）', async () => {
    const { GET } = await import('../api/session.js');
    for (const created of [nowSeconds() - 31 * 60, nowSeconds() - 86_400, undefined]) {
      mockStripe(() => ({ body: { created, status: 'complete', mode: 'subscription', customer: 'cus_ABC123', subscription: { status: 'active' } } }));
      const result = await (await GET(request('/api/session?session_id=' + sessionId))).json();
      assert.equal(result.active, false);
      assert.equal(result.token, undefined);
    }
  });
  test('29分前のセッションは、しるしを出す', async () => {
    mockStripe(() => ({ body: { created: nowSeconds() - 29 * 60, status: 'complete', mode: 'subscription', customer: 'cus_ABC123', subscription: { status: 'active' } } }));
    const { GET } = await import('../api/session.js');
    assert.equal((await (await GET(request('/api/session?session_id=' + sessionId))).json()).active, true);
  });
  test('未完了・未払い・キャンセル済みは、しるしを出さない', async () => {
    const { GET } = await import('../api/session.js');
    for (const body of [
      { status: 'open', mode: 'subscription', customer: 'cus_A1', subscription: { status: 'incomplete' } },
      { status: 'complete', mode: 'subscription', customer: 'cus_A1', subscription: { status: 'canceled' } },
      { status: 'complete', mode: 'payment', customer: 'cus_A1', subscription: null },
    ]) {
      mockStripe(() => ({ body }));
      const result = await (await GET(request('/api/session?session_id=' + sessionId))).json();
      assert.equal(result.active, false);
      assert.equal(result.token, undefined);
    }
  });
  test('形の違うIDは、Stripeに問い合わせず 400', async () => {
    mockStripe(() => ({ body: {} }));
    const { GET } = await import('../api/session.js');
    assert.equal((await GET(request('/api/session?session_id=../x'))).status, 400);
    assert.equal(calls.length, 0);
  });
});

describe('GET /api/entitlement', () => {
  const auth = token => ({ headers: { authorization: 'Bearer ' + token } });
  test('有効なサブスクがあれば active（解約予定も返す）', async () => {
    mockStripe(() => ({ body: { data: [{ status: 'canceled' }, { status: 'active', cancel_at_period_end: true, current_period_end: 1790000000 }] } }));
    const { GET } = await import('../api/entitlement.js');
    const body = await (await GET(request('/api/entitlement', auth(signToken('cus_ABC123', env))))).json();
    assert.deepEqual(body, { active: true, periodEnd: 1790000000, cancelAtPeriodEnd: true });
    assert.match(calls[0].url, /customer=cus_ABC123/);
  });
  test('解約済み・支払い失敗（past_due）は、有料版ではない', async () => {
    mockStripe(() => ({ body: { data: [{ status: 'canceled' }, { status: 'past_due' }] } }));
    const { GET } = await import('../api/entitlement.js');
    assert.equal((await (await GET(request('/api/entitlement', auth(signToken('cus_ABC123', env))))).json()).active, false);
  });
  test('しるしがない・壊れている場合は 401（Stripeには聞かない）', async () => {
    mockStripe(() => ({ body: { data: [] } }));
    const { GET } = await import('../api/entitlement.js');
    assert.equal((await GET(request('/api/entitlement'))).status, 401);
    assert.equal((await GET(request('/api/entitlement', auth('bad.token')))).status, 401);
    assert.equal(calls.length, 0);
  });
  test('Stripeの障害は 502（内部の理由は返さない）', async () => {
    mockStripe(() => ({ status: 500, body: { error: { message: 'secret detail' } } }));
    const { GET } = await import('../api/entitlement.js');
    const response = await GET(request('/api/entitlement', auth(signToken('cus_ABC123', env))));
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('secret detail'));
  });
});

describe('POST /api/portal', () => {
  test('管理ページのURLを返す。戻り先はサイトの根元', async () => {
    mockStripe(() => ({ body: { url: 'https://billing.stripe.com/p/session/x' } }));
    const { POST } = await import('../api/portal.js');
    const response = await POST(request('/api/portal', { method: 'POST', headers: { authorization: 'Bearer ' + signToken('cus_ABC123', env) } }));
    assert.equal((await response.json()).url, 'https://billing.stripe.com/p/session/x');
    const sent = new URLSearchParams(calls[0].init.body);
    assert.equal(sent.get('customer'), 'cus_ABC123');
    assert.equal(sent.get('return_url'), 'https://example.test/');
  });
  test('しるしがなければ 401', async () => {
    const { POST } = await import('../api/portal.js');
    assert.equal((await POST(request('/api/portal', { method: 'POST' }))).status, 401);
  });
});
