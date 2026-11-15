// いま「有料版」か「無料版」か。画面は、ここだけを見る。
//   公開（本番）では、サーバーの確認結果（entitlement.ts）だけが、これを変える。
//   手元の開発（npm run dev）だけは、確認のための切り替え（setPlan）が使える。
//   決済を始めていないあいだ（VITE_BILLING が 1 でないビルド）は、有料の枠を開いたままにする。
import { useSyncExternalStore } from 'react';

export type Plan = 'free' | 'paid';

const BILLING_ON = import.meta.env.VITE_BILLING === '1';
const DEV_KEY = 'chokan/plan';
const listeners = new Set<() => void>();

function initial(): Plan {
  try {
    if (import.meta.env.DEV) return window.localStorage.getItem(DEV_KEY) === 'free' ? 'free' : 'paid';
    if (!BILLING_ON) return 'paid';
    // 決済を始めているときは、前回の確認結果（端末に残した）を使い、サーバーの確認が終わるまでの間も、画面を安定させる。
    const cached = JSON.parse(window.localStorage.getItem('chokan/entitlement') ?? 'null');
    const fresh = cached && Date.now() - cached.at < 7 * 86_400_000;
    return fresh && cached.active && window.localStorage.getItem('chokan/token') ? 'paid' : 'free';
  } catch {
    return BILLING_ON ? 'free' : 'paid';
  }
}

let current: Plan = typeof window === 'undefined' ? 'paid' : initial();

export const billingOn = BILLING_ON;
export function applyPlan(next: Plan) {
  if (next === current) return;
  current = next;
  listeners.forEach(listener => listener());
}

/** 手元の開発だけで使う、無料版・有料版の切り替え。公開のビルドでは、何もしない。 */
export function setPlan(next: Plan) {
  if (!import.meta.env.DEV) return;
  try { window.localStorage.setItem(DEV_KEY, next); } catch { /* 保存できなくても動く */ }
  applyPlan(next);
}

export function usePlan(): Plan {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => current, () => 'paid' as Plan);
}
