import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { currents, scenes, stages } from './art';
import { LayeredReading } from './DailyReading';
import { addDays, calendarEvents, dateKey, dateLabel, readDay, shortDate, tierColors, type Profile } from './domain';
import { BornSea, NameReadingDetails, TypeTraits } from './NameReading';
import { SelectedQuestionReading } from './Questions';
import { TideFlow } from './ResidentCard';
import { ctxFor, FIVE_PHASES, labelOf, OUTER, SEASON, STAGES } from './scoring';
import { Meter, SeaGlobe } from './TideCharts';
import { GodAnimation } from './GodAnimation';
import { PersonSwitcher, type Person } from './People';
import { CountUp, Float, glow, GlowPulse, Reveal, Sparkles, TierStrip, TypeText, Waves } from './Visual';
import { Button, C, Card, Chip, Chips, Fold, NextLinks, S, Tile, display, rounded } from './ui';
import { findQuestion, nextTideChange, ownResident, revisitQuestion, type Question, type Reflection, type SavedQuestion } from './voyage';

type Reading = ReturnType<typeof readDay>;
// 結果の演出は、その人・その日の初回だけフル再生。再訪は即表示（「もう一度」で再生できる）。
const seenResults = new Set<string>();
const tierIcons = ['🎣', '⛵', '🌙', '⚡', '🌀'];
type FoldId = 'why' | 'me' | 'layers' | 'flow' | 'moon';

