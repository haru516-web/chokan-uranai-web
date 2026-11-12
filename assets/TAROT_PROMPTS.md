# タロット22枚 画像生成依頼（Codex 用）

潮環占いの「今日の一枚」用に、大アルカナ22枚（0〜21）のカード絵を作る。
**22枚すべてを新規に生成する。** 既存のタロット試作5枚（`tarot-00/09/11/17/19`）は基調にしない。参照もしない。

作業ブランチ: `codex/tarot-art`（`codex/site-polish-art` の `8d6bedb` から分岐）

## 使ってよいもの・使ってはいけないもの

| 区分 | 対象 | 扱い |
|---|---|---|
| 使う | **神様のイラスト** `assets/art/god-spring.webp` `god-summer.webp` `god-autumn.webp` `god-winter.webp` `god-origin.webp` | 主役のキャラクター参照として渡してよい |
| 使わない | **図鑑の住人** `assets/art/resident-01〜16.webp`、およびその16体（エビ・貝・海鳥・タツノオトシゴ・魚・蟹・マンタ・クラゲ・巻貝・ヒトデ・亀・タコ・アザラシ・ヤドカリ・イッカク・クジラの擬人化キャラ） | 参照に渡さない。登場させない。デザインも似せない |
| 使わない | 既存タロット試作5枚 | 基調にしない。参照しない |
| 参照してよい | 世界観・共通の画風 [ARTWORK.md](ARTWORK.md) | 共通スタイルの確認用 |

- カードに登場する動物（イルカ・アシカ・蟹・鳥など）は、**写実寄りの一般的な動物**として描く。図鑑の住人のような、丸い大きな黒目のコレクティブル風のキャラにはしない。
- 神様の見た目（参照画像）: 顔が真っ黒な空洞の、フード付きの円錐形のマント。白いスカーフが風になびく。胸に季節の小さな紋章がある。
  - 春＝若葉色のマントに桜、夏＝珊瑚〜金に太陽、秋＝琥珀色に楓、冬＝氷色に雪の結晶、潮祖（origin）＝白に空白の環。

## 目的と大事な条件

- **標準的なタロットの意味が一目で伝わること**が最優先。各カードの「標準の象徴」を必ず絵に残し、潮環の海の世界に置き換える。
- カード名・数字・メッセージは**画像に焼き込まない**（画面側で重ねる）。文字・ロゴ・透かしは一切入れない。
- 怖いカード（死神・悪魔・塔）も、恐怖や流血・骸骨・残酷な表現は使わない。**手放し・切り替え・縛りに気づく**という穏やかな表現にする。

## 出力仕様

- 縦長 2:3、**1024×1536**、WebP。
- 保存先: `assets/art/`
- ファイル名: `tarot-NN-name.webp`（NN は2桁の番号、name は英語のケバブケース）。既存5枚と同名のファイルが元のチェックアウトにはあるが、**この作業ブランチ内にはまだ無い**ので、そのまま同名で新規に作ってよい（採用の判断は後で依頼元が行う）。
- 1枚ずつ個別に生成する（コンタクトシートは使わない）。

## 進め方（枠と画風は新しく決める）

1. まず **`tarot-21-the-world`** を1枚だけ生成し、枠・質感・神様の描き方を確定する（依頼元に見せて承認を取る）。
2. 承認された1枚を**以降の21枚の共通の見本**として参照に付ける（このセット内の統一用）。同時に神様のイラスト（`god-*.webp`）をキャラクター参照にも付ける。
3. 残りを順に生成する。1枚ごとに枠・マントの色・質感が揃っているか確認し、外れたものだけ再生成する。

## 共通プロンプト（全カードの先頭に付ける）

```
Use case: illustration-story. A single vertical 2:3 tarot-style card illustration for a Japanese coastal mythology divination app called 潮環占い.

Medium: tactile washi paper, watercolor washes, delicate cut-paper edges, faint paper grain; deep indigo and turquoise sea, aged pale gold #eacc8c accents; refined Japanese picture book, quiet, mysterious, warm.

Frame (identical on every card): a cream washi outer margin with rounded corners; inside it a thin double gold line border; stylized gold-and-white Japanese wave-crest ornaments in all four corners; a small gold ring emblem (an almost closed ring with a small opening) at the top center and bottom center of the border. The artwork fills the frame area.

Main character: the faceless hooded deity shown in the attached god reference image — a tall softly conical cloak with a pointed hood whose face is a pure black hollow (no eyes, no mouth, no features), a long white scarf streaming in the wind, a small emblem on the chest. Keep the character's proportions and shape from the reference. Cloak colour and chest emblem are given per card.

Animals, where present, are natural, slightly stylized, readable silhouettes — not cute collectible mascots, no big round black eyes.

No text, no letters, no numerals, no logo, no watermark, no UI, no extra frame, no human faces, no realistic people. Composition: single clear focal subject with a readable silhouette, generous calm space, evenly lit.
```

