import { useState } from 'react';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';
import { currents, scenes, stages } from './art';
import { LayeredReading } from './DailyReading';
import { addDays, calendarEvents, dateKey, dateLabel, readDay, shortDate, tierColors, type Profile } from './domain';
import { BornSea, NameReadingDetails, TypeTraits } from './NameReading';
import { SelectedQuestionReading } from './Questions';
import { TideFlow } from './ResidentCard';
import { ctxFor, FIVE_PHASES, labelOf, OUTER, SEASON, STAGES } from './scoring';
import { Meter, SeaGlobe } from './TideCharts';
import { Button, C, Card, Chip, Chips, Fold, NextLinks, S, Tile } from './ui';
import { findQuestion, nextTideChange, ownResident, revisitQuestion, type Question, type Reflection, type SavedQuestion } from './voyage';

type Reading = ReturnType<typeof readDay>;
type FoldId = 'why' | 'me' | 'layers' | 'flow' | 'moon';

export function Today({ today, profile, goMyth, openCalendar, create, ranks, onSave, questions, reflections, openQuestion, openQuestions, openHomecoming,
  shareTideCard, openSelf, goSelf, openExplanation, startQuiz, selectedQuestion }: {
  today: Date; profile: Profile | null; goMyth: () => void; openCalendar: (date: Date, mode: 'current' | 'stage') => void;
  create: () => void; ranks: (date: Date) => void; onSave: (day: string) => void;
  questions: SavedQuestion[]; reflections: Reflection[]; openQuestion: (id: string) => void;
  openQuestions: () => void; openHomecoming: (year: number) => void;
  shareTideCard: () => void; openSelf: () => void; goSelf: () => void; openExplanation: () => void; startQuiz: () => void;
  selectedQuestion?: { question: Question; saved: boolean; toggle: () => void; compare: () => void };
}) {
  const [offset, setOffset] = useState(0);
  const [shareMessage, setShareMessage] = useState('');
  const [fold, setFold] = useState<FoldId | null>(null);
  const [showScore, setShowScore] = useState(false);
  const toggle = (id: FoldId) => setFold(current => current === id ? null : id);
  const date = addDays(today, offset);
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
    setOffset(value);
    setShareMessage('');
    setFold(null);
  }

  async function share() {
    if (!reading) return;
    const message = ['潮環占い｜' + dateLabel(c), labelOf(reading.row.t) + '　' + reading.row.rank + '位／160種 · ' + reading.outlook.title,
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
    <Chip onPress={() => selectDay(offset + 1)}>次の日 ›</Chip>
  </View>;

  const moonCard = <View style={S.stack}>
    <Text style={S.h3}>{c.moon}　·　{c.phaseTide}</Text>
    <SeaGlobe context={c} />
    <Text style={S.body}>月齢 {c.age.toFixed(1)}／地球から約 {Math.round(c.dist).toLocaleString('ja-JP')} km（{c.tide}）</Text>
    {(isNewMoon || isFullMoon) && <Text style={S.body}>{isNewMoon ? '新月：これから始めたいことを一つ選ぶ節目です。' : '満月：いま手元にあるものを確かめる節目です。'}</Text>}
  </View>;

  /* ---------- はじめての人：目的別の入口 ---------- */
  if (!reading || !profile) return <View style={S.stack}>
    <View style={styles.hero}>
      <Text style={S.kicker}>潮環占い</Text>
      <Text accessibilityRole="header" style={styles.welcome}>今日の自分の{'\n'}流れを読もう</Text>
      <Text style={S.body}>{dateLabel(c)}　{c.moon}</Text>
    </View>
    <Text style={S.h2}>どれからにする？</Text>
    <NextLinks items={[
      { label: '今日の運勢を見る', hint: '生年月日と名前だけ・約30秒', onPress: create },
      { label: '自分を見つめる 1分診断', hint: '名前も生年月日も要りません', onPress: startQuiz },
      { label: '今のモヤモヤから問いを読む', hint: '入力なしで読めます', onPress: openQuestions },
      { label: 'まず仕組みを知りたい', hint: '占いの考え方を図で説明', onPress: openExplanation },
    ]} />
    <Fold title="今日の海をのぞく" hint="日付と月だけでわかる、今日の海のようす" open={fold === 'moon'} onToggle={() => toggle('moon')}>
      <Text style={S.tiny}>{c.yearPillar}　／　{OUTER[c.outer].n}　／　{c.solarMonthTerm} {STAGES[c.stage].n}</Text>
      {moonCard}
    </Fold>
    <Text style={S.tiny}>入力した内容はこの端末の中だけで使います。</Text>
  </View>;

  /* ---------- 結論ファースト ---------- */
  const { outlook, row } = reading;
  const tierColor = tierColors[reading.layers.day];
  const events2 = events;
  return <View style={S.stack}>
    <View style={[styles.hero, { borderColor: tierColor }]}>
      <View style={S.between}>
        <Text style={S.kicker}>{dateLabel(c)}</Text>
        <Text style={S.tiny}>{resident?.band}</Text>
      </View>
      <View style={[S.row, { alignItems: 'flex-end' }]}>
        <Text accessibilityRole="header" style={[styles.tier, { color: tierColor }]}>{outlook.title}</Text>
        <Text style={[S.body, { paddingBottom: 8 }]}>{dayWord}は {row.rank}位 / 160</Text>
      </View>
      <Text style={S.h2}>{outlook.line}</Text>
      <View style={styles.action}>
        <Text style={S.kicker}>{dayWord}の一手</Text>
        <Text style={styles.actionText}>{outlook.action}</Text>
      </View>
      {isToday && <Button onPress={openSelf}>これをやるか、自分で決める　›</Button>}
      <Chips>
        <Chip onPress={() => onSave(dateKey(date))}>記録する</Chip>
        <Chip onPress={() => { void share(); }}>共有</Chip>
      </Chips>
      {!!shareMessage && <Text selectable accessibilityLiveRegion="polite" style={S.tiny}>{shareMessage}</Text>}
      {dayNavigation}
    </View>

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

    <Text style={S.h2}>次はどうする？</Text>
    <NextLinks items={[
      { label: '自分の判断を見つめる（自己純度）', hint: '8つの場面を直感で選ぶ・約1分', onPress: goSelf },
      { label: '今の気持ちに近い問いを読む', hint: '悩みから選べます', onPress: openQuestions },
      { label: 'この日の160名札の順位', hint: '全タイプの中での位置', onPress: () => ranks(date) },
      { label: '潮札を画像で共有', onPress: shareTideCard },
    ]} />
    <View style={S.row}>
      <Tile source={currents[c.outer]} subtitle="今年の海流" title={OUTER[c.outer].n} onPress={() => openCalendar(date, 'current')} />
      <Tile source={stages[c.stage]} subtitle="節気の海況" title={STAGES[c.stage].n} onPress={() => openCalendar(date, 'stage')} />
    </View>
    <View style={S.row}><Tile source={scenes[0]} subtitle="潮環神話" title="見られなかった海" onPress={goMyth} /></View>
  </View>;
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
  hero: { borderWidth: 1, borderColor: '#4c5271', borderRadius: 22, padding: 18, gap: 12, backgroundColor: '#141e37' },
  welcome: { color: C.ink, fontSize: 32, lineHeight: 44, fontWeight: '800' },
  tier: { fontSize: 54, lineHeight: 62, fontWeight: '800' },
  action: { gap: 4, padding: 14, borderRadius: 16, backgroundColor: '#0f1830', borderWidth: 1, borderColor: C.line },
  actionText: { color: C.ink, fontSize: 19, lineHeight: 28, fontWeight: '800' },
  factor: { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, gap: 3 },
});