export function Today({ people, activeId, onSwitch, onAdd, onManage, today, profile, goMyth, openCalendar, create, ranks, onSave, questions, reflections, openQuestion, openQuestions, openHomecoming,
  shareTideCard, goSelf, openExplanation, startQuiz, selfLast, selectedQuestion }: {
  people: Person[]; activeId: number | null; onSwitch: (id: number) => void; onAdd: () => void; onManage: () => void;
  today: Date; profile: Profile | null; goMyth: () => void; openCalendar: (date: Date, mode: 'current' | 'stage') => void;
  create: () => void; ranks: (date: Date) => void; onSave: (day: string) => void;
  questions: SavedQuestion[]; reflections: Reflection[]; openQuestion: (id: string) => void;
  openQuestions: () => void; openHomecoming: (year: number) => void;
  shareTideCard: () => void; goSelf: () => void; openExplanation: () => void; startQuiz: () => void;
  selfLast: { name: string; mark: string; color: string } | null;
  selectedQuestion?: { question: Question; saved: boolean; toggle: () => void; compare: () => void };
}) {
  const [offset, setOffset] = useState(0);
  const [shareMessage, setShareMessage] = useState('');
  const [fold, setFold] = useState<FoldId | null>(null);
  const [showScore, setShowScore] = useState(false);
  const toggle = (id: FoldId) => setFold(current => current === id ? null : id);
  const date = addDays(today, offset);
  const [replay, setReplay] = useState(0);
  const [skipKey, setSkipKey] = useState('');
  const seenKey = activeId + '-' + dateKey(date);
  const playKey = seenKey + '-' + replay;
  const wasSeen = useMemo(() => replay === 0 && seenResults.has(seenKey), [seenKey, replay]);
  useEffect(() => { seenResults.add(seenKey); }, [seenKey]);
  const instant = wasSeen || skipKey === playKey;
  const reading = profile && readDay(date, profile);
  const c = reading?.context ?? ctxFor(date);
  const events = calendarEvents(date, profile);
  const previous = offset === 0 && revisitQuestion(events, today, questions, reflections);
  const question = previous && findQuestion(previous.id);
  const next = nextTideChange(today);
  const isNewMoon = events.some(event => event.includes('新月'));
  const isFullMoon = events.some(event => event.includes('満月'));
  const isToday = offset === 0;
  const resident = profile && ownResident(profile);
  const currentQuestion = isToday && profile ? selectedQuestion : undefined;
  const revisit = question && previous && question.id !== currentQuestion?.question.id ? question : null;
  const departureDay = isToday && events.includes('私の出航日') && (!previous || !previous.title.startsWith('出航日'));
  const tideChange = isToday && events.some(event => event.includes('潮替わり'));
  const homecoming = isToday && events.includes('帰郷の年');
  const dayWord = isToday ? '今日' : shortDate(c);

  function selectDay(value: number) {
    setOffset(Math.min(0, value));
    setShareMessage('');
    setFold(null);
  }

  async function share() {
    if (!reading) return;
    const message = ['潮環占い｜' + dateLabel(c), (resident ? resident.band + '（' + resident.subtitle + '）名札 ' + labelOf(reading.row.t) : labelOf(reading.row.t)) + '　' + reading.row.rank + '位／160 · ' + reading.outlook.title,
      reading.outlook.line, '今日の一手　' + reading.outlook.action].join('\n');
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) await navigator.share({ text: message });
        else if (navigator.clipboard) {
          await navigator.clipboard.writeText(message);
          setShareMessage('コピーしました。');
        } else setShareMessage(message);
      } else await Share.share({ message });
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setShareMessage(message);
    }
  }

  const dayNavigation = <View style={S.between}>
    <Chip onPress={() => selectDay(offset - 1)}>‹ 前の日</Chip>
    <Chip active={offset === 0} onPress={() => selectDay(0)}>今日</Chip>
    <Text style={S.tiny}>明日の結果は、明日のお楽しみ</Text>
  </View>;

  const moonCard = <View style={S.stack}>
    <Text style={S.h3}>{c.moon}　·　{c.phaseTide}</Text>
    <SeaGlobe context={c} />
    <Text style={S.body}>月齢 {c.age.toFixed(1)}／地球から約 {Math.round(c.dist).toLocaleString('ja-JP')} km（{c.tide}）</Text>
    {(isNewMoon || isFullMoon) && <Text style={S.body}>{isNewMoon ? '新月：これから始めたいことを一つ選ぶ節目です。' : '満月：いま手元にあるものを確かめる節目です。'}</Text>}
  </View>;

  /* ---------- はじめての人：目的別の入口 ---------- */
  if (!reading || !profile) return <View style={S.stack}>
    <Text accessibilityRole="header" style={styles.welcome}>どちらから{' '}はじめる？</Text>
    <Door color={C.gold} big badge="まずはこれ" kicker="占い" title="今日の運勢を占う" hint="生年月日と名前だけ・30秒" cta="占ってみる" onPress={create}
      art={<Float><GodAnimation forcePlay index={4} style={{ width: 104 }} /></Float>} />
    <Door color="#9fd8c7" kicker="自己診断" title="自己純度を測る" hint="名前も入力もなし・約1分" cta="診断する" onPress={startQuiz}
      art={<Float><Text style={styles.doorIcon}>🧭</Text></Float>} />
    <View style={S.row}>
      <Pressable accessibilityRole="button" onPress={openQuestions} style={({ pressed }) => [S.card, styles.small, pressed && { opacity: .7 }]}>
        <Text style={styles.smallIcon}>💭</Text><Text style={S.h3}>悩みから問いを読む</Text><Text style={S.tiny}>入力なし</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={openExplanation} style={({ pressed }) => [S.card, styles.small, pressed && { opacity: .7 }]}>
        <Text style={styles.smallIcon}>📖</Text><Text style={S.h3}>仕組みを知る</Text><Text style={S.tiny}>図で説明</Text>
      </Pressable>
    </View>
    <Fold title="今日の海をのぞく" hint="日付と月だけでわかる、今日の海のようす" open={fold === 'moon'} onToggle={() => toggle('moon')}>
      <Text style={S.tiny}>{c.yearPillar}　／　{OUTER[c.outer].n}　／　{c.solarMonthTerm} {STAGES[c.stage].n}</Text>
      {moonCard}
    </Fold>
    <Text style={S.tiny}>入力した内容はこの端末の中だけで使います。</Text>
  </View>;

  /* ---------- 結論ファースト ---------- */
  const { outlook, row } = reading;
  // 荒波・轟沈は「注意」を赤で示し、ゆっくり脈打つ光で目を引く。
  const tierColor = ['#efd393', '#b6dfc4', '#c1d2ef', '#ff5a4d', '#e0245e'][reading.layers.day];
  const danger = reading.layers.day >= 3;
  const pulse = (spread: number) => `0 0 0 1px ${tierColor}66, 0 0 ${spread}px ${tierColor}${spread > 40 ? '99' : '55'}`;
  const events2 = events;
  const activePerson = people.find(person => person.id === activeId);
  return <View style={S.stack}>
    <Pressable accessible={false} onPress={() => setSkipKey(playKey)}>
    <View key={playKey} style={[styles.poster, glow(tierColor), { borderColor: tierColor, boxShadow: pulse(48) } as object]}>
      <Waves color={tierColor} amp={[5, 7, 9, 15, 20][reading.layers.day]} />
      {danger && <GlowPulse color={tierColor} />}
      <Sparkles color={tierColor} />
      <View style={S.between}>
        <Text style={S.kicker}>{dateLabel(c)}</Text>
        <Text style={[S.kicker, { color: C.ink, opacity: .7 }]}>潮環占い</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Reveal kind="pop" instant={instant}><Float><GodAnimation forcePlay index={profile.t.mod} style={{ width: 84 }} /></Float></Reveal>
        {activePerson && !activePerson.me && <Text style={S.tiny}>{activePerson.inputs.name}さんのタイプ</Text>}
        <View accessible accessibilityRole="header" accessibilityLabel={labelOf(profile.t)} style={{ flexDirection: 'row' }}>
          {[...labelOf(profile.t)].map((char, index) => <Reveal key={index} kind="pop" delay={260 + index * 90} instant={instant}><Text style={styles.plate}>{char}</Text></Reveal>)}
        </View>
        <Reveal kind="up" delay={760} instant={instant}><Text style={styles.typeName}>{resident?.band}</Text></Reveal>
      </View>
      <Reveal kind="fade" delay={1000} instant={instant}>
        <View style={styles.todayHead}>
          <View style={[styles.rule, { backgroundColor: tierColor }]} />
          <Text style={[styles.todayLabel, { color: tierColor }]}>{dayWord}の運勢</Text>
          <View style={[styles.rule, { backgroundColor: tierColor }]} />
        </View>
      </Reveal>
      <View style={{ alignItems: 'center', gap: 0 }}>
        <Reveal kind="slam" delay={1200} instant={instant}><Text style={[styles.tier, { color: tierColor }]}>{tierIcons[reading.layers.day]} {outlook.title}</Text></Reveal>
        <Reveal kind="fade" delay={1500} instant={instant}>
          <Text style={styles.rankLine}><CountUp to={row.rank} delay={1500} instant={instant} style={[styles.rankNum, { color: tierColor }]} /> 位 / 160</Text>
        </Reveal>
      </View>
      <Reveal kind="up" delay={2300} instant={instant}><TierStrip level={reading.layers.day} /></Reveal>
      <TypeText text={outlook.line} delay={2600} speed={26} instant={instant} style={styles.line} />
      <Reveal kind="up" delay={2600 + outlook.line.length * 26 + 200} instant={instant}>
        <View style={styles.action}>
          <Text style={S.kicker}>{dayWord}の一手</Text>
          <Text style={styles.actionText}>{outlook.action}</Text>
        </View>
      </Reveal>
    </View>
    </Pressable>
    <Chips>
      <Chip onPress={() => setReplay(value => value + 1)}>▶ もう一度見る</Chip>
    </Chips>
    {dayNavigation}
    <PersonSwitcher people={people} activeId={activeId} onSwitch={onSwitch} onAdd={onAdd} onManage={onManage} />
    <Chips>
      <Chip onPress={() => { void share(); }}>テキストで共有</Chip>
    </Chips>
    {!!shareMessage && <Text selectable accessibilityLiveRegion="polite" style={S.tiny}>{shareMessage}</Text>}

    {!!events2.length && <Chips>{events2.map(event => <Chip key={event}>{event}</Chip>)}</Chips>}
    {currentQuestion && <SelectedQuestionReading question={currentQuestion.question} profile={profile} />}
    {revisit && previous && <Card>
      <Text style={S.kicker}>{previous.title}</Text>
      <Text style={S.h3}>{revisit.question}</Text>
      <Button quiet onPress={() => openQuestion(revisit.id)}>問いを読み直す</Button>
    </Card>}
    {departureDay && <Card>
      <Text style={S.h3}>今日は、あなたの出航日</Text>
      <Text style={S.body}>この一年で見え方が変わった出来事を、一つ思い出してみましょう。</Text>
    </Card>}
    {tideChange && <Card>
      <Text style={S.h3}>潮替わり · {STAGES[c.stage].n}</Text>
      <Text style={S.body}>{c.solarMonthTerm}からの海況です。いま気になることを一つ選んでみましょう。</Text>
      <Button quiet onPress={openQuestions}>新しい問いを選ぶ</Button>
    </Card>}
    {homecoming && <Card>
      <Text style={S.h3}>帰郷の年</Text>
      <Text style={S.body}>{c.solarYear - 12}年と同じ海流が巡っています。</Text>
      <Button quiet onPress={() => openHomecoming(c.solarYear - 12)}>{(c.solarYear - 12) + '年の海と記録を見る'}</Button>
    </Card>}

    <Text style={S.h2}>気になるところをタップ</Text>
    <Fold title="なぜこの結果なの？" hint="2つの力と、点数の理由" open={fold === 'why'} onToggle={() => toggle('why')}>
      <Text style={S.body}>{outlook.detail}</Text>
      <Text style={S.tiny}>年の海・節気の海・今日の月を重ねて決まります。</Text>
      <Button quiet onPress={() => setShowScore(!showScore)}>{showScore ? '点数の内訳を閉じる' : '点数の内訳まで見る'}</Button>
      {showScore && <ReadingReasons reading={reading} />}
    </Fold>
    <Fold title="自分のタイプと人間関係のヒント" hint={resident ? resident.band + '・' + labelOf(profile.t) : undefined} open={fold === 'me'} onToggle={() => toggle('me')}>
      {resident && <TypeTraits entry={resident} />}
      <BornSea profile={profile} />
      <NameReadingDetails profile={profile} />
    </Fold>
    <Fold title="今日・今月・今年の流れ" hint="3つの海を重ねて読む" open={fold === 'layers'} onToggle={() => toggle('layers')}>
      <LayeredReading reading={reading} isToday={isToday}>
        <Text style={S.tiny}>次の潮替わり　{dateKey(next.date)} ／ あと{next.days}日</Text>
      </LayeredReading>
    </Fold>
    <Fold title="これから1年の運勢カレンダー" hint="年の海流と月ごとの海況" open={fold === 'flow'} onToggle={() => toggle('flow')}>
      <TideFlow profile={profile} context={c} showCalendar={openCalendar} />
      <Button quiet onPress={() => openCalendar(date, 'current')}>運勢の流れを詳しく見る</Button>
    </Fold>
    <Fold title="今日の月と潮" hint={c.moon + '・' + c.phaseTide} open={fold === 'moon'} onToggle={() => toggle('moon')}>
      {moonCard}
    </Fold>

    <Pressable accessibilityRole="button" onPress={selfLast ? goSelf : startQuiz} style={({ pressed }) => [styles.banner, pressed && { opacity: .8 }]}>
      <Text style={{ fontSize: 30 }}>{selfLast ? selfLast.mark : '🧭'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[S.kicker, { color: '#9fd8c7' }]}>自己診断</Text>
        <Text style={S.h3}>{selfLast ? '前回は「' + selfLast.name + '」。変化を見る' : 'あなたは自分で選べてる？（約1分）'}</Text>
      </View>
      <Text style={[S.h2, { color: '#9fd8c7' }]}>›</Text>
    </Pressable>

    <Text style={S.h2}>次はどうする？</Text>
    <NextLinks items={[
      { icon: '🧭', label: '自分の判断を見つめる（自己純度）', hint: '8つの場面を直感で選ぶ・約1分', onPress: goSelf },
      { icon: '💭', label: '今の気持ちに近い問いを読む', hint: '悩みから選べます', onPress: openQuestions },
      { icon: '📊', label: 'この日の160名札の順位', hint: '全タイプの中での位置', onPress: () => ranks(date) },
      { icon: '🖼️', label: '潮札を画像で共有', onPress: shareTideCard },
    ]} />
    <View style={S.row}>
      <Tile source={currents[c.outer]} subtitle="今年の海流" title={OUTER[c.outer].n} onPress={() => openCalendar(date, 'current')} />
      <Tile source={stages[c.stage]} subtitle="節気の海況" title={STAGES[c.stage].n} onPress={() => openCalendar(date, 'stage')} />
    </View>
    <View style={S.row}><Tile source={scenes[0]} subtitle="潮環神話" title="見られなかった海" onPress={goMyth} /></View>
  </View>;
}

