// 設定の画面。ヘッダーの歯車から開く。契約（有料版）の管理・データ・使い方・規約への入口を、ひとつにまとめる。
import { StyleSheet, Text, View } from 'react-native';
import { openPortal, useAccount } from './entitlement';
import { usePlan } from './plan';
import { Button, C, Card, Chip, Chips, Heading, S } from './ui';

const dateOf = (seconds: number) => new Date(seconds * 1000).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
const links = [['利用規約', './terms/'], ['プライバシーポリシー', './privacy/'], ['特定商取引法に基づく表記', './tokushoho/'], ['返金の方針', './refund/']] as const;

export function Settings({ openUpgrade, openJournal, openPeople }: {
  openUpgrade: () => void; openJournal: () => void; openPeople: () => void;
}) {
  const account = useAccount();
  const plan = usePlan();
  const yen = account.monthlyYen.toLocaleString('ja-JP');
  const paid = plan === 'paid' && account.billing && !!account.token;

  return <View style={S.stack}>
    <Heading tag="SETTINGS" title="設定" />

    <Card>
      <Text style={S.kicker}>契約（有料版）</Text>
      {!account.billing && <>
        <Text style={S.h3}>有料版は、準備中です</Text>
        <Text style={S.body}>いまは、すべての読みを、無料でご利用いただけます。</Text>
      </>}
      {account.billing && paid && <>
        <Text style={S.h3}>有料版をご利用中です</Text>
        <Text style={S.body}>
          {account.periodEnd
            ? (account.cancelAtPeriodEnd ? `解約のお手続き済みです。${dateOf(account.periodEnd)}まで、ご利用いただけます。` : `月額${yen}円（税込）。次の更新日は、${dateOf(account.periodEnd)}です。`)
            : `月額${yen}円（税込）`}
        </Text>
        <Button onPress={() => { void openPortal(); }} disabled={account.busy}>{account.busy ? '少しお待ちください…' : '契約の管理・解約'}</Button>
        <Text style={S.tiny}>解約・カードの変更・領収書の確認は、Stripeの管理ページでできます。</Text>
        <Button quiet onPress={openUpgrade}>有料版の内容・復元コード</Button>
      </>}
      {account.billing && !paid && <>
        <Text style={S.h3}>無料版をご利用中です</Text>
        <Text style={S.body}>有料版にすると、各タブの、さらに詳しい読みをひらけます。</Text>
        <Button onPress={openUpgrade}>{`有料版を見る（月額${yen}円）`}</Button>
      </>}
      {!!account.error && <Text accessibilityRole="alert" style={[S.tiny, { color: C.error }]}>{account.error}</Text>}
    </Card>

    <Card>
      <Text style={S.kicker}>データ</Text>
      <Text style={S.tiny}>入力した内容は、この端末の中だけに保存されます。</Text>
      <Button quiet onPress={openJournal}>記録・日記を見る</Button>
      <Button quiet onPress={openPeople}>人の管理・データのリセット</Button>
    </Card>

    <Card>
      <Text style={S.kicker}>規約・表記</Text>
      <Chips>{links.map(([label, href]) => <Chip key={href} onPress={() => { window.location.href = href; }}>{label}</Chip>)}</Chips>
      <Text style={styles.note}>お問い合わせは、各ページに記載のメールアドレスまで。</Text>
    </Card>
  </View>;
}

const styles = StyleSheet.create({
  note: { color: C.muted, fontSize: 12, lineHeight: 18 },
});
