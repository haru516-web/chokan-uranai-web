// 無料版／有料版の切り替え（確認用）と、有料の場所を無料版でぼかす枠。
// 有料にする場所は PREMIUM_SECTIONS に名前を足し、画面側で <Premium id="名前"> で包む。
import { useSyncExternalStore, type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { C } from './ui';

/** 有料版でだけ読める場所の名前。ここに無い名前の <Premium> は、無料版でもそのまま見える。 */
export const PREMIUM_SECTIONS: string[] = [
  'areaText',  // 今日タブ・二「分野別の運勢」の文（星と点数は無料）
  'breakdown', // 今日タブ・一「今日、あなたの海に効いていること」の内訳
  'layers',    // 今日タブ・三「年・月・日」の読みの文（輪の絵は無料）
  'lucky',     // 今日タブ・四「ラッキー」の方角・時間・もの・数字（色は無料）
  'tomorrow',  // 今日タブ・終「予告」（明日の潮）
];

export type Plan = 'free' | 'paid';
const KEY = 'chokan/plan';
const listeners = new Set<() => void>();
let current: Plan = 'paid';
try { if (typeof window !== 'undefined' && window.localStorage.getItem(KEY) === 'free') current = 'free'; } catch { /* 保存できなくても動く */ }

export function setPlan(next: Plan) {
  current = next;
  try { window.localStorage.setItem(KEY, next); } catch { /* 保存できなくても動く */ }
  listeners.forEach(listener => listener());
}

export const isLocked = (id: string, plan: Plan) => plan === 'free' && PREMIUM_SECTIONS.includes(id);

export function usePlan(): Plan {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => current, () => 'paid' as Plan);
}

/** 有料の場所。無料版ではぼかして、触れないようにし、鍵の案内を重ねる。 */
export function Premium({ id, children, label = '有料版で読めます', compact }: { id: string; children: ReactNode; label?: string; compact?: boolean }) {
  const plan = usePlan();
  const locked = isLocked(id, plan);
  if (!locked) return <>{children}</>;
  return <View style={styles.wrap}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ filter: 'blur(7px)', opacity: 0.8, userSelect: 'none' } as unknown as ViewStyle}>{children}</View>
    <View style={styles.badge} pointerEvents="none"><Text style={[styles.badgeText, compact && { fontSize: 12, paddingHorizontal: 10, paddingVertical: 5 }]}>🔒 {compact ? '有料版' : label}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden', borderRadius: 18 },
  badge: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: C.ink, fontSize: 15, fontWeight: '900', backgroundColor: 'rgba(16,23,42,.82)', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, overflow: 'hidden' },
});
