// 相性タブ。自分のタイプと相手のタイプを選ぶと、恋愛・結婚・仕事・友情の相性を読む。
// 相手は、保存した人からも、16タイプの一覧からも選べる。自分のタイプから見た16タイプ全員の順位も出る。
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { residentArt } from './art';
import { CompatRitual } from './CompatRitual';
import { DEPTH_NAMES, SEASON_NAMES, compat, depthOfResident, levelOf, rankAll, seasonOfResident } from './pairing';
import { makeProfile, residentIndex, type Profile } from './domain';
import type { Person } from './People';
import { labelOf, SEASON } from './scoring';
import { Button, C, Chip, Chips, Heading, S, Section, tapFx } from './ui';
import { Image } from './web/image';
import residents from './residents.json';

const seasonColor = (index: number) => SEASON[(index + 1) % 4].col;
const stars = (count: number) => '★'.repeat(count) + '☆'.repeat(5 - count);

/** 16タイプの選択盤。行が季節、列が深さ。 */
function TypeGrid({ value, own, onPick }: { value: number | null; own?: number | null; onPick: (index: number) => void }) {
  return <View style={styles.grid}>
    <View style={styles.gridHead}>
      <View style={styles.gridSide} />
      {DEPTH_NAMES.map(name => <Text key={name} style={styles.gridDepth}>{name}</Text>)}
    </View>
    {SEASON_NAMES.map((season, s) => <View key={season} style={styles.gridRow}>
      <Text style={[styles.gridSide, { color: seasonColor(s) }]}>{season}</Text>
      {[0, 1, 2, 3].map(d => {
        const index = s * 4 + d;
        const picked = value === index;
        return <Pressable key={index} {...tapFx} accessibilityRole="button" accessibilityLabel={residents[index].band} accessibilityState={{ selected: picked }}
          onPress={() => onPick(index)}
          style={({ pressed }) => [styles.cell, { borderColor: picked ? seasonColor(s) : C.line, backgroundColor: picked ? seasonColor(s) + '26' : C.panel }, pressed && { opacity: .7 }]}>
          <Image source={residentArt[index]} accessible={false} style={styles.cellImg} />
          {own === index && <Text style={styles.cellMark}>自分</Text>}
        </Pressable>;
      })}
    </View>)}
  </View>;
}

function Face({ index, caption }: { index: number; caption: string }) {
  return <View style={styles.face}>
    <View style={[styles.faceCircle, { borderColor: seasonColor(seasonOfResident(index)) }]}>
      <Image source={residentArt[index]} accessible={false} style={{ width: '100%', height: '100%' }} />
    </View>
    <Text style={styles.faceBand}>{residents[index].band}</Text>
    <Text style={S.tiny}>{caption}</Text>
  </View>;
}

function Bar({ value, color }: { value: number; color: string }) {
  return <View style={styles.barTrack}><View style={[styles.barFill, { width: value + '%', backgroundColor: color }]} /></View>;
}

