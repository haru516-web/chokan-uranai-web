import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { GodAnimation } from './GodAnimation';
import type { readDay } from './domain';
import { labelOf } from './scoring';
import { C, display, rounded, S } from './ui';
import { Burst, Float, fx, glow, GlowPulse, Reveal, Sparkles, TierStrip, TypeText, Waves } from './Visual';

type Reading = ReturnType<typeof readDay>;

// 5段階の色。荒波・轟沈は「注意」を赤で示す。
const COLORS = ['#efd393', '#b6dfc4', '#c1d2ef', '#ff5a4d', '#e0245e'];
const levelOfRank = (rank: number) => rank <= 16 ? 0 : rank <= 56 ? 1 : rank <= 104 ? 2 : rank <= 144 ? 3 : 4;

const COUNT_START = 1300;
const COUNT_MS = 2200;
const DONE_AT = COUNT_START + COUNT_MS;

const asStyle = (style: object) => style as unknown as ViewStyle;

/**
 * 占い結果のポスター。順位を1位から数え上げ、通過する段階の色へ枠・波・数字が変わっていき、
 * 該当順位で止まった瞬間に全体が「確定」の動きをする。
 */
export function ResultPoster({ reading, band, personName, dateText, dayWord, instant }: {
  reading: Reading; band?: string; personName?: string; dateText: string; dayWord: string; instant: boolean;
}) {
  const rank = reading.row.rank;
  const finalLevel = levelOfRank(rank);
  const [value, setValue] = useState(instant ? rank : 1);
  const [done, setDone] = useState(instant);

  useEffect(() => {
    if (instant) { setValue(rank); setDone(true); return; }
    setValue(1);
    setDone(false);
    let frame = 0;
    const start = performance.now() + COUNT_START;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / COUNT_MS));
      setValue(Math.max(1, Math.round(1 + (rank - 1) * (1 - Math.pow(1 - progress, 2.2)))));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setDone(true);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rank, instant]);

  const level = done ? finalLevel : levelOfRank(value);
  const color = COLORS[level];
  const danger = done && finalLevel >= 3;
  const confirm = done && !instant;
  const punch = (delay = 0) => confirm ? { ...fx('punch'), style: asStyle({ animationDelay: delay + 'ms' }) } : {};
  const plate = [...labelOf(reading.row.t)];
  const lineDelay = instant ? 0 : DONE_AT + 500;

  return <View {...(confirm ? fx('confirm') : {})} style={[styles.poster, glow(color), asStyle({
    borderColor: color, boxShadow: `0 0 0 1px ${color}66, 0 0 48px ${color}55`, transitionProperty: 'border-color, box-shadow', transitionDuration: '300ms',
  })]}>
    <Waves color={color} amp={[5, 7, 9, 15, 20][level]} />
    {danger && <GlowPulse color={color} />}
    <Sparkles color={color} />
    {confirm && <Burst color={color} />}
    <View style={S.between}>
      <Text style={S.kicker}>{dateText}</Text>
      <Text style={[S.kicker, { color: C.ink, opacity: .7 }]}>潮環占い</Text>
    </View>
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Reveal kind="pop" instant={instant}>
        <View {...(confirm ? fx('jump') : {})}><Float><GodAnimation forcePlay index={reading.row.t.mod} style={{ width: 84 }} /></Float></View>
      </Reveal>
      {personName && <Text style={S.tiny}>{personName}さんのタイプ</Text>}
      <View accessible accessibilityRole="header" accessibilityLabel={labelOf(reading.row.t)} style={{ flexDirection: 'row' }}>
        {plate.map((char, index) => <Reveal key={index} kind="pop" delay={260 + index * 90} instant={instant}>
          <View {...punch(index * 70)}><Text style={styles.plate}>{char}</Text></View>
        </Reveal>)}
      </View>
      <Reveal kind="up" delay={760} instant={instant}><Text style={styles.typeName}>{band}</Text></Reveal>
    </View>
    <Reveal kind="fade" delay={1000} instant={instant}>
      <View style={styles.todayHead}>
        <View style={[styles.rule, { backgroundColor: color }]} />
        <Text style={[styles.todayLabel, { color }]}>{dayWord}の運勢</Text>
        <View style={[styles.rule, { backgroundColor: color }]} />
      </View>
    </Reveal>
    <Reveal kind="fade" delay={1100} instant={instant} style={{ alignItems: 'center' }}>
      <View {...punch(150)}>
        <Text accessibilityLabel={`${dayWord}は160タイプ中${rank}位`} style={styles.rankLine}>
          <Text style={[styles.rankNum, { color }]}>{value}</Text> 位 / 160
        </Text>
      </View>
    </Reveal>
    <Reveal kind="up" delay={1200} instant={instant}>
      <View {...punch(250)}><TierStrip level={level} /></View>
    </Reveal>
    <TypeText text={reading.outlook.line} delay={lineDelay} speed={26} instant={instant} style={styles.line} />
    <Reveal kind="up" delay={lineDelay + reading.outlook.line.length * 26 + 200} instant={instant}>
      <View style={styles.action}>
        <Text style={S.kicker}>{dayWord}の一手</Text>
        <Text style={styles.actionText}>{reading.outlook.action}</Text>
      </View>
    </Reveal>
  </View>;
}

const styles = StyleSheet.create({
  poster: { borderWidth: 3, borderRadius: 28, padding: 18, gap: 12, overflow: 'hidden', backgroundColor: '#141e37' },
  plate: { color: C.ink, fontSize: 58, lineHeight: 66, fontFamily: display, textAlign: 'center' },
  typeName: { color: C.ink, fontSize: 20, lineHeight: 28, textAlign: 'center', fontFamily: rounded, fontWeight: '900' },
  todayHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  rule: { flex: 1, height: 2, borderRadius: 1, opacity: 0.6 },
  todayLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  rankLine: { color: C.muted, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  rankNum: { fontSize: 44, fontWeight: '800', fontVariant: ['tabular-nums'] },
  line: { color: C.ink, fontSize: 20, lineHeight: 31, fontFamily: rounded, fontWeight: '700', textAlign: 'center' },
  action: { gap: 4, padding: 14, borderRadius: 16, backgroundColor: '#0f1830', borderWidth: 1, borderColor: C.line },
  actionText: { color: C.ink, fontSize: 19, lineHeight: 28, fontWeight: '800' },
});