function Door({ color, big, badge, kicker, title, hint, cta, onPress, art }: {
  color: string; big?: boolean; badge?: string; kicker: string; title: string; hint: string; cta: string; onPress: () => void; art: ReactNode;
}) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.door, glow(color), { borderColor: color, minHeight: big ? 210 : 150 }, pressed && { opacity: .8 }]}>
    <View style={{ flex: 1, gap: 6, justifyContent: 'center' }}>
      {badge && <View style={[styles.badge, { backgroundColor: color }]}><Text style={styles.badgeText}>{badge}</Text></View>}
      <Text style={[S.kicker, { color }]}>{kicker}</Text>
      <Text style={[styles.doorTitle, big && { fontSize: 28, lineHeight: 36 }]}>{title}</Text>
      <Text style={S.body}>{hint}</Text>
      <View style={[styles.cta, { backgroundColor: color }]}><Text style={styles.ctaText}>{cta}　›</Text></View>
    </View>
    {art}
  </Pressable>;
}

function ReadingReasons({ reading }: { reading: Reading }) {
  const { context: c, row, personal, personalRank, force, fivePhase } = reading;
  const { p, t } = row;
  const season = SEASON[t.mod];
  const factors = [
    { title: '海況の基礎点', score: p.base, note: STAGES[c.stage].d },
    { title: '季節 × 月の形', score: p.moon, note: season.n + 'は' + season.moon + 'に力が出ます。今日の月は「' + c.moon + '」。深さが得意な月相を少しずらします。' },
    { title: '深さ × 月の距離', score: p.depth, note: '今日の月は約' + (c.dist / 10000).toFixed(1) + '万km。深い名札は近い月、浅い名札は遠い月の潮に乗りやすくなります。' },
    { title: '季節の拠点 × 節気・五行', score: p.aff, note: season.n + 'の拠点は「' + STAGES[season.home].n + '」。' + c.solarMonthTerm + 'の月令は' + FIVE_PHASES[fivePhase.month].name + 'で、季節の型との関係は「' + fivePhase.monthRelation.kind + '」です。' },
    { title: '季節 × 年の干支五行', score: p.comp, note: c.yearPillar + '年の年干は' + c.yearPolarity + 'の' + FIVE_PHASES[fivePhase.year].name + '（' + fivePhase.yearRelation.kind + '）、年支は' + FIVE_PHASES[fivePhase.yearBranch].name + '（' + fivePhase.yearBranchRelation.kind + '）。' + (t.minus ? '「−」の名札では関係の向きが反転します。' : '') },
    ...(t.minus ? [{ title: '「−」の向かい風', score: p.hw, note: '向かい風体質にかかる補正です。' }] : []),
    ...(t.A ? [{ title: 'A（渦）× 月の距離', score: p.vor, note: '月が近いほど、渦の力が強く表れます。' }] : []),
    { title: '日の干支 × 名札の波', score: p.day, note: c.dayPillar + '日の日干は' + c.dayPolarity + 'の' + FIVE_PHASES[fivePhase.day].name + '。季節の型との関係は「' + fivePhase.dayRelation.kind + '」で、12の地支をめぐる日の波は「' + STAGES[p.dpos].n + '」です。' },
  ];

  return <View style={S.stack}>
    <Text accessibilityRole="header" style={S.kicker}>鑑定の根拠</Text>
    <Text style={S.h2}>二つの力と、点数の内訳</Text>
    <Meter title="自分が進む" value={force.go} caption={force.go >= .5 ? '好機' : '控えめ'} />
    <Meter title="周りを変える" value={force.change} color="#a8c4f0" caption={force.change >= .5 ? '届きやすい' : '控えめ'} />
    {factors.map(({ title, score, note }) => <View key={title} style={styles.factor}>
      <View style={S.between}><Text style={S.h3}>{title}</Text><Text style={[S.tiny, { color: score < 0 ? '#efb2b0' : C.gold }]}>{score > 0 ? '+' : ''}{score.toFixed(1)}点</Text></View>
      <Text style={S.body}>{note}</Text>
    </View>)}
    <Text style={S.h3}>名札 {row.score.toFixed(1)}点　／　全体平均 {reading.mean.toFixed(1)}点</Text>
    <Text style={S.body}>あなた個人の日の海は「{STAGES[personal.pos].n}」。誕生日と総画数から読んだ補正{personal.delta >= 0 ? '+' : ''}{personal.delta.toFixed(1)}点{personal.ret ? '（帰郷の年の加点を含む）' : ''}{t.A ? 'と、Aの渦による振れ幅' : ''}を重ねると、{personalRank}位相当です。</Text>
  </View>;
}