function PairResult({ a, b }: { a: number; b: number }) {
  const result = compat(a, b);
  const { first, second } = result;
  return <View style={S.stack}>
    <View style={[S.card, S.pad, { alignItems: 'center', gap: 12 }]}>
      <View style={styles.faces}>
        <Face index={a} caption={first.subtitle} />
        <Text style={styles.times}>×</Text>
        <Face index={b} caption={second.subtitle} />
      </View>
      <Text style={S.kicker}>{result.season.relation}</Text>
      <Text accessibilityRole="header" style={[S.h2, { textAlign: 'center' }]}>{result.season.title}</Text>
      <Text style={[styles.total, { color: C.gold }]}>{result.total}<Text style={styles.totalUnit}> / 100</Text></Text>
      <Text style={[S.h3, { color: C.gold }]}>{stars(result.level.stars)}　{result.level.name}</Text>
      <Text style={S.body}>{result.season.essence}</Text>
      {result.sameType && <Text style={S.tiny}>同じタイプ同士です。似ているところと、似すぎて重なるところの両方が出ます。</Text>}
    </View>

    <View style={[S.card, S.pad]}>
      <Text style={S.kicker}>深さの組み合わせ　{DEPTH_NAMES[depthOfResident(a)]} × {DEPTH_NAMES[depthOfResident(b)]}</Text>
      <Text style={S.h3}>{result.depth.title}</Text>
      <Text style={S.body}>{result.depth.text}</Text>
    </View>

    {result.areas.map(area => <View key={area.id} style={[S.card, S.pad, { borderColor: area.color + '66' }]}>
      <View style={S.between}>
        <Text style={[S.kicker, { color: area.color }]}>{area.glyph}　{area.label}の相性</Text>
        <Text style={[S.tiny, { color: area.color }]}>{area.score}　{area.level.name}</Text>
      </View>
      <Bar value={area.score} color={area.color} />
      <Text style={S.body}>{area.text}</Text>
    </View>)}

    <View style={[S.card, S.pad]}>
      <Text style={S.kicker}>二人の読み</Text>
      <Text style={S.body}>{first.band}（{first.subtitle}）は、「{first.summary}」人。{second.band}（{second.subtitle}）は、「{second.summary}」人です。</Text>
      <Text style={S.h3}>気をつけたいこと</Text>
      <Text style={S.body}>二人の影が重なると、{first.shadow.replace(/。$/, '')}ことと、{second.shadow.replace(/。$/, '')}ことが同時に起こります。どちらかが気づいたら、責めずに「いま、これが出てるかも」と言葉にしてみてください。</Text>
      <Text style={S.h3}>二人で話してみたい問い</Text>
      <Text style={S.body}>・{first.question}</Text>
      <Text style={S.body}>・{second.question}</Text>
      <Text style={S.h3}>二人の一手</Text>
      <Text style={S.body}>{result.season.tip}</Text>
    </View>
    <Text style={S.tiny}>相性の良し悪しを決めるものではなく、会話のきっかけです。点数が低くても、違いを知っていれば関係は育てられます。</Text>
  </View>;
}

