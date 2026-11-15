// Stripe のREST APIを、fetchで呼ぶ（追加のライブラリは使わない）。
const BASE = 'https://api.stripe.com/v1';

/** { a: { b: 1 }, c: [x] } を、Stripeの形式 a[b]=1&c[0]=x に直す。 */
export function encode(params, prefix = '', out = []) {
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) value.forEach((item, index) => (typeof item === 'object' ? encode(item, `${name}[${index}]`, out) : out.push([`${name}[${index}]`, String(item)])));
    else if (typeof value === 'object') encode(value, name, out);
    else out.push([name, String(value)]);
  }
  return out;
}

export async function stripe(path, { method = 'GET', params, env = process.env } = {}) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw Object.assign(new Error('STRIPE_SECRET_KEY がありません'), { status: 503 });
  const pairs = encode(params);
  const query = method === 'GET' && pairs.length ? '?' + new URLSearchParams(pairs).toString() : '';
  const response = await fetch(BASE + path + query, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      // APIのバージョンを固定したいときだけ、環境変数 STRIPE_API_VERSION を入れる（入れなければ、アカウントの標準）。
      ...(env.STRIPE_API_VERSION ? { 'Stripe-Version': env.STRIPE_API_VERSION } : {}),
      ...(method === 'GET' ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' }),
    },
    body: method === 'GET' ? undefined : new URLSearchParams(pairs).toString(),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body?.error?.message ?? 'Stripe error'), { status: response.status === 404 ? 404 : 502 });
  return body;
}
