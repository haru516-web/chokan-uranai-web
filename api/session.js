// GET /api/session?session_id=cs_… … 購入が終わったあとに呼ぶ。購入が完了していれば、購入状態のしるし（トークン）を返す。
import { guard, json } from './_lib/http.js';
import { stripe } from './_lib/stripe.js';
import { signToken } from './_lib/token.js';

export const ACTIVE = ['active', 'trialing'];
/** 購入から、しるしを出せる時間（秒）。成功のURL（session_id）が漏れても、あとから、他の人が、しるしを作れないようにする。 */
export const MAX_AGE_SECONDS = 30 * 60;

export const GET = guard(async request => {
  const id = new URL(request.url).searchParams.get('session_id') ?? '';
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,}$/.test(id)) return json({ error: 'bad_request' }, 400);
  const session = await stripe(`/checkout/sessions/${id}`, { params: { expand: ['subscription'] } });
  const subscription = session.subscription;
  const fresh = Number.isFinite(session.created) && Date.now() / 1000 - session.created <= MAX_AGE_SECONDS;
  const ok = fresh && session.status === 'complete' && session.mode === 'subscription'
    && typeof session.customer === 'string' && subscription && ACTIVE.includes(subscription.status);
  if (!ok) return json({ active: false }, 200);
  return json({ active: true, token: signToken(session.customer) });
});
