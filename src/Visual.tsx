// 画面に感情の起伏をつくる演出部品（ふわっと登場／きらきら／ゲージ／2軸マップ）。
// web 専用の CSS アニメーション（RN-web の animationKeyframes）を使う。
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C, display as displayFont } from './ui';

const anim = (style: object) => style as unknown as ViewStyle;
/** CSS 側（styles.css）で定義したアニメーションを data 属性で当てる。 */
export const fx = (name: string, delay = 0) => ({ dataSet: { fx: name, d: delay } }) as object;


/** ふわっと弾んで登場する。 */
export type RevealKind = 'pop' | 'slam' | 'up' | 'fade';
/** 時間差で姿を現す。instant なら演出なしで即表示。 */
export function Reveal({ children, kind = 'pop', delay = 0, style, instant }: {
  children: ReactNode; kind?: RevealKind; delay?: number; style?: StyleProp<ViewStyle>; instant?: boolean;
}) {
  return <View {...(instant ? {} : fx(kind))} style={[instant ? null : anim({ animationDelay: delay + 'ms' }), style]}>{children}</View>;
}

/** ふわっと弾んで登場する。 */
export function Pop({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <Reveal kind="pop" delay={delay} style={style}>{children}</Reveal>;
}

/** ゆらゆら浮かぶ。 */
export function Float({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View {...fx('float')} style={style}>{children}</View>;
}

const stars = [
  { l: '6%', t: '10%', d: 0, s: 16 }, { l: '88%', t: '8%', d: 400, s: 20 }, { l: '78%', t: '46%', d: 900, s: 12 },
  { l: '14%', t: '64%', d: 300, s: 14 }, { l: '92%', t: '78%', d: 1200, s: 16 }, { l: '48%', t: '4%', d: 700, s: 12 },
];
/** 背景にまたたく星。祝いたい場面（大漁・診断結果）に。 */
export function Sparkles({ color = C.gold }: { color?: string }) {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {stars.map((star, index) => <Text key={index} {...fx('twinkle', Math.round(star.d / 300))}
      style={{ position: 'absolute', left: star.l as never, top: star.t as never, fontSize: star.s, color }}>✦</Text>)}
  </View>;
}

/** 色つきのやわらかい背景（ヒーローカード用）。 */
export const glow = (color: string) => anim({
  backgroundImage: `linear-gradient(155deg, ${color}38 0%, #141e37 58%)`,
  boxShadow: `0 0 36px ${color}26`,
});

/** 160名札の中の位置を、バーで見せる。 */
export function RankGauge({ rank, total = 160, color }: { rank: number; total?: number; color: string }) {
  const percent = Math.max(2, Math.round((1 - (rank - 1) / (total - 1)) * 100));
  return <View style={{ gap: 4 }} accessible accessibilityLabel={`${total}タイプ中${rank}位`}>
    <View style={g.track}>
      <View style={[g.fill, { backgroundColor: color, width: `${percent}%` }]} />
      <View style={[g.knob, { left: `${percent}%`, borderColor: color }]} />
    </View>
    <View style={g.scale}><Text style={g.tick}>荒れる</Text><Text style={g.tick}>追い風</Text></View>
  </View>;
}

const g = StyleSheet.create({
  track: { height: 12, borderRadius: 6, backgroundColor: '#0e1424', justifyContent: 'center' },
  fill: { height: '100%', borderRadius: 6, opacity: 0.85 },
  knob: { position: 'absolute', width: 20, height: 20, marginLeft: -10, borderRadius: 10, backgroundColor: '#fbf3e0', borderWidth: 3 },
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
  tick: { color: '#7f8cab', fontSize: 11 },
});

type MapQuad = { name: string; color: string };
/** 自己純度（横）×自我強度（縦）の2軸マップ。いまの位置と前回の位置を見せる。 */
export function QuadMap({ p, s, prev, quads }: {
  p: number; s: number; prev?: { p: number; s: number }; quads: { compass: MapQuad; explorer: MapQuad; anchor: MapQuad; drift: MapQuad };
}) {
  const x0 = 30; const y0 = 10; const w = 262; const h = 200;
  const px = (v: number) => x0 + v / 100 * w;
  const py = (v: number) => y0 + (100 - v) / 100 * h;
  const cells = [
    { q: quads.anchor, x: x0, y: y0, tx: x0 + 8, ty: y0 + 18 },
    { q: quads.compass, x: x0 + w * 0.6, y: y0, tx: x0 + w - 8, ty: y0 + 18, end: true },
    { q: quads.drift, x: x0, y: y0 + h * 0.4, tx: x0 + 8, ty: y0 + h - 8 },
    { q: quads.explorer, x: x0 + w * 0.6, y: y0 + h * 0.4, tx: x0 + w - 8, ty: y0 + h - 8, end: true },
  ];
  const rects = [
    { x: x0, y: y0, w: w * 0.6, h: h * 0.4, c: quads.anchor.color }, { x: x0 + w * 0.6, y: y0, w: w * 0.4, h: h * 0.4, c: quads.compass.color },
    { x: x0, y: y0 + h * 0.4, w: w * 0.6, h: h * 0.6, c: quads.drift.color }, { x: x0 + w * 0.6, y: y0 + h * 0.4, w: w * 0.4, h: h * 0.6, c: quads.explorer.color },
  ];
  return <svg viewBox="0 0 300 236" width="100%" role="img" aria-label={`自己純度${p}、自我強度${s}の位置`} style={{ display: 'block' }}>
    {rects.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} opacity=".14" />)}
    <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="#414e6a" strokeWidth="1" rx="6" />
    {cells.map(cell => <text key={cell.q.name} x={cell.tx} y={cell.ty} fontSize="11" fontWeight="700" fill={cell.q.color}
      textAnchor={cell.end ? 'end' : 'start'} opacity=".95">{cell.q.name}</text>)}
    <text x={x0 + w / 2} y="230" fontSize="11" fill="#bac6dd" textAnchor="middle">自己純度 →（自分で選べている）</text>
    <text x="10" y={y0 + h / 2} fontSize="11" fill="#bac6dd" textAnchor="middle" transform={`rotate(-90 10 ${y0 + h / 2})`}>自我強度 →</text>
    {prev && <>
      <line x1={px(prev.p)} y1={py(prev.s)} x2={px(p)} y2={py(s)} stroke="#fbf3e0" strokeWidth="1.5" strokeDasharray="3 4" opacity=".6" />
      <circle cx={px(prev.p)} cy={py(prev.s)} r="6" fill="none" stroke="#fbf3e0" strokeWidth="1.5" opacity=".7" />
    </>}
    <circle cx={px(p)} cy={py(s)} r="16" fill="#eacc8c" opacity=".25">
      <animate attributeName="r" values="10;20;10" dur="2.4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values=".4;0;.4" dur="2.4s" repeatCount="indefinite" />
    </circle>
    <circle cx={px(p)} cy={py(s)} r="8" fill="#eacc8c" stroke="#10172a" strokeWidth="2.5" />
  </svg>;
}

