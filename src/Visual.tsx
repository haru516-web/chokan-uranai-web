// 画面に感情の起伏をつくる演出部品（ふわっと登場／きらきら／ゲージ／2軸マップ）。
// web 専用の CSS アニメーション（RN-web の animationKeyframes）を使う。
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C } from './ui';

const anim = (style: object) => style as unknown as ViewStyle;

const popKeys = {
  '0%': { opacity: 0, transform: [{ scale: 0.8 }, { translateY: 16 }] },
  '60%': { opacity: 1, transform: [{ scale: 1.05 }, { translateY: 0 }] },
  '100%': { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }] },
};
const twinkleKeys = {
  '0%': { opacity: 0.15, transform: [{ scale: 0.6 }] },
  '50%': { opacity: 1, transform: [{ scale: 1.25 }] },
  '100%': { opacity: 0.15, transform: [{ scale: 0.6 }] },
};
const floatKeys = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -8 }] },
  '100%': { transform: [{ translateY: 0 }] },
};

/** ふわっと弾んで登場する。 */
export function Pop({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[anim({
    animationKeyframes: popKeys, animationDuration: '620ms', animationDelay: delay + 'ms',
    animationFillMode: 'both', animationTimingFunction: 'cubic-bezier(.2,.8,.2,1)',
  }), style]}>{children}</View>;
}

/** ゆらゆら浮かぶ。 */
export function Float({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[anim({
    animationKeyframes: floatKeys, animationDuration: '3.2s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
  }), style]}>{children}</View>;
}

const stars = [
  { l: '6%', t: '10%', d: 0, s: 16 }, { l: '88%', t: '8%', d: 400, s: 20 }, { l: '78%', t: '46%', d: 900, s: 12 },
  { l: '14%', t: '64%', d: 300, s: 14 }, { l: '92%', t: '78%', d: 1200, s: 16 }, { l: '48%', t: '4%', d: 700, s: 12 },
];
/** 背景にまたたく星。祝いたい場面（大漁・診断結果）に。 */
export function Sparkles({ color = C.gold }: { color?: string }) {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {stars.map((star, index) => <Text key={index} style={[anim({
      position: 'absolute', left: star.l, top: star.t, fontSize: star.s, color,
      animationKeyframes: twinkleKeys, animationDuration: '2.4s', animationDelay: star.d + 'ms',
      animationIterationCount: 'infinite',
    })]}>✦</Text>)}
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
/** 5段階のどこにいるかを、色つきの帯で見せる。今日の段階だけ強調。 */
export function TierStrip({ level }: { level: number }) {
  return <View style={{ flexDirection: 'row', gap: 5 }} accessible accessibilityLabel={'今日は5段階中、' + tierNames[level]}>
    {tierNames.map((name, index) => <View key={name} style={{ flex: index === level ? 1.6 : 1, gap: 4, alignItems: 'center' }}>
      <View style={{ height: index === level ? 12 : 7, alignSelf: 'stretch', borderRadius: 6, backgroundColor: tierCols[index], opacity: index === level ? 1 : 0.3 }} />
      <Text style={{ fontSize: 11, fontWeight: '800', color: index === level ? tierCols[index] : '#6c7896' }}>{name}</Text>
    </View>)}
  </View>;
}