## カード別プロンプト（22枚）

各カードは「共通プロンプト」＋下の `Card:` 以降を続けて渡す。
神様の参照: 春→`god-spring`、夏→`god-summer`、秋→`god-autumn`、冬→`god-winter`、潮祖→`god-origin`。

| 番号 | ファイル名 | カード | 神様の参照 |
|---|---|---|---|
| 00 | `tarot-00-the-fool.webp` | 愚者 | 潮祖 |
| 01 | `tarot-01-the-magician.webp` | 魔術師 | 夏 |
| 02 | `tarot-02-the-high-priestess.webp` | 女教皇 | 冬 |
| 03 | `tarot-03-the-empress.webp` | 女帝 | 春 |
| 04 | `tarot-04-the-emperor.webp` | 皇帝 | 秋 |
| 05 | `tarot-05-the-hierophant.webp` | 教皇 | 秋 |
| 06 | `tarot-06-the-lovers.webp` | 恋人 | 春 |
| 07 | `tarot-07-the-chariot.webp` | 戦車 | 夏 |
| 08 | `tarot-08-strength.webp` | 力 | 春 |
| 09 | `tarot-09-the-hermit.webp` | 隠者 | 冬 |
| 10 | `tarot-10-wheel-of-fortune.webp` | 運命の輪 | 潮祖 |
| 11 | `tarot-11-justice.webp` | 正義 | 秋 |
| 12 | `tarot-12-the-hanged-man.webp` | 吊るされた男 | 冬 |
| 13 | `tarot-13-death.webp` | 死神 | 秋 |
| 14 | `tarot-14-temperance.webp` | 節制 | 春 |
| 15 | `tarot-15-the-devil.webp` | 悪魔 | 夏 |
| 16 | `tarot-16-the-tower.webp` | 塔 | 夏 |
| 17 | `tarot-17-the-star.webp` | 星 | 春 |
| 18 | `tarot-18-the-moon.webp` | 月 | 冬 |
| 19 | `tarot-19-the-sun.webp` | 太陽 | 夏 |
| 20 | `tarot-20-judgement.webp` | 審判 | 潮祖 |
| 21 | `tarot-21-the-world.webp` | 世界 | 潮祖 |

### 00 愚者（意味: 未知への一歩・自由・無垢・始まり）
```
Card: The Fool. White cloak with the open-ring emblem (reference: god-origin). The deity steps lightly toward the edge of a sea cliff at dawn, a small bundle on a stick over the shoulder, a small white seabird or small dog-like animal at the heel, a pale sun rising over a wide open sea, a single fresh footprint trail behind. Light, carefree, full of possibility.
```

### 01 魔術師（意味: 意志・始まり・創造・手元にある道具で始める）
```
Card: The Magician. Coral and gold cloak with a small sun emblem (reference: god-summer). The deity stands at a driftwood table on a bright shore, one hand raised toward the sky, the other pointing down to the sand. On the table, four small tools: a lantern, a seashell, a compass and a small coin — all the elements at hand. A glowing infinity-shaped tide ring floats above the hooded head. Bright summer sunlight, white and gold flowers by the shore.
```

### 02 女教皇（意味: 直感・静けさ・隠された知・内なる声）
```
Card: The High Priestess. Ice-blue and silver cloak with a snowflake emblem (reference: god-winter). The deity sits between two pillars, one black and one white, on a moonlit winter shore; a still sea behind a hanging veil of pale blue cloth embroidered with tide patterns. A crescent moon rests at the feet; a closed scroll in the lap. Quiet, mysterious, deep indigo and silver.
```

### 03 女帝（意味: 豊かさ・育む・実り・愛情）
```
Card: The Empress. Young-green cloak with a cherry-blossom emblem (reference: god-spring). The deity sits on a cushioned seat in a flowering meadow at the edge of a calm sea, golden grain and spring flowers around, a small spring stream flowing into the sea; a crown-like ring of small stars floats over the hood. Warm, abundant, gentle.
```