const tierNames = ['大漁', '順風', '凪', '荒波', '轟沈'];
const tierCols = ['#efd393', '#b6dfc4', '#c1d2ef', '#ff5a4d', '#e0245e'];
/** 5段階を並べ、いまの段階だけ大きく強調する。 */
export function TierStrip({ level }: { level: number }) {
  return <View style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-end' }} accessible accessibilityLabel={'今日は5段階中、' + tierNames[level]}>
    {tierNames.map((name, index) => {
      const active = index === level;
      return <View key={name} style={{ flex: active ? 2.4 : 1, gap: 4, alignItems: 'center' }}>
        <Text style={{ fontSize: active ? 32 : 11, lineHeight: active ? 48 : 15, paddingTop: active ? 4 : 0, marginBottom: active ? 4 : 0, fontWeight: active ? '400' : '800', color: active ? tierCols[index] : '#6c7896', fontFamily: active ? displayFont : undefined }}>{name}</Text>
        <View style={{ height: active ? 12 : 7, alignSelf: 'stretch', borderRadius: 6, backgroundColor: tierCols[index], opacity: active ? 1 : 0.3 }} />
      </View>;
    })}
  </View>;
}

/** 確定の瞬間、中心から星がはじけ飛ぶ。 */
export function Burst({ color }: { color: string }) {
  return <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
    {Array.from({ length: 12 }, (_, i) => <Text key={i} {...({ dataSet: { fx: 'burst', i } } as object)} style={{ position: 'absolute', marginLeft: -9, marginTop: -11, fontSize: 18, color }}>✦</Text>)}
    <View {...fx('ring')} style={{ position: 'absolute', width: 60, height: 60, marginLeft: -30, marginTop: -30, borderRadius: 30, borderWidth: 3, borderColor: color }} />
  </View>;
}