/** 相性は、占いをしたあとにだけ開く。「あなた」は、占いの結果のタイプに自動で対応する。選ぶのは相手だけ。 */
export function Compat({ profile, people, create }: { profile: Profile | null; people: Person[]; create: () => void }) {
  const [other, setOther] = useState<number | null>(null);
  const [ritual, setRitual] = useState<{ a: number; b: number } | null>(null);   // 儀式の最中の二人
  const [read, setRead] = useState<{ a: number; b: number } | null>(null);       // 儀式を終えて、結果を出している二人
  const self = profile ? residentIndex(profile.t) : null;
  const own = self;
  const shown = self !== null && other !== null && read?.a === self && read.b === other;
  const begin = (a: number, b: number) => { setOther(b); setRead(null); setRitual({ a, b }); };
  const finishRitual = () => {
    if (ritual) setRead(ritual);
    setRitual(null);
    // 結果の見出しまで、ゆっくり降りていく。
    setTimeout(() => document.getElementById('pair-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  const ranking = self === null ? [] : rankAll(self);
  const friends = people.filter(person => person.inputs.name !== profile?.name).map(person => ({ person, index: residentIndex(makeProfile(person.inputs).t) }));

  // 占いをする前は、相性は開けない。
  if (self === null) return <View style={S.stack}>
    <Heading tag="COMPATIBILITY" title="二人の相性" body="相性は、あなたの海を占ってからひらけます。占いの結果のタイプが、そのまま「あなた」になります。" />
    <View style={[S.card, S.pad, { alignItems: 'center', gap: 12 }]}>
      <Text style={styles.lockMark}>✦</Text>
      <Text style={S.h3}>まず、あなたの海を占いましょう</Text>
      <Text style={[S.body, { textAlign: 'center' }]}>生年月日と下の名前から、あなたのタイプが決まります。占いのあとに、ここで相手のタイプを選ぶと、二人の相性を読めます。</Text>
      <Button onPress={create}>占ってみる　›</Button>
    </View>
  </View>;

  return <View style={S.stack}>
    <Heading tag="COMPATIBILITY" title="二人の相性" body="あなたのタイプは、占いの結果のままです。相手のタイプを選ぶと、恋愛・結婚・仕事・友情の相性を読みます。16タイプ×16タイプ、136通りすべてに固有の読みがあります。" />

    <View style={[S.card, S.pad, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
      <View style={[styles.faceCircle, { borderColor: seasonColor(seasonOfResident(self)) }]}><Image source={residentArt[self]} accessible={false} style={{ width: '100%', height: '100%' }} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={S.kicker}>あなたのタイプ　{labelOf(profile!.t)}</Text>
        <Text style={S.h3}>{residents[self].band}</Text>
        <Text style={S.tiny}>{residents[self].subtitle}</Text>
      </View>
    </View>

    <Section title="相手のタイプ" note="保存した人か、16タイプの中から選べます。" />
    {!!friends.length && <Chips>
      {friends.map(({ person, index }) => <Chip key={person.id} active={other === index} onPress={() => setOther(index)}>{'🙂 ' + person.inputs.name}</Chip>)}
    </Chips>}
    <TypeGrid value={other} own={own} onPick={setOther} />

    {other !== null && !shown && <Button onPress={() => begin(self, other)}>この二人の相性を読む　✦</Button>}
    {other === null && <Text style={S.tiny}>相手のタイプを選ぶと、読みをひらけます。</Text>}
    {shown && <View nativeID="pair-result"><PairResult a={self} b={other} /></View>}
    {ritual && <CompatRitual a={ritual.a} b={ritual.b} onDone={finishRitual} />}

    {shown && <View style={S.stack}>
      <Section title={residents[self].band + 'から見た、全タイプとの相性'} note="総合点の高い順。タップすると、その相手との読みが開きます。" />
      <View style={[S.card, { padding: 6 }]}>
        {ranking.map(({ index, total }, rank) => <Pressable key={index} {...tapFx} accessibilityRole="button" onPress={() => begin(self, index)}
          style={({ pressed }) => [styles.rankRow, other === index && { backgroundColor: seasonColor(seasonOfResident(index)) + '1f' }, pressed && { opacity: .7 }]}>
          <Text style={styles.rankNo}>{rank + 1}</Text>
          <View style={[styles.rankImg, { borderColor: seasonColor(seasonOfResident(index)) }]}><Image source={residentArt[index]} accessible={false} style={{ width: '100%', height: '100%' }} /></View>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Text style={styles.rankBand} numberOfLines={1}>{residents[index].band}</Text>
            <Bar value={total} color={seasonColor(seasonOfResident(index))} />
          </View>
          <View style={{ alignItems: 'flex-end', minWidth: 64 }}>
            <Text style={styles.rankScore}>{total}</Text>
            <Text style={S.tiny}>{levelOf(total).name}</Text>
          </View>
        </Pressable>)}
      </View>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  grid: { gap: 6 },
  gridHead: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  gridRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  gridSide: { width: 26, textAlign: 'center', fontSize: 15, fontWeight: '900', color: C.muted },
  gridDepth: { flex: 1, textAlign: 'center', color: C.muted, fontSize: 12, fontWeight: '700' },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', padding: 3 },
  cellImg: { width: '100%', height: '100%' } as never,
  cellMark: { position: 'absolute', right: 2, bottom: 1, fontSize: 10, fontWeight: '900', color: C.gold },
  faces: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  face: { alignItems: 'center', gap: 4, flex: 1, minWidth: 0 },
  faceCircle: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, overflow: 'hidden', backgroundColor: '#e9eef9' },
  faceBand: { color: C.ink, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  times: { color: C.gold, fontSize: 26, fontWeight: '900' },
  total: { fontSize: 52, lineHeight: 60, fontWeight: '900' },
  totalUnit: { fontSize: 16, color: C.muted, fontWeight: '700' },
  lockMark: { color: C.gold, fontSize: 34, lineHeight: 40 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.08)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 14 },
  rankNo: { width: 20, textAlign: 'center', color: C.muted, fontSize: 14, fontWeight: '800' },
  rankImg: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, overflow: 'hidden', backgroundColor: '#e9eef9' },
  rankBand: { color: C.ink, fontSize: 15, fontWeight: '800' },
  rankScore: { color: C.ink, fontSize: 20, fontWeight: '900' },
});
