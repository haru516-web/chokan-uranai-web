import { useEffect, useState } from 'react';
import AsyncStorage from './web/storage';
import * as Haptics from './web/haptics';
import { Image } from './web/image';
import { StatusBar } from './web/status-bar';
import { AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from './web/safe-area';
import { harbor, seal } from './art';
import { blankInputs, dateKey, jstToday, makeProfile, validate, type Inputs } from './domain';
import { QuestionTrail, ReflectionEditor } from './LifeChart';
import { LifeWave } from './LifeWave';
import { ProfileForm } from './ProfileForm';
import { PairReading } from './PairReading';
import { QuestionAnswer, QuestionSea } from './Questions';
import { ShareTideCard } from './ResidentCard';
import { Today } from './Today';
import { Atlas, Calendar, Chapter, Journal, Myth, NoteEditor, Ranking, Resident, type Note } from './screens';
import { C, S } from './ui';
import { findQuestion, type Reflection, type SavedQuestion } from './voyage';
import { mainTabs, TabBar, type MainTab } from './PetNavigation';

const detailTitles: Record<string, string> = {
  explanation: '仕組みの解説', selfQuiz: '診断', selfResult: '診断の結果', selfWish: '意志を潮に乗せる', profile: '自分の海をひらく',
  question: '問いを読む', compare: 'あの頃の海と比べる', homecoming: '帰郷の年', reflection: '振り返りを書く', trail: '問いの記録',
  share: '潮札を共有', calendar: '運勢の流れ', myth: '潮環神話', pair: '相性を見る', resident: '住人の紹介', chapter: '神話を読む',
  note: '航海帳に記す', journal: '記録・設定', rank: '160名札の順位', people: '人の管理・リセット',
};
import { Explanation } from './Explanation';
import { GlossProvider } from './Glossary';
import { Ritual } from './Ritual';
import { PeopleManager, PersonSwitcher, type Person } from './People';
import { SelfHome, SelfQuiz, SelfResultView, SelfWish } from './SelfPurity';
import { emptySelf, quadOf, quads, score, type Move, type SelfState } from './self';
type Detail =
  | { kind: 'explanation' }
  | { kind: 'selfQuiz' }
  | { kind: 'selfResult'; id: number }
  | { kind: 'selfWish' }
  | { kind: 'profile'; questionId?: string; add?: boolean }
  | { kind: 'people' }
  | { kind: 'journal' }
  | { kind: 'question'; id: string; personal?: boolean }
  | { kind: 'compare'; id: string }
  | { kind: 'homecoming'; year: number }
  | { kind: 'reflection'; year: number; month: number; questionId?: string; id?: number }
  | { kind: 'trail'; id: string }
  | { kind: 'share' }
  | { kind: 'calendar'; date?: Date; mode?: 'current' | 'stage' }
  | { kind: 'myth' }
  | { kind: 'pair' }
  | { kind: 'resident'; index: number }
  | { kind: 'chapter'; index: number }
  | { kind: 'note'; day: string }
  | { kind: 'rank'; date: Date };

type Saved = { inputs: Inputs | null; people: Person[]; notes: Note[]; favorites: number[]; read: number[]; questions: SavedQuestion[]; reflections: Reflection[]; self: SelfState };
const empty: Saved = { inputs: null, people: [], notes: [], favorites: [], read: [], questions: [], reflections: [], self: emptySelf };
const storageKey = 'chokan/v1';
let pendingSave: Promise<void> = Promise.resolve();

export default function App() {
  return <SafeAreaProvider><GlossProvider><Voyage /></GlossProvider></SafeAreaProvider>;
}

function Voyage() {
  const wide = useWindowDimensions().width >= 720;
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [stored, setStored] = useState<Saved>(empty);
  const [people, setPeople] = useState<Person[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [today, setToday] = useState(jstToday);
  const [tab, setTab] = useState<MainTab>('today');
  const [path, setPath] = useState<Detail[]>([]);
  const [todayVisit, setTodayVisit] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>();
  const [ritual, setRitual] = useState(false);
  const detail = path[path.length - 1];
  const active = people.find(person => person.id === activeId) ?? null;
  const inputs = active?.inputs ?? null;
  const profile = inputs ? makeProfile(inputs) : null;
  const me = people.find(person => person.me) ?? people[0];
  const meProfile = me ? makeProfile(me.inputs) : null;
  const selectedQuestion = findQuestion(selectedQuestionId);
  const day = dateKey(today);
  const accent = mainTabs.find(item => item.id === tab)?.accent ?? '#eacc8c';

  useEffect(() => {
    const page = detail ? detailTitles[detail.kind] : mainTabs.find(item => item.id === tab)?.title;
    if (Platform.OS === 'web') document.title = page ? page + '｜潮環占い' : '潮環占い';
  }, [detail, tab]);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey).then(raw => {
      if (!mounted || !raw) return;
      const parsed = JSON.parse(raw);
      const data: Saved = { ...empty, ...parsed, self: { ...emptySelf, ...parsed.self } };
      let list: Person[] = Array.isArray(parsed.people) ? parsed.people.filter((person: Person) => person?.inputs && !validate(person.inputs)) : [];
      if (!list.length && parsed.inputs && !validate(parsed.inputs)) list = [{ id: 1, inputs: parsed.inputs, me: true, saved: true }];
      data.inputs = null;
      data.people = list;
      setStored(data);
      setPeople(list);
      setActiveId((list.find(person => person.me) ?? list[0])?.id ?? null);
      if (list.length) setTab('today');
    }).catch(() => { if (mounted) setStorageError(true); })
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ready || stored === empty) return;
    pendingSave = pendingSave.catch(() => {}).then(() => AsyncStorage.setItem(storageKey, JSON.stringify(stored)));
    pendingSave.then(() => setStorageError(false), () => setStorageError(true));
  }, [stored, ready]);

  useEffect(() => {
    const refresh = () => setToday(previous => {
      const next = jstToday();
      return next.getTime() === previous.getTime() ? previous : next;
    });
    const timer = setInterval(refresh, 30_000);
    const subscription = AppState.addEventListener('change', refresh);
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);

  function go(next: MainTab) {
    setPath([]);
    setTab(next);
    setTodayVisit(previous => previous + 1);
    if (Platform.OS === 'ios') void Haptics.selectionAsync().catch(() => {});
  }
  const open = (next: Detail) => setPath(previous => [...previous, next]);
  const back = () => setPath(previous => previous.slice(0, -1));
  const openResident = (index: number) => open({ kind: 'resident', index });
  const openChapter = (index: number) => open({ kind: 'chapter', index });
  const openNote = (day: string) => open({ kind: 'note', day });
  const editProfile = () => open({ kind: 'profile' });
  const openRanking = (date: Date) => open({ kind: 'rank', date });
  const openQuestion = (id: string, personal = false) => open({ kind: 'question', id, personal });
  const openCalendar = (date?: Date, mode?: 'current' | 'stage') => open({ kind: 'calendar', date, mode });
  const openMyth = () => open({ kind: 'myth' });
  const openTrail = (id: string) => open({ kind: 'trail', id });
  const compare = (id: string) => open({ kind: 'compare', id });
  const writeReflection = (year: number, month: number, questionId?: string) => open({ kind: 'reflection', year, month, questionId });
  const editReflection = (record: Reflection) => open({ kind: 'reflection', year: record.year, month: record.month, id: record.id });

  const self = stored.self;
  const updateSelf = (change: (value: SelfState) => SelfState) => setStored(previous => ({ ...previous, self: change(previous.self) }));
  const startQuiz = () => open({ kind: 'selfQuiz' });
  const openWish = () => open({ kind: 'selfWish' });

  function finishQuiz(answers: number[]) {
    const { p, s } = score(answers);
    const id = Date.now();
    updateSelf(value => ({ ...value, results: [{ id, day, p, s, answers }, ...value.results].slice(0, 60) }));
    setPath(previous => [...previous.slice(0, -1), { kind: 'selfResult', id }]);
    if (Platform.OS === 'ios') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  function saveMove(move: Omit<Move, 'id'>, wish: string) {
    updateSelf(value => ({ ...value, wish, moves: [{ ...move, id: Date.now() }, ...value.moves].slice(0, 60) }));
  }

  function removeQuestion(id: string, day: string) {
    setStored(previous => ({ ...previous, questions: previous.questions.filter(entry => entry.id !== id || entry.day !== day) }));
  }

  function toggleQuestion(id: string) {
    setStored(previous => ({
      ...previous,
      questions: previous.questions.some(entry => entry.id === id && entry.day === day)
        ? previous.questions.filter(entry => entry.id !== id || entry.day !== day)
        : [{ id, day }, ...previous.questions],
    }));
  }

  function commitPeople(next: Person[], nextActive: number | null) {
    setPeople(next);
    setActiveId(nextActive);
    setStored(previous => ({ ...previous, inputs: null, people: next.filter(person => person.saved) }));
  }

  function removePerson(id: number) {
    const next = people.filter(person => person.id !== id);
    commitPeople(next, id === activeId ? ((next.find(person => person.me) ?? next[0])?.id ?? null) : activeId);
  }

  function resetAll() {
    setPeople([]);
    setActiveId(null);
    setSelectedQuestionId(undefined);
    setStored({ ...empty });
    setPath([]);
    setTab('today');
    setTodayVisit(previous => previous + 1);
  }

  function saveProfile(next: Inputs, remember: boolean, questionId?: string, add?: boolean) {
    if (add || !active) {
      const person: Person = { id: Date.now(), inputs: next, me: people.length === 0, saved: remember };
      commitPeople([...people, person], person.id);
    } else {
      commitPeople(people.map(entry => entry.id === active.id ? { ...entry, inputs: next, saved: remember } : entry), active.id);
    }
    setSelectedQuestionId(questionId);
    setRitual(true);
    setTodayVisit(previous => previous + 1);
    setPath([]);
    setTab('today');
    if (Platform.OS === 'ios') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  const body = {
    today: <Today people={people} activeId={activeId} onSwitch={id => { setActiveId(id); setTodayVisit(previous => previous + 1); }}
      onAdd={() => open({ kind: 'profile', add: true })} onManage={() => open({ kind: 'people' })} openJournal={() => open({ kind: 'journal' })} today={today} profile={profile} goMyth={openMyth} openCalendar={openCalendar} create={editProfile}
      ranks={openRanking} onSave={openNote} questions={stored.questions} reflections={stored.reflections}
      openQuestion={id => openQuestion(id, true)} openQuestions={() => go('questions')}
      shareTideCard={() => open({ kind: 'share' })} goSelf={() => go('self')}
      openExplanation={() => open({ kind: 'explanation' })} startQuiz={startQuiz}
      selfLast={self.results[0] ? { name: quads[quadOf(self.results[0].p, self.results[0].s)].name, mark: quads[quadOf(self.results[0].p, self.results[0].s)].mark, color: quads[quadOf(self.results[0].p, self.results[0].s)].color } : null}
      selectedQuestion={selectedQuestion ? {
        question: selectedQuestion,
        saved: stored.questions.some(entry => entry.id === selectedQuestion.id && entry.day === day),
        toggle: () => toggleQuestion(selectedQuestion.id),
        compare: () => compare(selectedQuestion.id),
      } : undefined}
      openHomecoming={year => open({ kind: 'homecoming', year })} />,
    self: <SelfHome state={self} profile={meProfile} today={day} start={startQuiz} openWish={openWish}
      openResult={id => open({ kind: 'selfResult', id })} goToday={() => go('today')}
      saveCheck={reason => updateSelf(value => ({ ...value, checks: [{ day, reason }, ...value.checks.filter(check => check.day !== day)].slice(0, 60) }))}
      saveAfter={(id, after) => updateSelf(value => ({ ...value, moves: value.moves.map(move => move.id === id ? { ...move, after } : move) }))} />,
    questions: <QuestionSea open={openQuestion} create={profile ? undefined : editProfile} />,
    chart: <LifeWave today={today} profile={profile} create={editProfile} calendar={() => openCalendar()} openJournal={() => open({ kind: 'journal' })}
      write={writeReflection} showToday={() => go('today')} records={stored.reflections} edit={editReflection} />,
    atlas: <Atlas create={editProfile} profile={profile} favorites={stored.favorites} open={openResident} myth={openMyth} pair={() => open({ kind: 'pair' })} />,
  }[tab];

  function detailBody(detail: Detail) {
    switch (detail.kind) {
      case 'explanation':
        return <Explanation today={today} profile={profile} />;
      case 'selfQuiz':
        return <SelfQuiz done={finishQuiz} />;
      case 'selfResult': {
        const index = self.results.findIndex(entry => entry.id === detail.id);
        const result = self.results[index];
        return result && <SelfResultView result={result} previous={self.results[index + 1]} profile={meProfile}
          again={() => setPath(previous => [...previous.slice(0, -1), { kind: 'selfQuiz' }])} openWish={openWish} openHome={() => go('self')} />;
      }
      case 'selfWish':
        return <SelfWish profile={meProfile} today={today} wish={self.wish} saveMove={saveMove} createProfile={editProfile} finish={() => go('self')} />;
      case 'profile':
        return <ProfileForm title={detail.add ? '友人・気になる人を占う' : 'あなたの海を、ひらきます。'} initial={detail.add ? blankInputs : inputs ?? blankInputs}
          persist={detail.add ? false : active ? active.saved : true} submitLabel={detail.add ? 'この人を占う' : undefined}
          onSubmit={(next, remember) => saveProfile(next, remember, detail.questionId, detail.add)} />;
      case 'journal':
        return <Journal profile={profile} notes={stored.notes} edit={editProfile} pair={() => open({ kind: 'pair' })} showToday={() => go('today')}
          questions={stored.questions} reflections={stored.reflections} openTrail={openTrail} editReflection={editReflection} openChart={() => go('chart')}
          create={() => openNote(dateKey(today))} openNote={openNote} goSelf={() => go('self')} selfCount={self.results.length}
          onForget={() => open({ kind: 'people' })} />;
      case 'people':
        return <PeopleManager people={people} activeId={activeId} select={id => { setActiveId(id); go('today'); }} remove={removePerson}
          add={() => open({ kind: 'profile', add: true })} resetAll={resetAll} />;
      case 'question': {
        const question = findQuestion(detail.id);
        return question && <QuestionAnswer question={question} profile={profile} today={today} personal={!!detail.personal && !!profile}
          saved={stored.questions.some(entry => entry.id === question.id && entry.day === day)} toggle={() => toggleQuestion(question.id)}
          readOwn={() => profile ? openQuestion(question.id, true) : open({ kind: 'profile', questionId: question.id })}
          browse={() => go('questions')} history={() => compare(question.id)} showToday={() => go('today')} />;
      }
      case 'compare':
        return <LifeWave today={today} profile={profile} questionId={detail.id} create={() => open({ kind: 'profile', questionId: detail.id })}
          write={writeReflection} showToday={() => go('today')} records={stored.reflections} edit={editReflection} />;
      case 'homecoming':
        return <LifeWave today={today} profile={profile} initialYear={detail.year} create={editProfile}
          write={writeReflection} showToday={() => go('today')} records={stored.reflections} edit={editReflection} />;
      case 'reflection': {
        const existing = stored.reflections.find(record => record.id === detail.id);
        return <ReflectionEditor initial={detail} existing={existing} save={value => {
          setStored(previous => ({
            ...previous,
            reflections: existing
              ? previous.reflections.map(record => record.id === existing.id ? { ...value, id: existing.id } : record)
              : [{ ...value, id: Math.max(Date.now(), (previous.reflections[0]?.id ?? 0) + 1) }, ...previous.reflections],
          }));
          if (existing) back(); else setPath([{ kind: 'journal' }]);
        }} remove={existing ? () => {
          setStored(previous => ({ ...previous, reflections: previous.reflections.filter(record => record.id !== existing.id) }));
          back();
        } : undefined} />;
      }
      case 'trail':
        return <QuestionTrail id={detail.id} saved={stored.questions} records={stored.reflections} edit={editReflection}
          reopen={() => openQuestion(detail.id)} compare={() => compare(detail.id)} remove={day => removeQuestion(detail.id, day)} />;
      case 'share':
        return profile && <ShareTideCard profile={profile} />;
      case 'calendar':
        return <Calendar today={today} profile={profile} initial={detail.date ? { date: detail.date, mode: detail.mode ?? 'current' } : undefined} />;
      case 'myth':
        return <Myth open={openChapter} read={stored.read} />;
      case 'resident': {
        const { index } = detail;
        return <Resident index={index} profile={profile} favorite={stored.favorites.includes(index)}
          toggle={() => setStored(previous => ({
            ...previous,
            favorites: previous.favorites.includes(index) ? previous.favorites.filter(id => id !== index) : [...previous.favorites, index],
          }))} />;
      }
      case 'chapter': {
        const { index } = detail;
        return <Chapter index={index} read={stored.read.includes(index)} open={openChapter}
          done={() => setStored(previous => previous.read.includes(index) ? previous : { ...previous, read: [...previous.read, index] })} />;
      }
      case 'note': {
        const { day } = detail;
        return <NoteEditor day={day} existing={stored.notes.find(note => note.day === day)?.text}
          save={text => {
            setStored(previous => {
              const notes = previous.notes.filter(note => note.day !== day);
              if (text) notes.push({ day, text });
              return { ...previous, notes: notes.sort((a, b) => b.day.localeCompare(a.day)) };
            });
            setPath([{ kind: 'journal' }]);
          }} />;
      }
      case 'pair':
        return <PairReading profile={profile} />;
      case 'rank':
        return <Ranking date={detail.date} profile={profile} />;
    }
  }
  return <SafeAreaView style={layout.root} edges={['top', 'bottom', 'left', 'right']}>
    <StatusBar style="light" />
    {Platform.OS === 'web' && <Image source={harbor} style={[StyleSheet.absoluteFill, { opacity: 0.18 }]} contentFit="cover" />}
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={layout.frame}>
      <div className="ambient" aria-hidden="true" style={{ '--accent': accent } as React.CSSProperties}>
        <b /><b /><b />
        {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: (i * 29 + 5) % 100 + '%', fontSize: 8 + (i % 4) * 3, animationDuration: 14 + (i % 5) * 4 + 's', animationDelay: -(i * 2.3) + 's' }}>✦</i>)}
      </div>
      <View pointerEvents="none" style={[layout.wash, { backgroundImage: `linear-gradient(180deg, ${mainTabs.find(item => item.id === tab)?.accent ?? '#eacc8c'}30 0%, transparent 100%)` } as object]} />
      <View style={layout.header}>
        {detail
          ? <Pressable accessibilityRole="button" accessibilityLabel="前の画面に戻る" onPress={back} style={layout.backBtn}>
            <Text style={layout.backMark}>‹</Text>
          </Pressable>
          : <View {...({ dataSet: { ui: 'seal' } } as object)} style={{ borderRadius: 10 }}><Image source={seal} style={{ width: 38, height: 38, borderRadius: 10 }} /></View>}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text accessibilityRole="header" numberOfLines={1} style={layout.pageTitle}>
            {detail ? detailTitles[detail.kind] : mainTabs.find(item => item.id === tab)?.title}
          </Text>
          <Text numberOfLines={1} style={S.tiny}>
            {detail ? (mainTabs.find(item => item.id === tab)?.title ?? '') + ' › ' + detailTitles[detail.kind] : '潮環占い'}
          </Text>
        </View>
        {detail?.kind !== 'explanation' && <Pressable accessibilityRole="button" accessibilityLabel="仕組みの解説を開く" onPress={() => open({ kind: 'explanation' })}
          style={layout.help}>
          <Text style={{ color: C.aqua, fontWeight: '800' }}>? 解説</Text>
        </Pressable>}
      </View>
      <TabBar wide={wide} seasonIndex={profile?.t.mod ?? null} activeTab={tab} onSelect={go} />
      {storageError && <Text accessibilityRole="alert" style={[S.tiny, layout.error]}>端末の保存領域にアクセスできませんでした。この画面で続けられます。</Text>}
      {ready ? <>
        <ScrollView key={`${tab}-${todayVisit}`} {...({ dataSet: { screen: tab } } as object)} style={[layout.scroll, detail && layout.hidden]} contentContainerStyle={layout.content}
          keyboardShouldPersistTaps="handled">
          {ritual && profile ? null : body}
        </ScrollView>
        {path.map((entry, index) => <ScrollView key={entry.kind + index} {...({ dataSet: { screen: entry.kind } } as object)}
          style={[layout.scroll, index !== path.length - 1 && layout.hidden]} contentContainerStyle={entry.kind === 'explanation' ? { backgroundColor: '#f5f7fb', paddingBottom: 50 } : layout.content}
          keyboardShouldPersistTaps="handled">
          {detailBody(entry)}
        </ScrollView>)}
      </> : <View style={[layout.scroll, layout.content]}><Text style={S.body}>海図をひらいています…</Text></View>}
    </KeyboardAvoidingView>
    {ritual && profile && <Ritual profile={profile} today={today} onDone={() => setRitual(false)} />}
  </SafeAreaView>;
}

const layout = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.base, alignItems: 'center' },
  frame: { flex: 1, width: '100%', maxWidth: 780, backgroundColor: C.base, alignSelf: 'center', overflow: 'hidden' },
  header: { minHeight: 62, paddingHorizontal: 14, gap: 12, flexDirection: 'row', alignItems: 'center', borderBottomColor: C.line, borderBottomWidth: StyleSheet.hairlineWidth },
  pageTitle: { color: C.ink, fontSize: 19, lineHeight: 26, fontWeight: '800' },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  backMark: { color: C.ink, fontSize: 28, lineHeight: 30, fontWeight: '700' },
  help: { paddingHorizontal: 12, minHeight: 40, justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#4c6aa8' },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scroll: { flex: 1 },
  hidden: { display: 'none' },
  content: { padding: 16, paddingBottom: 32 },
  error: { backgroundColor: '#4b2c29', padding: 8, color: C.error },
});


