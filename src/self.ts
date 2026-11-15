// 自己純度・自我強度（潮環占いとは独立した「いまの自分を見つめる」コンテンツ）のデータと採点。
// 占いの結果とは混ぜない。点数は心理測定ではなく「いまの目安」。

export type Option = { text: string; p: number; s: number };
export type Scene = { id: string; tag: string; scene: string; options: Option[] };

// テーマは「航海」。どの選択肢も「ありうる反応」として書く。正解が一目で分かる並びにしない。
export const scenes: Scene[] = [
  { id: 'trend', tag: '港選び', scene: '周りの船が、いっせいに同じ港へ向かっている', options: [
    { text: 'みんなが行くなら安心', p: 0, s: 0 },
    { text: '人気の港は避ける', p: 1, s: 2 },
    { text: '自分の海図で行き先を確かめる', p: 3, s: 3 },
    { text: 'とりあえず寄ってから決める', p: 3, s: 2 },
  ] },
  { id: 'mocked', tag: '宝物', scene: '大切にしている宝を、ほかの船乗りに笑われた', options: [
    { text: '船倉の奥に隠すようになる', p: 0, s: 0 },
    { text: '気にせず積んだままにする', p: 2, s: 3 },
    { text: 'なぜ大切なのか考え直す', p: 3, s: 2 },
    { text: '笑った人の話も聞いてみる', p: 2, s: 1 },
  ] },
  { id: 'mentor', tag: '船長', scene: '尊敬する船長に、進路を否定された', options: [
    { text: '船長が言うなら正しい', p: 0, s: 0 },
    { text: '納得できないので進路は変えない', p: 1, s: 3 },
    { text: '理由を聞いて、自分で海図を引き直す', p: 3, s: 3 },
    { text: '答えは保留。しばらく様子を見る', p: 2, s: 2 },
  ] },
  { id: 'love', tag: '灯台', scene: '気になる船の針路は、自分とは違った', options: [
    { text: '相手に合わせて進路を変える', p: 1, s: 0 },
    { text: '合わせるけど、本当は別の港に行きたい', p: 0, s: 1 },
    { text: '自分の行き先も伝える', p: 3, s: 3 },
    { text: '同じ航路を、少し試してみる', p: 3, s: 2 },
  ] },
  { id: 'unseen', tag: '無人の海', scene: '誰にも見られない海で、続けたい航海がある', options: [
    { text: '見ている人がいれば続ける', p: 1, s: 1 },
    { text: '役に立たない航海ならやめる', p: 1, s: 1 },
    { text: '誰にも見られなくても続ける', p: 3, s: 3 },
    { text: '仲間に話して、意味を確かめる', p: 2, s: 2 },
  ] },
  { id: 'sns', tag: '狼煙', scene: '上げた狼煙に、どの船も気づかなかった', options: [
    { text: '気づかれやすい色に変える', p: 0, s: 0 },
    { text: '何がズレたか自分で考える', p: 3, s: 2 },
    { text: '落ち込むけど、また上げる', p: 2, s: 2 },
    { text: '自分が満足ならそれでいい', p: 3, s: 3 },
  ] },
  { id: 'fail', tag: '座礁', scene: '自分で決めた進路で、船が座礁した', options: [
    { text: '進路を勧めた人のせいだと思う', p: 0, s: 0 },
    { text: 'なぜその進路を選んだか振り返る', p: 3, s: 3 },
    { text: '次は人の意見を多めに聞く', p: 1, s: 1 },
    { text: '失敗も自分の舵取りと受け止める', p: 3, s: 2 },
  ] },
  { id: 'shift', tag: '風向き', scene: '見知らぬ風が吹いて、心が揺れた', options: [
    { text: 'すぐ帆の向きを変える', p: 0, s: 0 },
    { text: '帆をたたんで、風を避ける', p: 1, s: 2 },
    { text: '揺れる自分の船を観察する', p: 2, s: 2 },
    { text: '自分の羅針盤に照らして考える', p: 3, s: 3 },
  ] },
];


export type Quad = 'compass' | 'explorer' | 'anchor' | 'drift';
export const quads: Record<Quad, { name: string; mark: string; line: string; ask: string; color: string }> = {
  compass: { name: '羅針盤の人', mark: '🧭', line: '自分の物差しで選び、揺れても戻ってこられる。', ask: 'その物差しは、いつ・何で作られた？', color: '#eacc8c' },
  explorer: { name: '探索の人', mark: '🔭', line: '自分で選んでいる。物差しはまだ育ち中で、動いていい。', ask: '最近「これは好き」と言い切れたものは？', color: '#b6dfc4' },
  anchor: { name: '錨の人', mark: '⚓', line: '守る力が強い。その基準が自分発かを、ときどき確かめたい。', ask: '守っているものは、誰の言葉から来た？', color: '#c1d2ef' },
  drift: { name: '潮に乗る人', mark: '🌊', line: '周りの空気を読む力がある。いまは自分の好みを探す時期。', ask: '誰にも言わなくていい。本当は何が好き？', color: '#e3af92' },
};

