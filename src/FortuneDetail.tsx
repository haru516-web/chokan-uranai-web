// 占い結果の下に並ぶ「詳しい運勢」：海のようす、分野別の星、ラッキー項目、明日の潮。
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { iconArt, tierArt } from './art';
import type { Fortune, tomorrowFor } from './fortune';
import { Image } from './web/image';
import { Gloss, useGloss } from './Glossary';
import { Art, C, rounded, S, display } from './ui';
import { fx, Waves } from './Visual';

const asStyle = (style: object) => style as unknown as ViewStyle;
const TIER_COLORS = ['#efd393', '#b6dfc4', '#c1d2ef', '#ff5a4d', '#e0245e'];

/** 画面に入ってきたときに一度だけ true になる。スクロールして見えた瞬間に演出を始めるため。 */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setSeen(true); observer.disconnect(); }
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

/** 見えた瞬間に、ふわっと現れる枠。 */
export function Appear({ children, style, delay = 0 }: { children: ReactNode; style?: ViewStyle | ViewStyle[]; delay?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <View ref={ref as never} {...(seen ? fx('up') : {})} style={[style, asStyle(seen ? { animationDelay: delay + 'ms' } : { opacity: 0 })]}>{children}</View>;
}

function Stars({ count, color, play, delay }: { count: number; color: string; play: boolean; delay: number }) {
  return <View accessible accessibilityLabel={`5段階中${count}`} style={{ flexDirection: 'row', gap: 2 }}>
    {Array.from({ length: 5 }, (_, index) => {
      const on = index < count;
      return <Text key={index} {...(play && on ? fx('star') : {})}
        style={[styles.star, { color: on ? color : '#3a4664' }, asStyle(play && on ? { animationDelay: delay + index * 110 + 'ms' } : {})]}>★</Text>;
    })}
  </View>;
}

export function FortuneAreas({ fortune, dayWord, hideSea }: { fortune: Fortune; dayWord: string; hideSea?: boolean }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <View ref={ref as never} style={S.stack}>
    {!hideSea && <View style={S.card}>
      {tierArt[fortune.level] && <Art source={tierArt[fortune.level]!} height={140} />}
      <View style={styles.sea}>
        <Text style={S.kicker}>{dayWord}の海のようす</Text>
        <Text style={styles.seaText}>{fortune.sea}</Text>
      </View>
    </View>}
    <View style={styles.grid}>
      {fortune.areas.map((area, index) => <View key={area.id} {...(seen ? fx('pop') : {})}
        style={[S.card, styles.area, asStyle(seen ? { animationDelay: index * 110 + 'ms', borderColor: area.color + '66' } : { opacity: 0 })]}>
        <View style={S.between}>
          <View style={[styles.areaIcon, { backgroundColor: area.color + '26', borderColor: area.color + '88' }]}>{iconArt[area.id] ? <Image source={iconArt[area.id]!} style={{ width: 28, height: 28 }} contentFit="contain" accessible={false} /> : <Text style={{ color: area.color, fontSize: 18, fontWeight: '900' }}>{area.icon}</Text>}</View>
          {area.id === fortune.best.id && <View style={[styles.best, { backgroundColor: area.color }]}><Text style={styles.bestText}>いちばん</Text></View>}
        </View>
        <Text style={S.h3}>{area.label}</Text>
        <Stars count={area.stars} color={area.color} play={seen} delay={300 + index * 110} />
        <Text style={styles.areaText}>{area.text}</Text>
      </View>)}
    </View>
  </View>;
}

export function LuckyCard({ fortune, dayWord }: { fortune: Fortune; dayWord: string }) {
  const { lucky } = fortune;
  const open = useGloss();
  const rows = [
    { label: '方角', value: lucky.direction, mark: '⌖' },
    { label: '時間', value: lucky.time, mark: '◔' },
    { label: 'もの', value: lucky.item, mark: '✧' },
    { label: '数字', value: String(lucky.number), mark: '＃' },
  ];
  return <Appear style={[S.card, styles.lucky]}>
    <View style={S.between}>
      <Text style={S.kicker}>{dayWord}のお守り</Text>
      <Text accessibilityRole="button" onPress={() => open('五行')} style={[S.tiny, styles.link]}>五行「{lucky.element}」から</Text>
    </View>
    <View style={styles.colorRow}>
      <View {...fx('orb')} style={[styles.orb, asStyle({ backgroundColor: lucky.color.hex, boxShadow: `0 0 26px ${lucky.color.hex}aa, inset 0 -8px 14px rgba(0,0,0,.28), inset 0 6px 10px rgba(255,255,255,.45)` })]} />
      <View style={{ flex: 1 }}>
        <Text style={S.tiny}>ラッキーカラー</Text>
        <Text style={styles.colorName}>{lucky.color.name}</Text>
      </View>
    </View>
    <View style={styles.luckyGrid}>
      {rows.map(row => <View key={row.label} style={styles.luckyCell}>
        <Text style={styles.luckyMark}>{row.mark}</Text>
        <View style={{ flex: 1 }}>
          <Text style={S.tiny}>{row.label}</Text>
          <Text style={styles.luckyValue}>{row.value}</Text>
        </View>
      </View>)}
    </View>
  </Appear>;
}

export function TomorrowCard({ tomorrow }: { tomorrow: ReturnType<typeof tomorrowFor> }) {
  const open = useGloss();
  const color = TIER_COLORS[tomorrow.level];
  const arrow = tomorrow.trend === 'up' ? '↗' : tomorrow.trend === 'down' ? '↘' : '→';
  return <Appear style={[S.card, styles.tomorrow, asStyle({ borderColor: color + '99', backgroundImage: `linear-gradient(160deg, ${color}2e 0%, #141e37 62%)` })]}>
    <Waves color={color} level={Math.min(tomorrow.level, 1)} />
    <View style={S.between}>
      <Text style={S.kicker}>明日の潮　{tomorrow.month}月{tomorrow.day}日（{tomorrow.weekday}）</Text>
      <Text {...fx('float')} style={{ fontSize: 22 }}>🌙</Text>
    </View>
    <View style={styles.tomorrowHead}>
      <Text accessibilityRole="button" accessibilityLabel={tomorrow.tier + 'の説明を開く'} onPress={() => open(tomorrow.tier)}
        style={[styles.tomorrowTier, { color }]}>{tomorrow.tier}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.trend}><Text {...fx('nudge')} style={{ color }}>{arrow}</Text> {tomorrow.trendText}</Text>
        <Gloss style={S.tiny}>{`${tomorrow.moon}・${tomorrow.phaseTide}　／　海況「${tomorrow.stage}」`}</Gloss>
      </View>
    </View>
    {!!tomorrow.events.length && <Gloss style={[S.tiny, { color: C.gold }]}>{'◆ ' + tomorrow.events.join('　◆ ')}</Gloss>}
    <Text style={styles.tomorrowHint}>{tomorrow.hint}</Text>
    <View style={styles.sealed}>
      <Text style={styles.sealedText}>順位・ひと言・一手は、明日ひらきます</Text>
      <Text style={S.tiny}>日付が変わったら、また海を見に来てください。</Text>
    </View>
  </Appear>;
}