### 04 皇帝（意味: 秩序・責任・構造・安定した権威）
```
Card: The Emperor. Amber and vermilion cloak with a maple-leaf emblem (reference: god-autumn). The deity sits on a stone throne carved with ram-horn spirals on a rocky headland above a vast calm sea, holding a golden ring-shaped sceptre and a tide-orb; red maple leaves, steady mountains behind. Strong, stable, geometrically composed.
```

### 05 教皇（意味: 伝統・教え・師・共有される規範）
```
Card: The Hierophant. Deep amber and ochre cloak with a maple-leaf emblem (reference: god-autumn). The deity sits before a small seaside shrine gate between two pillars, one hand raised in blessing, two small cloaked pupils (also faceless, simplified hooded forms) kneeling in front. Two crossed keys (one gold, one silver) on the ground. Ginkgo-yellow leaves, quiet and ceremonial.
```

### 06 恋人（意味: 選択・結びつき・調和・心からの選択）
```
Card: The Lovers. Two faceless hooded deities standing side by side on a flowering shore — one in a soft pink cloak, one in a soft mint cloak (reference: god-spring for both, in two colours); a luminous winged sun-ring above them blessing the pair; a blossoming tree and a tree with golden fruit on either side. Two small boats moored together in the background. Tender, bright, balanced.
```

### 07 戦車（意味: 前進・意志・勝利・手綱を握る）
```
Card: The Chariot. Coral and gold cloak with a sun emblem (reference: god-summer). The deity stands upright in a small canopy boat-chariot with a star-covered canopy, pulled across the water by two sea creatures (one pale, one dark, dolphin-like) facing slightly different ways, held on loose reins. A walled harbor town at the back, bright dynamic wave crests, strong forward motion.
```

### 08 力（意味: 勇気・優しさによる制御・忍耐・内なる強さ）
```
Card: Strength. Young-green cloak with a cherry-blossom emblem (reference: god-spring). The deity gently rests one hand on the head of a large calm sea lion on a flowering shore; a luminous infinity-shaped ring floats above the hood; a garland of flowers around the sea lion's neck. Soft light, tenderness over force.
```

### 09 隠者（意味: 内省・孤独の中の導き・静かな探求）
```
Card: The Hermit. Ice-blue and silver cloak with a snowflake emblem (reference: god-winter). The deity stands alone on a snowy winter shore at night, holding up a small paper lantern whose warm gold light shows a short stretch of path; a staff in the other hand; a dark sea and distant icy mountains under quiet stars. Silent, introspective, guiding light.
```

### 10 運命の輪（意味: 巡り・転機・サイクル・潮目の変わり目）
```
Card: Wheel of Fortune. White cloak with the open-ring emblem (reference: god-origin). A large golden wheel of tide rings floats on the open sea, partly turning, with small carved sea symbols around its rim; a small sea creature rising on one side and another descending on the other; the deity floats above the wheel in meditation. Four small winged guardians (a bird, a fish, a turtle, a shell) in the four corners of the sky. Deep indigo and gold.
```

### 11 正義（意味: 公平・見極め・因果・事実に基づく判断）
```
Card: Justice. Amber cloak with a maple-leaf emblem (reference: god-autumn). The deity sits on two small mossy rocks in a perfectly still sea at golden hour, a brass balance scale on one side and an old sea chart scroll on the other, all reflected in the water; a large pale-gold moon-like disc behind; floating red maple leaves. Calm, fair, clear.
```

### 12 吊るされた男（意味: 視点を変える・停止・受容・手放して見えるもの）
```
Card: The Hanged Man. Ice-blue and silver cloak with a snowflake emblem (reference: god-winter). The deity hangs gently upside-down by one ankle from a wooden harbor beam (T-shaped) over a mirror-still winter sea, the cloak and white scarf falling serenely; a soft golden halo behind the hood; the world reflected the right way up in the water. Peaceful, never frightening, no ropes around the neck.
```

### 13 死神（意味: 終わりと再生・手放し・切り替え）
```
Card: Death. Deep amber and dark plum cloak with a maple-leaf emblem (reference: god-autumn). The deity stands holding a banner with a white blossom-ring emblem, gently walking across a shore at the end of the day; behind, a boat sails out of the harbor between two towers toward a rising pale sun; falling autumn leaves become fish-shaped sparkles on the water. A gentle ending that makes room for a new beginning. No skeleton, no skull, no scythe, no bones.
```

