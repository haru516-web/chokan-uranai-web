// GET /api/entitlement（Authorization: Bearer トークン）… いま有料版かどうかを、Stripeに確かめて返す。
import { bearer, guard, json } from './_lib/http.js';
import { stripe } from './_lib/stripe.js';
import { verifyToken } from './_lib/token.js';

const ACTIVE = ['active', 'trialing'];

export const GET = guard(async request => {
  const customer = verifyToken(bearer(request));
  if (!customer) return json({ active: false, reason: 'invalid_token' }, 401);
  const list = await stripe('/subscriptions', { params: { customer, status: 'all', limit: 10 } });
  const live = list.data.find(subscription => ACTIVE.includes(subscription.status));
  if (!live) return json({ active: false });
  const periodEnd = live.current_period_end ?? live.items?.data?.[0]?.current_period_end ?? null;
  return json({ active: true, periodEnd, cancelAtPeriodEnd: Boolean(live.cancel_at_period_end) });
});
