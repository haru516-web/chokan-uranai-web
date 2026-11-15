// 有料版の確認・購入・管理。サーバーのAPI（/api/…）と話して、plan.ts の状態を決める。
//   決済の設定がない（/api/config が billing: false、またはAPIがない）あいだは、有料の枠を開いたままにする。
//   設定があるときは、端末に保存した「しるし」（トークン）で、Stripeの購入状態をサーバーに確かめる。
import { useSyncExternalStore } from 'react';
import { applyPlan, billingOn } from './plan';

const TOKEN_KEY = 'chokan/token';
const CACHE_KEY = 'chokan/entitlement';
const CACHE_DAYS = 7;
const UPGRADE_EVENT = 'chokan:upgrade';

export type Account = {
  loaded: boolean;
  /** 決済の設定があるか（ないあいだは「準備中」で、有料の枠は開いたまま）。 */
  billing: boolean;
  monthlyYen: number;
  token: string;
  periodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  busy: boolean;
  notice: string;
  error: string;
};

const store = (key: string, value?: string | null) => {
  try {
    if (value === undefined) return window.localStorage.getItem(key);
    if (value === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value);
  } catch { /* 保存できなくても動く */ }
  return null;
};

let account: Account = {
  loaded: false, billing: billingOn, monthlyYen: 450, token: store(TOKEN_KEY) ?? '', periodEnd: null, cancelAtPeriodEnd: false, busy: false, notice: '', error: '',
};
const listeners = new Set<() => void>();
const update = (patch: Partial<Account>) => { account = { ...account, ...patch }; listeners.forEach(listener => listener()); };

export const useAccount = () => useSyncExternalStore(
  listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => account, () => account,
);

async function api(path: string, init: RequestInit = {}, token = ''): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(new URL('api/' + path, document.baseURI).toString(), {
      ...init, signal: controller.signal, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
    });
  } finally { clearTimeout(timer); }
}

const remember = (active: boolean, periodEnd: number | null, cancelAtPeriodEnd: boolean) =>
  store(CACHE_KEY, JSON.stringify({ active, periodEnd, cancelAtPeriodEnd, at: Date.now() }));

/** サーバーに、設定と購入状態を確かめて、画面の状態に反映する。 */
export async function refresh() {
  let config: { billing?: boolean; monthlyYen?: number } | null = null;
  try {
    const response = await api('config');
    config = response.ok ? await response.json() : null;
  } catch { config = null; }

  // APIがない・決済の設定がない：有料の枠を開いたままにする（準備中）。
  if (!config?.billing) { update({ loaded: true, billing: false }); applyPlan('paid'); return; }
  update({ billing: true, monthlyYen: config.monthlyYen ?? 450 });

  const token = account.token;
  if (!token) { update({ loaded: true }); applyPlan('free'); return; }
  try {
    const response = await api('entitlement', {}, token);
    if (response.status === 401) { store(TOKEN_KEY, null); remember(false, null, false); update({ token: '', loaded: true }); applyPlan('free'); return; }
    if (!response.ok) throw new Error('entitlement ' + response.status);
    const body = await response.json();
    remember(Boolean(body.active), body.periodEnd ?? null, Boolean(body.cancelAtPeriodEnd));
    update({ loaded: true, periodEnd: body.periodEnd ?? null, cancelAtPeriodEnd: Boolean(body.cancelAtPeriodEnd) });
    applyPlan(body.active ? 'paid' : 'free');
  } catch {
    // 通信できないときは、前回の確認結果（7日以内）を使う。
    const cached = JSON.parse(store(CACHE_KEY) ?? 'null');
    const fresh = cached && Date.now() - cached.at < CACHE_DAYS * 86_400_000;
    update({ loaded: true });
    applyPlan(fresh && cached.active ? 'paid' : 'free');
  }
}

/** 購入のあと（?checkout=success&session_id=…）に戻ってきたとき：しるしを受け取って、URLをきれいにする。 */
export async function finishCheckout(): Promise<'success' | 'cancel' | null> {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const state = params.get('checkout');
  if (state !== 'success' && state !== 'cancel') return null;
  const sessionId = params.get('session_id');
  params.delete('checkout'); params.delete('session_id');
  window.history.replaceState(null, '', window.location.pathname + (params.toString() ? '?' + params : '') + window.location.hash);
  if (state === 'cancel') { update({ notice: 'お申込みは、完了していません。また、いつでもお申込みいただけます。' }); return 'cancel'; }
  update({ busy: true, error: '' });
  try {
    const response = await api('session?session_id=' + encodeURIComponent(sessionId ?? ''));
    const body = response.ok ? await response.json() : null;
    if (body?.active && body.token) {
      store(TOKEN_KEY, body.token);
      update({ token: body.token, notice: '有料版のお申込みが完了しました。ありがとうございます。' });
      await refresh();
    } else {
      update({ error: 'お支払いの確認が、まだできていません。少し待ってから、もう一度、このページを開いてください。' });
    }
  } catch {
    update({ error: '通信できませんでした。少し待ってから、もう一度、お試しください。' });
  }
  update({ busy: false });
  return 'success';
}

async function redirectTo(path: string, token = '') {
  update({ busy: true, error: '' });
  try {
    const response = await api(path, { method: 'POST' }, token);
    const body = response.ok ? await response.json() : null;
    if (body?.url) { window.location.href = body.url; return; }
    update({ error: response.status === 401 ? '購入の確認ができませんでした。復元コードを、もう一度、入れてください。' : '決済の画面を開けませんでした。少し待ってから、もう一度、お試しください。' });
  } catch {
    update({ error: '通信できませんでした。少し待ってから、もう一度、お試しください。' });
  }
  update({ busy: false });
}

/** Stripeの購入画面へ進む。 */
export const startCheckout = () => redirectTo('checkout');
/** 解約・カード変更の管理ページへ進む。 */
export const openPortal = () => redirectTo('portal', account.token);

/** 別の端末で購入したときに、復元コード（しるし）を入れて、有料版にする。 */
export async function restore(code: string) {
  const token = code.trim();
  if (!token) return;
  update({ busy: true, error: '', notice: '' });
  try {
    const response = await api('entitlement', {}, token);
    const body = response.ok ? await response.json() : null;
    if (body?.active) {
      store(TOKEN_KEY, token);
      update({ token, notice: '有料版を復元しました。' });
      await refresh();
    } else {
      update({ error: '有効な有料版が見つかりませんでした。コードをお確かめください。' });
    }
  } catch {
    update({ error: '通信できませんでした。少し待ってから、もう一度、お試しください。' });
  }
  update({ busy: false });
}

/** この端末から、購入のしるしを消す（有料版の契約は、そのまま。解約ではない）。 */
export function forgetThisDevice() {
  store(TOKEN_KEY, null); store(CACHE_KEY, null);
  update({ token: '', periodEnd: null, cancelAtPeriodEnd: false, notice: 'この端末の有料版の設定を消しました。' });
  void refresh();
}

/** 画面のどこからでも、有料版のご案内を開く（App が受け取る）。 */
export const requestUpgrade = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(UPGRADE_EVENT)); };
export const UPGRADE = UPGRADE_EVENT;
