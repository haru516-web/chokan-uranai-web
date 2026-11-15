// 購入状態の「しるし」（トークン）。Stripeの顧客IDを、サーバーだけが知る秘密の文字列で署名したもの。
// 改ざんすると、署名が合わなくなる。これを端末に保存して、有料版かどうかの確認に使う。
import { createHmac, timingSafeEqual } from 'node:crypto';

const b64 = buffer => Buffer.from(buffer).toString('base64url');

function secret(env = process.env) {
  const value = env.ENTITLEMENT_SECRET ?? '';
  if (value.length < 32) throw new Error('ENTITLEMENT_SECRET は32文字以上にしてください');
  return value;
}

export function signToken(customerId, env = process.env, now = Date.now()) {
  const payload = b64(JSON.stringify({ v: 1, cus: customerId, iat: Math.floor(now / 1000) }));
  const signature = createHmac('sha256', secret(env)).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/** 正しければ顧客IDを返す。違えば null。 */
export function verifyToken(token, env = process.env) {
  if (typeof token !== 'string' || token.length > 600) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  const expected = createHmac('sha256', secret(env)).update(payload).digest();
  let given;
  try { given = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data?.v === 1 && /^cus_[A-Za-z0-9]+$/.test(data.cus) ? data.cus : null;
  } catch { return null; }
}
