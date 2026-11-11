import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { C } from './ui';

// ヘッダー直下のグローバルナビ。いまいる場所を強調し、どこに何があるかを一目で示す。
export const mainTabs = [
  { id: 'today', label: '占い', title: '今日の占い', mark: '☾', accent: '#eacc8c' },
  { id: 'self', label: '自己診断', title: '自己純度', mark: '◇', accent: '#9fd8c7' },
  { id: 'questions', label: '問い', title: '問いの海', mark: '◌', accent: '#a8c4f0' },
  { id: 'chart', label: '人生', title: '人生の流れ', mark: '◈', accent: '#f0b48f' },
  { id: 'atlas', label: '図鑑', title: '住人図鑑', mark: '✦', accent: '#d6a8e8' },
  { id: 'journal', label: '記録', title: '記録（航海帳）', mark: '⌑', accent: '#e8d29a' },
] as const;

export type MainTab = typeof mainTabs[number]['id'];

export function TabBar({ seasonIndex, activeTab, onSelect, wide }: {
  seasonIndex: number | null; activeTab: MainTab; onSelect: (tab: MainTab) => void; wide?: boolean;
}) {
  // 一般的なウェブサイトと同じ、ヘッダー直下のグローバルナビ。現在地に下線。狭い画面では横スクロール。
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" style={s.top}
    contentContainerStyle={wide ? s.topWide : undefined}>
    {mainTabs.map(item => {
      const active = item.id === activeTab;
      return <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onSelect(item.id)}
        style={({ pressed }) => [s.topTab, wide && { flex: 1 }, active && { borderBottomColor: item.accent }, pressed && { opacity: .6 }]}>
        <Text style={[s.topLabel, active && { color: item.accent }]}>{wide ? item.title.replace('（航海帳）', '') : item.label}</Text>
      </Pressable>;
    })}
  </ScrollView>;
}

const s = StyleSheet.create({
  top: { flexGrow: 0, flexShrink: 0, backgroundColor: '#0d1324', borderBottomWidth: 1, borderBottomColor: C.line },
  topWide: { flexGrow: 1 },
  topTab: { paddingHorizontal: 11, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  topLabel: { fontSize: 14, fontWeight: '800', color: C.muted },
});
