// 相性の設計。16タイプ（季節4 × 深さ4）の全136通りの組み合わせを、同じ規則で読む。
//   季節の関係 … 五行（木＝春・火＝夏・金＝秋・水＝冬）の相生・相剋・同気で10通り。基準点と文章はここから。
//   深さの差   … 0〜3の4通り。分野ごとに、近いほうが良い／少し違うほうが良い、が変わる。
//   組み合わせごとの微調整 … 136通りが全部ちがう点数になるよう、組み合わせから決まる小さなゆらぎ（±3）。
//   各タイプの特徴・影・問い … residents.json の文を、そのまま二人の読みに差し込む。
// 同じ組み合わせなら、どちらから見ても必ず同じ結果になる（順序に依存しない）。
import compatText from './compatText.json';
import residents from './residents.json';
import { hash } from './fortune';

export const AREAS = [
  { id: 'love', label: '恋愛', color: '#f0a8c0', glyph: '♡' },
  { id: 'marriage', label: '結婚', color: '#c9b6ef', glyph: '❖' },
  { id: 'work', label: '仕事', color: '#eacc8c', glyph: '⚓' },
  { id: 'friend', label: '友情', color: '#b6dfc4', glyph: '☘' },
] as const;
export type AreaId = typeof AREAS[number]['id'];

export const DEPTH_NAMES = ['浅瀬', '沿岸', '沖合', '深海'] as const;
export const SEASON_NAMES = ['春', '夏', '秋', '冬'] as const;

/** 住人番号（0〜15）→ 季節（0春 1夏 2秋 3冬）と深さ（0浅瀬〜3深海）。 */
export const seasonOfResident = (index: number) => index >> 2;
export const depthOfResident = (index: number) => index & 3;

// 深さの差（0〜3）が、分野ごとの点数に与える補正。
const DEPTH_ADJUST: Record<AreaId, number[]> = {
  love: [6, 3, -2, -6],
  marriage: [8, 4, -2, -8],
  work: [-3, 5, 4, -3],
  friend: [4, 4, 0, -4],
};

const clamp = (value: number) => Math.max(40, Math.min(98, Math.round(value)));

export const LEVELS = [
  { min: 86, name: 'ぴったり', stars: 5 },
  { min: 76, name: 'とても良い', stars: 4 },
  { min: 66, name: '良い', stars: 3 },
  { min: 56, name: 'おだやか', stars: 2 },
  { min: 0, name: '育てる相性', stars: 1 },
] as const;
export const levelOf = (score: number) => LEVELS.find(level => score >= level.min)!;

type SeasonText = typeof compatText.seasons[keyof typeof compatText.seasons];
const seasonKey = (a: number, b: number) => Math.min(seasonOfResident(a), seasonOfResident(b)) + '-' + Math.max(seasonOfResident(a), seasonOfResident(b));

function scoreOf(a: number, b: number, area: AreaId, base: number) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const gap = Math.abs(depthOfResident(a) - depthOfResident(b));
  const jitter = (hash(lo * 16 + hi + AREAS.findIndex(item => item.id === area) * 997) % 7) - 3;
  return clamp(base + DEPTH_ADJUST[area][gap] + jitter);
}

export function compat(a: number, b: number) {
  const season = (compatText.seasons as Record<string, SeasonText>)[seasonKey(a, b)];
  const gap = Math.abs(depthOfResident(a) - depthOfResident(b));
  const first = residents[a], second = residents[b];
  const areas = AREAS.map((area, i) => {
    const score = scoreOf(a, b, area.id, season.base[i]);
    return { ...area, score, level: levelOf(score), text: season[area.id] };
  });
  const total = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  return {
    season, depth: compatText.depths[gap], gap, first, second, areas, total, level: levelOf(total),
    sameType: a === b,
  };
}
export type Compat = ReturnType<typeof compat>;

/** 自分のタイプから見た、16タイプ全員との総合点（高い順）。 */
export function rankAll(own: number) {
  return residents.map((_, index) => ({ index, total: compat(own, index).total }))
    .sort((x, y) => y.total - x.total || x.index - y.index);
}
