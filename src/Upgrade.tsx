// 有料版のご案内・購入・管理の画面。
// 申込みの前に、金額・自動更新・解約の方法・返金の方針を、はっきり見せる（特定商取引法の「最終確認」の表示）。
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { forgetThisDevice, openPortal, restore, startCheckout, useAccount } from './entitlement';
import { usePlan } from './plan';
import { Button, C, Card, Chip, Chips, Heading, S } from './ui';

const INCLUDED = [
  ['今日の占い', '分野別の運勢の文、今日の内訳、年・月・日の読み、ラッキーの方角・時間・もの・数字、明日の潮'],
  ['二人の相性', '恋愛・結婚・仕事・友情の相性の文、二人の読み、今日・今月・今年の相性の読みと内訳'],
  ['人生の流れ', '次の追い風、これから1年で気をつけたい月・いちばんの月、来年以降の年と、今年の先の月の読み'],
];

const dateOf = (seconds: number) => new Date(seconds * 1000).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

const links = [['利用規約', './terms/'], ['プライバシーポリシー', './privacy/'], ['特定商取引法に基づく表記', './tokushoho/'], ['返金の方針', './refund/']] as const;

export function Upgrade() {
  const account = useAccount();
  const plan = usePlan();
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const yen = account.monthlyYen.toLocaleString('ja-JP');
  const paid = plan === 'paid' && account.billing && !!account.token;

  return <View style={S.stack}>
    <Heading tag="PREMIUM" title="有料版" body="占いの、さらに詳しい読みを、ひらきます。基本の占い・タロット・問いの海・住人図鑑は、これまでどおり、登録なしで読めます。" />
    {!!account.notice && <Card><Text accessibilityLiveRegion="polite" style={[S.body, { color: C.gold }]}>{account.notice}</Text></Card>}
    {!!account.error && <Card><Text accessibilityRole="alert" style={[S.body, { color: C.error }]}>{account.error}</Text></Card>}

    {!account.billing && <Card>
      <Text style={S.h3}>有料版は、準備中です</Text>
      <Text style={S.body}>いまは、すべての読みを、無料でご利用いただけます。有料版を始めるときは、このページと、サイトの案内でお知らせします。</Text>
    </Card>}

    {account.billing && <Card>
      <Text style={S.kicker}>含まれるもの</Text>
      {INCLUDED.map(([title, text]) => <View key={title} style={styles.row}>
        <Text style={S.h3}>{title}</Text>
        <Text style={S.tiny}>{text}</Text>
      </View>)}
    </Card>}

    {account.billing && paid && <Card>
      <Text style={S.h3}>有料版をご利用中です</Text>
      <Text style={S.body}>
        {account.periodEnd
          ? (account.cancelAtPeriodEnd ? `解約のお手続き済みです。${dateOf(account.periodEnd)}まで、ご利用いただけます。` : `次の更新日は、${dateOf(account.periodEnd)}です。`)
          : '次の更新日は、管理ページで確認できます。'}
      </Text>
      <Button onPress={() => { void openPortal(); }} disabled={account.busy}>管理・解約のページをひらく</Button>
      <Text style={S.tiny}>解約・カードの変更・領収書の確認は、管理ページ（Stripe）でできます。</Text>
      <Chips><Chip active={showCode} onPress={() => setShowCode(value => !value)}>別の端末で使うための、復元コード</Chip></Chips>
      {showCode && <>
        <Text style={S.tiny}>別の端末で、「購入を復元する」に、このコードを貼ると、同じ有料版を使えます。他の人には、教えないでください。</Text>
        <Text selectable style={styles.code}>{account.token}</Text>
      </>}
      <Button quiet onPress={forgetThisDevice}>この端末の有料版の設定を消す</Button>
    </Card>}

    {account.billing && !paid && <Card>
      <Text style={S.kicker}>お申込みの内容（最終確認）</Text>
      <Text style={styles.price}>月額 {yen}円<Text style={styles.priceNote}>（税込）</Text></Text>
      <View style={styles.rules}>
        <Text style={S.body}>・1か月ごとの契約です。解約しない限り、毎月、自動で更新・請求されます。</Text>
        <Text style={S.body}>・初回は、お申込み時に、お支払いいただきます。以後は、お申込みの日と同じ日に、請求します。</Text>
        <Text style={S.body}>・解約は、お申込み後の管理ページから、いつでもできます。次回の更新日の前日までに解約すれば、次回以降の料金はかかりません。</Text>
        <Text style={S.body}>・サービスの提供を始めたあとの返金は、できません（二重請求などの例外は、返金の方針をご覧ください）。</Text>
        <Text style={S.body}>・お支払いは、Stripeの画面で行います。カード情報は、当方には、保存されません。</Text>
      </View>
      <Chips>{links.map(([label, href]) => <Chip key={href} onPress={() => { window.location.href = href; }}>{label}</Chip>)}</Chips>
      <Chips><Chip active={agreed} onPress={() => setAgreed(value => !value)}>{(agreed ? '✓ ' : '') + '上の内容と、利用規約・返金の方針に同意します'}</Chip></Chips>
      <Button onPress={() => { void startCheckout(); }} disabled={!agreed || account.busy}>{account.busy ? '少しお待ちください…' : `同意して、月額${yen}円で申し込む`}</Button>
      {!agreed && <Text style={S.tiny}>同意にチェックを入れると、お申込みに進めます。</Text>}
    </Card>}

    {account.billing && !paid && <Card>
      <Text style={S.kicker}>すでに有料版の方</Text>
      <Text style={S.tiny}>別の端末で購入した方は、その端末の「復元コード」を、ここに貼ってください。</Text>
      <TextInput accessibilityLabel="復元コード" placeholder="復元コード" placeholderTextColor="#66728f" value={code} onChangeText={setCode}
        autoCorrect={false} autoCapitalize="none" style={S.field} />
      <Button quiet onPress={() => { void restore(code); }} disabled={!code.trim() || account.busy}>購入を復元する</Button>
    </Card>}
  </View>;
}

const styles = StyleSheet.create({
  row: { gap: 2, paddingVertical: 6 },
  price: { color: C.gold, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  priceNote: { color: C.muted, fontSize: 15, fontWeight: '700' },
  rules: { gap: 6 },
  code: { color: C.ink, fontSize: 12, lineHeight: 18, padding: 10, borderRadius: 10, backgroundColor: '#0f1830', borderWidth: 1, borderColor: C.line },
});