const styles = StyleSheet.create({
  sea: { padding: 16, gap: 6, backgroundColor: '#15213d' },
  seaText: { color: C.ink, fontSize: 17, lineHeight: 29, fontFamily: rounded, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  area: { flexGrow: 1, flexBasis: '46%', minWidth: 128, padding: 14, gap: 6 },
  areaIcon: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  areaText: { color: C.muted, fontSize: 14, lineHeight: 23 },
  best: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9 },
  bestText: { color: C.dark, fontSize: 12, fontWeight: '900' },
  star: { fontSize: 19, lineHeight: 24 },
  lucky: { padding: 16, gap: 12 },
  link: { textDecorationLine: 'underline', textDecorationStyle: 'dotted', color: C.aqua },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  orb: { width: 58, height: 58, borderRadius: 29 },
  colorName: { color: C.ink, fontSize: 26, lineHeight: 36, fontFamily: rounded, fontWeight: '900' },
  luckyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  luckyCell: { flexGrow: 1, flexBasis: '46%', minWidth: 140, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, backgroundColor: '#111a31', borderWidth: 1, borderColor: C.line },
  luckyMark: { color: C.gold, fontSize: 20, width: 24, textAlign: 'center' },
  luckyValue: { color: C.ink, fontSize: 15, lineHeight: 22, fontWeight: '800' },
  tomorrow: { padding: 16, paddingBottom: 26, gap: 10, borderWidth: 1.5 },
  tomorrowHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tomorrowTier: { fontSize: 40, lineHeight: 54, fontFamily: display },
  trend: { color: C.ink, fontSize: 16, lineHeight: 24, fontWeight: '800' },
  tomorrowHint: { color: C.ink, fontSize: 15, lineHeight: 25 },
  sealed: { gap: 2, padding: 12, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#6c7896', backgroundColor: 'rgba(13,19,36,.7)' },
  sealedText: { color: C.ink, fontSize: 15, fontWeight: '800' },
});
