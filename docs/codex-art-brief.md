# Codex への依頼：潮環占い 追加アートの生成

作業ブランチ：`codex/site-polish-art`（`claude/site-polish` から分岐）。
このブランチでは **`assets/art/` への画像追加と、下の「コードの変更」に書いた2か所だけ** を行ってください。`src/` のほかのファイルは触らないでください（`claude/site-polish` 側で並行して編集しています）。

## そのまま貼れる依頼プロンプト

```
潮環占い（D:\chokan-uranai-web、ブランチ codex/site-polish-art）の追加アートを生成して、assets/art/ に置いてください。

【画風】既存の assets/art/ と完全に揃える。assets/ARTWORK.md の生成プロンプトと、harbor.webp・scene-01〜08.webp・stage-01〜12.webp を必ず先に見て、同じ手ざわりにすること。
- 和紙・水彩・切り絵を重ねた質感。深い藍（#10172a〜#1a243c）とターコイズ、淡い金（#eacc8c）の差し色。
- 静かで神秘的、絵本のように上品。文字・ロゴ・枠・UI は一切入れない。
- 人物は描かない（神は既存の img/sheet-*.webp のフード姿のシルエットのみ可）。

【つくるもの】ファイル名・サイズ・形式は厳守。コード側は「ファイルがあれば使う」実装済みなので、置くだけで画面に出ます。

1. 5段階の海（運勢の段階ごとの情景・横長 4:3・1200×900・WebP・各200KB以下）
   - tier-01.webp 凱風：朝焼けの凪いだ海に魚影が満ち、金色の光が水面に広がる。祝祭的。
   - tier-02.webp 順風：帆をいっぱいに張った小舟が、明るい青の海を軽やかに進む。
   - tier-03.webp 凪：鏡のように静かな薄藍の海。月か淡い雲が映る。余白が多い。
   - tier-04.webp 荒波：白波の立つ暗い海。風に傾く小舟。緊張感はあるが怖すぎない。
   - tier-05.webp 轟沈：嵐の夜の黒い海と稲光。港につながれた舟の小さな灯りが一つだけ残る（「休んでいい」という救いを必ず入れる）。
   ※ 5枚を並べたとき、明→暗へ段階的に変わって見えること。色相は 金→若緑→薄藍→朱→深紅 に寄せる。

2. 鑑定の儀式の背景（縦長 9:16・1080×1920・WebP・300KB以下）
   - ritual-bg.webp：真夜中の海の真上に、大きな月と同心円の潮の輪。中央（上から35〜45%の位置）は神と輪の演出が重なるので、暗く静かな余白にする。下半分は文字が載るので暗く。

3. アイコン（正方形・512×512・背景透過 WebP・各60KB以下。淡い金の線と藍の面、和紙の質感。小さく表示しても形が読めること）
   - icon-compass.webp：羅針盤（自己診断の入口）
   - icon-question.webp：水面に浮かぶ泡ひとつ、または貝の中の問い（「問いの海」の入口）
   - icon-book.webp：開いた和綴じの本（仕組みの解説）
   - icon-work.webp：錨（仕事・学び）
   - icon-love.webp：寄り添う二つの貝、または結び目（恋愛・対人）
   - icon-money.webp：金の真珠を抱いた貝（金運）
   - icon-health.webp：若葉と水滴（健康・休息）

4. 共有・ブラウザ用
   - og.png：1200×630・PNG・500KB以下。左に大きな余白（あとで文字は載せない。絵だけで成立させる）、右に月と潮の輪と小舟。harbor.webp と同じ世界観。
   - favicon.png：256×256・PNG。app-icon.png の「空白の環」を、16px でも読めるよう単純化したもの。

【コードの変更】この2か所だけ。
- index.html の <title> の直前に追加：
    <meta property="og:image" content="./assets/art/og.png" />
    <meta name="twitter:image" content="./assets/art/og.png" />
  そして rel="icon" の href を ./assets/art/favicon.png に変更。
- assets/ARTWORK.md の末尾に、今回使った生成プロンプトを追記。

【確認】
- npx tsc --noEmit が通ること。ビルド（vite build / eas build など）は実行しない。
- npx vite --host 127.0.0.1 で起動し、スマホ幅で次を目視：
  今日の占い（未入力）の入口カードのアイコン／入力後の儀式の背景／結果の下「今日の海のようす」の上の段階アート／「仕事・恋愛・金運・健康」のアイコン。
- 文字が絵に埋もれていないか、5段階の絵が段階順に見えるかを確認し、だめなら作り直す。
- コミットはこのブランチに。push と PR 作成は指示があるまでしない。
```

## 受け口（実装済み）

| ファイル | 使われる場所 | 無いときの表示 |
| --- | --- | --- |
| `tier-01〜05.webp` | 結果の下「今日の海のようす」カードの上部（`src/FortuneDetail.tsx`） | 文章だけ |
| `ritual-bg.webp` | 鑑定の儀式の背景（`src/Ritual.tsx`） | 放射状のグラデーション |
| `icon-compass / question / book.webp` | 未入力時の入口カード（`src/Today.tsx`） | 絵文字 |
| `icon-work / love / money / health.webp` | 分野別の運勢カード（`src/FortuneDetail.tsx`） | 記号 |
| `og.png`・`favicon.png` | `index.html` | 画像なし／`app-icon.png` |

読み込みは `src/art.ts` の `optional()`。ファイル名が合っていれば、コードを書かなくても反映されます。