/** 枠の内側がゆっくり脈打つように光る（注意が必要な日用）。 */
export function GlowPulse({ color, radius = 25 }: { color: string; radius?: number }) {
  return <View pointerEvents="none" {...fx('pulse')} style={[StyleSheet.absoluteFill, anim({ borderRadius: radius, boxShadow: `inset 0 0 38px 4px ${color}aa` })]} />;
}

/** from から to まで数字をカウントする。 */
export function CountUp({ to, from = 160, delay = 0, duration = 1200, instant, style }: {
  to: number; from?: number; delay?: number; duration?: number; instant?: boolean; style?: StyleProp<import('react-native').TextStyle>;
}) {
  const [value, setValue] = useState(instant ? to : from);
  useEffect(() => {
    if (instant) { setValue(to); return; }
    setValue(from);
    let frame = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(from + (to - from) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, from, delay, duration, instant]);
  return <Text style={style}>{value}</Text>;
}

/** 1文字ずつ打ち出す。レイアウトは最初から全文ぶんを確保して揺れないようにする。 */
export function TypeText({ text, delay = 0, speed = 30, instant, style }: {
  text: string; delay?: number; speed?: number; instant?: boolean; style?: StyleProp<import('react-native').TextStyle>;
}) {
  const [count, setCount] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) { setCount(text.length); return; }
    setCount(0);
    let index = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    const starter = setTimeout(() => {
      timer = setInterval(() => {
        index += 1;
        setCount(index);
        if (index >= text.length && timer) clearInterval(timer);
      }, speed);
    }, delay);
    return () => { clearTimeout(starter); if (timer) clearInterval(timer); };
  }, [text, delay, speed, instant]);
  return <Text style={style} accessibilityLabel={text}>
    <Text>{text.slice(0, count)}</Text><Text style={{ opacity: 0 }}>{text.slice(count)}</Text>
  </Text>;
}

function wavePath(amp: number, phase: number) {
  const points: string[] = [];
  for (let x = 0; x <= 800; x += 10) points.push((x === 0 ? 'M' : 'L') + x + ' ' + (34 + amp * Math.sin(2 * Math.PI * x / 200 + phase)).toFixed(1));
  return points.join(' ') + ' L800 80 L0 80 Z';
}
/** 下から寄せる波。荒れる日ほど波が高い。 */
export function Waves({ color, amp = 8 }: { color: string; amp?: number }) {
  return <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, overflow: 'hidden', opacity: 0.32 }}>
    <div className="fx-wave-a" style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', height: 64 }}>
      <svg viewBox="0 0 800 80" preserveAspectRatio="none" width="100%" height="64"><path d={wavePath(amp, 0)} fill={color} opacity=".8" /></svg>
    </div>
    <div className="fx-wave-b" style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', height: 64 }}>
      <svg viewBox="0 0 800 80" preserveAspectRatio="none" width="100%" height="64"><path d={wavePath(amp * 0.7, 2)} fill={color} opacity=".6" /></svg>
    </div>
  </View>;
}
