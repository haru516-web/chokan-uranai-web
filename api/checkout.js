// POST /api/checkout … Stripeの購入画面（Checkout）を作って、そのURLを返す。月額の定期購入。
import legal from '../content/legal.json' with { type: 'json' };
import { billingConfigured, guard, json, originOf } from './_lib/http.js';
import { stripe } from './_lib/stripe.js';

export const POST = guard(async request => {
  if (!billingConfigured()) return json({ error: 'billing_unavailable' }, 503);
  const origin = originOf(request);
  const yen = Number(legal.plan.monthlyYen).toLocaleString('ja-JP');
  const session = await stripe('/checkout/sessions', {
    method: 'POST',
    params: {
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      locale: 'ja',
      billing_address_collection: 'auto',
      custom_text: {
        submit: {
          message: `月額${yen}円（税込）が、お申込みの日と同じ日に、毎月、自動で更新・請求されます。解約は、管理ページから、いつでもできます。`
            + `お申込みにより、[利用規約](${origin}/terms/)と[返金の方針](${origin}/refund/)に同意したものとします。`,
        },
      },
    },
  });
  return json({ url: session.url });
});
