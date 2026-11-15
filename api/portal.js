// POST /api/portal（Authorization: Bearer トークン）… 解約・カード変更の管理ページ（Stripeのカスタマーポータル）のURLを返す。
import { bearer, guard, json, originOf } from './_lib/http.js';
import { stripe } from './_lib/stripe.js';
import { verifyToken } from './_lib/token.js';

export const POST = guard(async request => {
  const customer = verifyToken(bearer(request));
  if (!customer) return json({ error: 'invalid_token' }, 401);
  const session = await stripe('/billing_portal/sessions', { method: 'POST', params: { customer, return_url: `${originOf(request)}/` } });
  return json({ url: session.url });
});
