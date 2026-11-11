import { StyleSheet, Text, View } from 'react-native';
import { shortDate, tierColors, tiers, type readDay } from './domain';
import { FIVE_PHASES, OUTER, STAGES } from './scoring';
import { Card, S } from './ui';
import type { ReactNode } from 'react';

type ReadingCardProps = { reading: ReturnType<typeof readDay>; isToday?: boolean; children?: ReactNode };

export function DailyAdvice({ reading, isToday = true, children }: ReadingCardProps) {
  const { row, outlook } = reading;
  const day = isToday ? '今日' : 'この日';
  return <Card>
    <Text accessibilityRole="header" style={S.kicker}>{day}のひと言</Text>
    <Text style={S.h2}>{outlook.line}</Text>
    <Text style={S.body}>{outlook.detail}</Text>
    <View style={styles.action}>
      <Text accessibilityRole="header" style={S.kicker}>{day}の一手</Text>
      <Text style={S.h2}>{outlook.action}</Text>
      {row.t.minus && row.rank > 80 && <Text style={S.body}>「−」の名札は向かい風を受けやすい読みです。今いる場所を守ることも、一つの舵の切り方です。</Text>}
      {children}
    </View>
  </Card>;
}

export function LayeredReading({ reading, isToday = true, children }: ReadingCardProps) {
  const { context, layers, fivePhase } = reading;
  return <Card>
    <Text style={S.kicker}>年・節気・{isToday ? '今日' : 'この日'}</Text>
    <Text accessibilityRole="header" style={S.h2}>三つの海を重ねて読む</Text>
    <View style={S.row}>
      {([
        [context.yearPillar + '年', OUTER[context.outer].th, layers.year],
        [context.solarMonthTerm, STAGES[context.stage].n, layers.block],
        [shortDate(context), context.dayPillar + ' · ' + context.moon, layers.day],
      ] as const).map(([when, theme, level]) => <View key={when} style={[styles.layer, { borderTopColor: tierColors[level] }]}>
        <Text style={S.tiny}>{when}</Text>
        <Text style={[S.h3, { color: tierColors[level] }]}>{tiers[level]}</Text>
        <Text style={S.tiny}>{theme}</Text>
      </View>)}
    </View>
    <Text style={S.tiny}>潮環の季節型 {FIVE_PHASES[fivePhase.personal].name} × 年干 {FIVE_PHASES[fivePhase.year].name}（{fivePhase.yearRelation.kind}）・年支 {FIVE_PHASES[fivePhase.yearBranch].name}（{fivePhase.yearBranchRelation.kind}）× 月 {FIVE_PHASES[fivePhase.month].name}（{fivePhase.monthRelation.kind}）× 日 {FIVE_PHASES[fivePhase.day].name}（{fivePhase.dayRelation.kind}）</Text>
    <Text style={S.body}>{layers.text}</Text>
    {children}
  </Card>;
}

const styles = StyleSheet.create({
  action: { gap: 8, paddingTop: 12, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#41516e' },
  layer: { flex: 1, minWidth: 0, gap: 4, borderTopWidth: 2, padding: 7, backgroundColor: '#111b32', borderRadius: 6 },
});
