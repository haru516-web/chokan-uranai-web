import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SEASON } from './scoring';
import { C } from './ui';

// 常に見える下タブ。いまいる場所を強調し、どこに何があるかを一目で示す。
export const mainTabs = [
  { id: 'today', label: '今日', title: '今日の占い', mark: '☾' },
  { id: 'self', label: '自分', title: '自己純度', mark: '◇' },
  { id: 'questions', label: '問い', title: '問いの海', mark: '◌' },
  { id: 'chart', label: '海図', title: '人生の海図', mark: '◈' },
  { id: 'atlas', label: '図鑑', title: '住人図鑑', mark: '✦' },
  { id: 'journal', label: '航海帳', title: '航海帳（記録）', mark: '⌑' },
] as const;

export type MainTab = typeof mainTabs[number]['id'];

export function TabBar({ seasonIndex, activeTab, onSelect }: {
  seasonIndex: number | null; activeTab: MainTab; onSelect: (tab: MainTab) => void;
}) {
  const tint = seasonIndex !== null && seasonIndex >= 0 && seasonIndex < SEASON.length ? SEASON[seasonIndex].col : C.gold;
  return <View accessibilityRole="tablist" style={s.bar}>
    {mainTabs.map(item => {
      const active = item.id === activeTab;
      return <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={item.title}
        onPress={() => onSelect(item.id)} style={({ pressed }) => [s.tab, pressed && { opacity: .6 }]}>
        <View style={[s.pill, active && { backgroundColor: tint }]}>
          <Text style={[s.mark, active && { color: C.dark }]}>{item.mark}</Text>
        </View>
        <Text style={[s.label, active && { color: C.ink }]}>{item.label}</Text>
      </Pressable>;
    })}
  </View>;
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#0d1324', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6, paddingBottom: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52 },
  pill: { width: 46, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mark: { fontSize: 18, color: C.muted },
  label: { fontSize: 11, fontWeight: '800', color: C.muted },
});