const styles = StyleSheet.create({
  door: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 24, padding: 18, overflow: 'hidden' },
  doorTitle: { color: C.ink, fontSize: 22, lineHeight: 30, fontWeight: '800' },
  doorIcon: { fontSize: 64, lineHeight: 76 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: C.dark, fontSize: 12, fontWeight: '800' },
  cta: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, marginTop: 4 },
  ctaText: { color: C.dark, fontSize: 16, fontWeight: '800' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: '#9fd8c7', backgroundColor: '#12303a' },
  small: { flex: 1, padding: 14, gap: 4, minHeight: 100 },
  smallIcon: { fontSize: 26 },
  hero: { borderWidth: 1, borderColor: '#4c5271', borderRadius: 22, padding: 18, gap: 12, backgroundColor: '#141e37' },
  welcome: { color: C.ink, fontSize: 32, lineHeight: 44, fontWeight: '800' },
  poster: { borderWidth: 3, borderRadius: 28, padding: 18, gap: 10, overflow: 'hidden', backgroundColor: '#141e37' },
  plate: { color: C.ink, fontSize: 58, lineHeight: 66, fontFamily: display, textAlign: 'center' },
  todayHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  rule: { flex: 1, height: 2, borderRadius: 1, opacity: 0.6 },
  todayLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  tag: { marginTop: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, borderWidth: 1, backgroundColor: '#0f1830' },
  tagText: { color: C.ink, fontSize: 13, fontWeight: '800' },
  typeName: { color: C.ink, fontSize: 20, lineHeight: 28, textAlign: 'center', fontFamily: rounded, fontWeight: '900' },
  tier: { fontSize: 40, lineHeight: 48, fontFamily: display },
  rankLine: { color: C.muted, fontSize: 18, fontWeight: '800' },
  rankNum: { fontSize: 30, fontWeight: '800' },
  line: { color: C.ink, fontSize: 21, lineHeight: 32, fontFamily: rounded, fontWeight: '700', textAlign: 'center' },
  tierIcon: { fontSize: 34, lineHeight: 42 },
  action: { gap: 4, padding: 14, borderRadius: 16, backgroundColor: '#0f1830', borderWidth: 1, borderColor: C.line },
  actionText: { color: C.ink, fontSize: 19, lineHeight: 28, fontWeight: '800' },
  factor: { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, gap: 3 },
});