### 14 節制（意味: 調和・バランス・中庸・ほどよく混ぜる）
```
Card: Temperance. Young-green and pale-pink cloak with a cherry-blossom emblem and tiny white wings (reference: god-spring). The deity stands with one foot in a pond and one on the shore, pouring a stream of luminous water between two cups, the water arcing continuously. Irises, a winding path rising to a small golden ring on the horizon. Gentle, balanced, flowing.
```

### 15 悪魔（意味: 執着・縛り・依存・気づけば外せる鎖）
```
Card: The Devil. Dark coral and charcoal cloak with a sun emblem (reference: god-summer). A larger shadowed figure with large dark ram-like horns made of curled shadow (no demon face, no fangs, no gore) rises over a small black rock platform; two small faceless cloaked figures stand loosely tethered by long slack chains that are clearly not tight and could be lifted off. Dark teal sea behind with a single glowing lantern. Moody but not horrifying; the chains look loose.
```

### 16 塔（意味: 突然の崩れ・思い込みの崩壊・衝撃・リセット）
```
Card: The Tower. Deep orange and storm-indigo cloak with a sun emblem (reference: god-summer). A tall stone lighthouse-like tower on a sea cliff struck by a bolt of golden lightning; its crown-shaped top lifts off; two small hooded figures tumble gently out and fall toward the water, safely. Dark navy sky, ember-gold sparks, calm sea below. Dramatic but not violent, no fire catastrophe, no injuries.
```

### 17 星（意味: 希望・癒やし・道しるべ・静かな再生）
```
Card: The Star. Young-green cloak with a cherry-blossom emblem (reference: god-spring). The deity kneels at the edge of a clear pool by the sea at night, pouring water from two jugs — one into the pool, one onto the shore; one large eight-pointed gold star and seven smaller white stars overhead; a soft spring mist and the silhouette of a far island. Hopeful, healing, clear.
```

### 18 月（意味: 不安・曖昧さ・夢・見えないものを感じ取る）
```
Card: The Moon. Pale blue and silver cloak with a snowflake emblem (reference: god-winter). A huge luminous full moon over a dark winter sea; a path of pale light leading from the shore to the horizon; a wolf-like and a dog-like animal howling gently on opposite sides; a crayfish-like crab emerging from a tide pool; two small towers on the horizon. Misty, dreamlike, blue-violet.
```

### 19 太陽（意味: 喜び・成功・生命力・率直なつながり）
```
Card: The Sun. Coral and gold cloak with a sun emblem (reference: god-summer). A large radiant gold sun fills the upper sky over a sunlit harbor; the deity stands joyfully with arms open, a white scarf streaming; sunflowers along the quay, small boats with bright sails, sparkling blue water. Warm, bright, celebratory, the brightest card of the set.
```

### 20 審判（意味: 目覚め・再出発・評価・呼びかけに応える）
```
Card: Judgement. White cloak with the open-ring emblem (reference: god-origin). A great spiral conch horn held to the sky, its sound shown as luminous rings of tide spreading across the sea; many small faceless cloaked figures rising up from the waves with arms open, looking upward; a pale-gold dawn light breaking through clouds. Mountains of icy blue on the horizon. Awe, calling, renewal.
```

### 21 世界（意味: 完成・統合・達成・ひとつの環が閉じる）
```
Card: The World. White cloak with the open-ring emblem (reference: god-origin). The deity dances lightly inside a large closed gold laurel-like ring of tide waves and sea flowers, a long white scarf crossing in a gentle spiral; in the four corners of the card, four small guardians — a winged fish, a seabird, a sea turtle and a shell — drawn as natural symbolic emblems. The empty ring of the mythology (空白の環) is finally complete. Bright, celebratory, deep turquoise and gold. (Generate this card first to fix the frame and style for the rest of the set.)
```

## 納品時にやること

1. 22枚を `assets/art/` に保存（1024×1536、WebP）。
2. [ARTWORK.md](ARTWORK.md) の「ワンオラクルカード」の節を、22枚の構成に書き換える（使ったプロンプトはこのファイルでよい）。
3. 参照や登録（`src/art.ts` と `src/tarotDeck.ts`）は、このブランチでは触らない。依頼元が行う。
4. 22枚を並べて、枠・マント・質感が揃っているか確認する。外れた1枚は、そのカードだけ再生成する。