export type SelfResult = { id: number; day: string; p: number; s: number; answers: number[] };

export function score(answers: number[]) {
  const n = scenes.length;
  const p = answers.reduce((sum, a, i) => sum + scenes[i].options[a].p, 0);
  const s = answers.reduce((sum, a, i) => sum + scenes[i].options[a].s, 0);
  return { p: Math.round(p / (3 * n) * 100), s: Math.round(s / (3 * n) * 100) };
}

export function quadOf(p: number, s: number): Quad {
  if (p >= 60) return s >= 60 ? 'compass' : 'explorer';
  return s >= 60 ? 'anchor' : 'drift';
}

// 自分の判断が出た場面／周りに寄った場面
export function highlights(answers: number[]) {
  const own: string[] = [];
  const other: string[] = [];
  answers.forEach((a, i) => {
    const o = scenes[i].options[a];
    if (o.p >= 3) own.push(scenes[i].tag);
    else if (o.p === 0) other.push(scenes[i].tag);
  });
  return { own, other };
}

export function changedCount(a: number[], b: number[]) {
  return a.reduce((sum, v, i) => sum + (v !== b[i] ? 1 : 0), 0);
}

// 最近の選択チェック（10秒）
export type Check = { day: string; reason: number };
export const reasons = [
  { text: '自分が好きだから', own: true },
  { text: '試して納得した', own: true },
  { text: '人に聞いて、納得した', own: true },
  { text: 'みんなが選んでた', own: false },
  { text: 'なんとなく', own: false },
] as const;

// 意志 → 潮 → 選ぶ → 振り返り
export type Move = {
  id: number; day: string; wish: string; want: number; tide: number | null; choice: number; why: string;
  after?: { done: number; learn: string };
};
export const wishIdeas = ['作品を出す', '会いに行く', '新しく始める', '何かをやめる', '部屋を整える', '想いを伝える'];
export const wants = ['動きたい', '迷ってる', '休みたい'];
export const choices = [
  { text: '動く', mark: '⛵' },
  { text: '準備する', mark: '🧭' },
  { text: '見送る', mark: '⚓' },
];
export const whys = ['望みが強い', '期限がある', 'まだ不安', '他を優先したい'];
export const dones = ['できた', '少しだけ', 'できなかった'];
export const learns = ['やって良かった', '思ってたのと違った', '理由は自分のものだった', '人の目が気になってた'];

// 潮の段階（0 凱風 1 順風 2 凪 3 荒波 4 轟沈）→ 3つの行動の象徴
export function tideGuide(tier: number) {
  if (tier <= 1) return { mark: '⛵', name: '帆を張る日', line: '温めたものを、小さく外へ出してみる日。', suggest: 0 };
  if (tier === 2) return { mark: '🧭', name: '方角を確かめる日', line: '何を望むか整えて、準備する日。', suggest: 1 };
  return { mark: '⚓', name: '錨を下ろす日', line: '無理に決めず、守るものを見直す日。', suggest: 2 };
}

// 8問を答えた時の「占いの住人」からの問い（点数には使わない）
export const residentAsk = [
  '好きになったものに、共通点はある？', '誰かを支えるのは、期待のため？ 自分の望み？',
  '周りが反対しても、自分の言葉で説明できる？', '理解されない間も、自分の美意識を保てる？',
  '誰も見てないとき、何を楽しんでる？', '頼まれたとき、守るもののために断れる？',
  '賛同者がいなくても、旗を掲げ続けたい？', '熱を守りつつ、必要なときは外へ出せる？',
  '世間が見落とす価値を、自分で拾えてる？', '分け与えるのは、承認のため？ 自分の望み？',
  '社会の成功とは別の、自分の成功ってどんなもの？', '過去を、自分の判断で手放せる？',
  '周りと違う違和感を、自分の言葉にできる？', '変わらないのは、何を守りたいから？',
  '多数派から離れて、自分で判断できてる？', '納得するまで、問いを持っていられる？',
];

export type SelfState = { results: SelfResult[]; checks: Check[]; moves: Move[]; wish: string };
export const emptySelf: SelfState = { results: [], checks: [], moves: [], wish: '' };

export const sceneIcons: Record<string, string> = { trend: '🏝️', mocked: '💎', mentor: '⛵', love: '🗼', unseen: '🌌', sns: '🔥', fail: '🪨', shift: '🌬️' };
export const optionColors = ['#eacc8c', '#9fd8c7', '#a8c4f0', '#e3af92'];
