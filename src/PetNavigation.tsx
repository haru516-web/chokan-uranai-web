import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SEASON } from './scoring';
import { C } from './ui';

// ヘッダー直下のグローバルナビ。いまいる場所を強調し、どこに何があるかを一目で示す。
export const mainTabs = [
  { id: 'today', label: '今日', title: '今日の占い', mark: '☾' },
  { id: 'self', label: '自分', title: '自己純度', mark: '◇' },
  { id: 'questions', label: '問い', title: '問いの海', mark: '◌' },
  { id: 'chart', label: '海図', title: '人生の海図', mark: '◈' },
  { id: 'atlas', label: '図鑑', title: '住人図鑑', mark: '✦' },
  { id: 'journal', label: '航海帳', title: '航海帳（記録）', mark: '⌑' },
] as const;

export type MainTab = typeof mainTabs[number]['id'];

export function TabBar({ seasonIndex, activeTab, onSelect, wide }: {
  seasonIndex: number | null; activeTab: MainTab; onSelect: (tab: MainTab) => void; wide?: boolean;
}) {
  const tint = seasonIndex !== null && seasonIndex >= 0 && seasonIndex < SEASON.length ? SEASON[seasonIndex].col : C.gold;
  // 一般的なウェブサイトと同じ、ヘッダー直下のグローバルナビ。現在地に下線。狭い画面では横スクロール。
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" style={s.top}
    contentContainerStyle={wide ? s.topWide : undefined}>
    {mainTabs.map(item => {
      const active = item.id === activeTab;
      return <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onSelect(item.id)}
        style={({ pressed }) => [s.topTab, wide && { flex: 1 }, active && { borderBottomColor: tint }, pressed && { opacity: .6 }]}>
        <Text style={[s.topLabel, active && { color: C.ink }]}>{wide ? item.title.replace('（記録）', '') : item.label}</Text>
      </Pressable>;
    })}
  </ScrollView>;
}

const s = StyleSheet.create({
  top: { flexGrow: 0, flexShrink: 0, backgroundColor: '#0d1324', borderBottomWidth: 1, borderBottomColor: C.line },
  topWide: { flexGrow: 1 },
  topTab: { paddingHorizontal: 16, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  topLabel: { fontSize: 14, fontWeight: '800', color: C.muted },
});
