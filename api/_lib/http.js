// 共通の返し方と、設定の確認。
export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

/** 決済の設定がそろっているか。そろっていなければ、有料の枠は開いたままにする（アプリが /api/config で知る）。 */
export const billingConfigured = (env = process.env) =>
  Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID && (env.ENTITLEMENT_SECRET ?? '').length >= 32);

/** リクエストを受けたサイトの根元のURL（リダイレクト先に使う）。 */
export function originOf(request) {
  const url = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') ?? url.host;
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  return `${proto}://${host}`;
}

export const bearer = request => (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();

/** ハンドラを包んで、例外をJSONのエラーにする。内部の詳しい理由は、利用者に返さない。 */
export const guard = handler => async request => {
  try { return await handler(request); }
  catch (error) {
    const status = error?.status && error.status < 600 ? error.status : 500;
    console.error('api error', request.url, error?.message);
    return json({ error: status === 503 ? 'billing_unavailable' : 'server_error' }, status);
  }
};
