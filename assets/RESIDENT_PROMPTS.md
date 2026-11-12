# 16タイプのキャラ画像 刷新の依頼（Codex 用）

図鑑の16タイプ（`resident-01〜16.webp`）を、すべて作り直す。

**方針は「元の神様の簡素な姿を固定して、季節で色を変え、タイプごとに小物を1つだけ足す」。**

作業ブランチ: `codex/resident-art`（`codex/site-polish-art` の `ca894a6` から分岐）

## 何を作り直すか・なぜか

- 今の `resident-01〜16.webp` は、魚の尾のような裾、着物のような柄、花の飾りなどが入っていて、元の神様の姿から離れている。
- これを、**元の神様の簡素な描写**に戻す。違いは、タイプごとの「小物1つ」と、背景の水の明るさだけで出す。
- 16枚を並べたとき、同じ一族に見えること。小さく表示しても（約170px）、小物が読めること。

## 使ってよいもの・使ってはいけないもの

| 区分 | 対象 | 扱い |
|---|---|---|
| 参照する | **季節の神様**: `assets/art/god-spring.webp` `god-summer.webp` `god-autumn.webp` `god-winter.webp` | キャラクターの本体として、各タイプの季節の神様を参照に付ける |
| 参照しない | 今の `resident-01〜16.webp`（尾・着物柄・花飾りのある旧デザイン） | 参照に渡さない。デザインも似せない |
| 参照しない | タロット、そのほかの絵 | 画風の参考にもしない（神様のイラストと、下の画風の指定だけを使う） |

## 固定するもの（16枚すべて共通）

神様の姿（参照画像のとおり）を、そのまま保つ。

- 顔は、**真っ黒な空洞**（目・口・鼻なし）のフード。先のとがった、高い円錐形のマント。
- 長い**白いスカーフ**が、風になびく。
- 胸に、小さな紋章が1つ。
- 構図は、**正面向きで、全身を中央に置く**。全身の高さは、画面の約65%。マントの下端（裾）は、画面の下から15%の位置。サイズ・位置・姿勢は、16枚で同じにする。
- **足・脚・手・腕は、一切描かない。** マントだけが立っているように見せる。
- **マントの中は、一切見せない。** 裾の内側、裏地、内側の空洞、隙間は描かない。裾は、閉じた、単色の平らな下端として描き、水面や岩の上に、静かに触れさせる。参照画像で、裾の内側が見えている部分は、まねしない。フードの中は、真っ黒な空洞のままで、奥の構造は描かない。
- マントの面は、ほぼ単色で、水彩のにじみ程度の質感だけを入れる。**柄、尾びれ、飾り、花、羽、フリルは付けない。**

## 季節で変えるもの（4通り）

| 季節 | 参照 | マントの色 | 胸の紋章 |
|---|---|---|---|
| 春（01〜04） | `god-spring.webp` | 若葉色（淡い黄緑）。スカーフは淡い桜色 | 桜 |
| 夏（05〜08） | `god-summer.webp` | 珊瑚〜朱色 | 太陽 |
| 秋（09〜12） | `god-autumn.webp` | 琥珀色（金茶） | 楓 |
| 冬（13〜16） | `god-winter.webp` | 氷青色（淡い青） | 雪の結晶 |

## 深さで変えるもの（背景の水だけ）

小物ではなく、**背景の水の明るさ**で出す。季節の色味を薄く混ぜる。背景はシンプルにして、キャラと小物が主役。

| 深さ | 背景 |
|---|---|
| 浅瀬 | 明るく澄んだ浅い水。陽の光が揺れる水紋 |
| 沿岸 | 岩と、港の杭が少し見える水辺。あたたかい光 |
| 沖合 | 広い海と、遠い水平線。落ち着いた中間の青 |
| 深海 | 暗い藍色の水。ごく淡い光の粒 |

## ワンポイント（タイプごとに小物を1つだけ）

その小物は、**マントのすぐ横の、胸の高さに浮かべるか、マントのすぐ脇の水辺や岩の上に置く**。手や腕は描かないので、「持っている」ようには見せない。**1つだけ**で、大きさは、キャラの全身の高さの約25%。小さく表示しても読めるよう、輪郭をはっきりさせ、**淡い金の差し色**を入れる。

| # | タイプ | 二つ名 | 小物（1つだけ） |
|---|---|---|---|
| 01 | 春の浅瀬 | 火花の発見者 | 胸の横に浮かぶ、小さな火花 |
| 02 | 春の沿岸 | 芽を育てる人 | マントの脇の水辺に置いた、双葉の芽が出た小さな鉢 |
| 03 | 春の沖合 | 航路を描く人 | 胸の横に浮かぶ、航路の線が引かれた海図の巻物 |
| 04 | 春の深海 | 眠る発明家 | 胸の前に浮かぶ、淡く光る種（眠っている卵のよう） |
| 05 | 夏の浅瀬 | 波打ち際の呼び声 | 胸の横に浮かぶ、ほら貝 |
| 06 | 夏の沿岸 | 港に火を灯す人 | 胸の横に浮かぶ、灯りのともるランタン |
| 07 | 夏の沖合 | 遠くへ旗を掲げる人 | マントの脇に立てた、旗竿とはためく小さな旗 |
| 08 | 夏の深海 | 静かに燃える人 | 胸の紋章（太陽）が、熾火のようにほのかに光る（マントの中は見せない。火は外に出さない） |
| 09 | 秋の浅瀬 | 拾う目を持つ人 | 胸の横に浮かぶ、小さな虫眼鏡 |
| 10 | 秋の沿岸 | 実りを分ける人 | マントの脇の水辺に置いた、実りが盛られた小さな籠 |
| 11 | 秋の沖合 | 収穫の測量者 | 胸の横に浮かぶ、小さな天秤 |
| 12 | 秋の深海 | 沈んだ記憶の守り手 | 胸の横に浮かぶ、古い鍵 |
| 13 | 冬の浅瀬 | 冷たい光を読む人 | 胸の横に浮かぶ、光を通す氷のかけら |
| 14 | 冬の沿岸 | 帰る場所を守る人 | マントの脇の水辺に置いた、窓に灯りのともる小さな家 |
| 15 | 冬の沖合 | 氷上の測量者 | 胸の横に浮かぶ、氷でできた小さな羅針盤 |
| 16 | 冬の深海 | 名付けられないものの番人 | 胸の横に浮かぶ、閉じかけた金色の環（途切れ目のある輪） |

## 出力仕様

- 正方形、**1024×1024**、WebP。
- 保存先: `assets/art/resident-NN.webp`（今のファイルに**上書き**する。コードの変更は要らない）。
- 背景は、紙のような水彩の質感で、画面いっぱいに塗る（枠・文字・ロゴは入れない）。
- 1枚ずつ個別に生成する（コンタクトシートは使わない）。

## 共通プロンプト（全タイプの先頭に付ける）

```
Use case: illustration-story. A single square character illustration for a Japanese coastal mythology divination app called 潮環占い. This is a simple, calm, flat-ish watercolor-on-washi picture-book illustration.

Character: the faceless hooded deity shown in the attached god reference image — a tall soft conical cloak with a pointed hood whose face is a pure black hollow (no eyes, no mouth, no features), a long white scarf streaming in the wind, one small emblem on the chest. Keep the character's shape, proportions and simplicity exactly as in the reference. Front-facing, full body, centered; the figure is about 65% of the image height, with the bottom hem about 15% above the lower edge. The cloak is a nearly solid color with only gentle watercolor bleeding. Do NOT add patterns, fins, tails, wings, flowers, frills or extra decoration to the cloak.

The figure has NO visible feet, legs, hands or arms; it looks like the cloak alone, standing. NEVER show the inside of the cloak: no inner lining, no underside, no opening or gap at the hem. The hem is drawn as a closed, flat, solid edge that rests lightly on the water surface or rock (do not copy the visible inner rim of the hem in the reference image). The inside of the hood stays a pure black hollow with no structure.

Season colors and chest emblem are given per type. The background is a simple, softly painted water scene whose brightness depends on depth (given per type), with a light season tint. The background stays quiet and simple so the character and the single small item stand out.

Beside the character there is exactly ONE small item (given per type): either floating at chest height next to the cloak, or placed on the water's edge or a rock right beside it. No hand holds it. The item is about 25% of the figure's height, with a clear outline and a pale gold accent so that it reads even at 170 pixels wide.

No text, no letters, no logo, no frame, no humans with faces, no extra characters, no animals unless the item says so.
```

## タイプ別プロンプト（16枚）

各タイプは「共通プロンプト」＋下の `Type:` 以降を続けて渡す。

```
01 Type: Spring / shallows. Reference: god-spring. Cloak: young-leaf pale green; scarf pale cherry pink; chest emblem: cherry blossom. Background: bright, clear shallow water with sunlit ripples, a soft green-pink tint. Item: a tiny spark of light floating beside the chest.
02 Type: Spring / coast. Reference: god-spring. Cloak and emblem as in 01. Background: calm shore water with a few rocks and a small harbor post, warm light, soft green tint. Item: a small pot with a two-leaf sprout, placed on the water's edge right beside the cloak.
03 Type: Spring / offshore. Reference: god-spring. Cloak and emblem as in 01. Background: wide calm sea with a distant horizon, medium blue with a green tint. Item: a rolled sea-chart scroll floating beside the chest, a thin route line drawn on it.
04 Type: Spring / deep. Reference: god-spring. Cloak and emblem as in 01. Background: dark indigo deep water with very faint light particles. Item: a softly glowing seed, like a sleeping egg, floating in front of the chest.
05 Type: Summer / shallows. Reference: god-summer. Cloak: coral to vermilion; chest emblem: sun. Background: bright clear shallow water, sunlit ripples, a warm turquoise tint. Item: a conch shell floating beside the chest.
06 Type: Summer / coast. Reference: god-summer. Cloak and emblem as in 05. Background: shore water with rocks and a harbor post, warm golden light. Item: a lit lantern floating beside the chest.
07 Type: Summer / offshore. Reference: god-summer. Cloak and emblem as in 05. Background: wide sea with a far horizon, vivid medium blue. Item: a small flagpole with a fluttering flag standing right beside the cloak.
08 Type: Summer / deep. Reference: god-summer. Cloak and emblem as in 05. Background: dark indigo deep water with faint warm particles. Item: none besides the chest emblem — the sun emblem on the chest glows softly like an ember (never show the inside of the cloak, no flame outside).
09 Type: Autumn / shallows. Reference: god-autumn. Cloak: amber golden brown; chest emblem: maple leaf. Background: bright shallow water, sunlit ripples, a warm amber tint. Item: a small magnifying glass floating beside the chest.
10 Type: Autumn / coast. Reference: god-autumn. Cloak and emblem as in 09. Background: shore water with rocks and a harbor post, golden evening light. Item: a small basket heaped with harvest fruit, placed on the water's edge right beside the cloak.
11 Type: Autumn / offshore. Reference: god-autumn. Cloak and emblem as in 09. Background: wide calm sea, far horizon, a muted amber-blue. Item: a small balance scale floating beside the chest.
12 Type: Autumn / deep. Reference: god-autumn. Cloak and emblem as in 09. Background: dark indigo deep water with faint amber particles. Item: an old key floating beside the chest.
13 Type: Winter / shallows. Reference: god-winter. Cloak: pale ice blue; chest emblem: snowflake. Background: bright, clear cold shallow water with pale ripples, a light ice-blue tint. Item: a shard of ice letting light through, floating beside the chest.
14 Type: Winter / coast. Reference: god-winter. Cloak and emblem as in 13. Background: cold shore with rocks and a harbor post, pale soft light. Item: a tiny house with a lit window, placed on the water's edge right beside the cloak.
15 Type: Winter / offshore. Reference: god-winter. Cloak and emblem as in 13. Background: wide cold sea with a far horizon, a muted steel blue. Item: a tiny compass made of ice floating beside the chest.
16 Type: Winter / deep. Reference: god-winter. Cloak and emblem as in 13. Background: dark indigo deep water, faint pale particles. Item: a thin golden ring with a small gap (an incomplete ring), floating beside the chest.
```

## 進め方

1. まず、**アンカーの4枚**（01 春の浅瀬、05 夏の浅瀬、09 秋の浅瀬、13 冬の浅瀬）を作る。依頼元に見せて、承認を取る。
2. 承認された4枚を、同じ季節の残り3枚の見本（参照）に付けて、順に作る。
3. 16枚が揃ったら、図鑑の一覧と並べて、そろい方を確認する。外れた1枚は、そのタイプだけ作り直す。
4. **1枚ごとに、次を必ず確認する**（1つでも外れたら作り直す）。
   - 足・脚・手・腕が、写っていない。
   - マントの中（裾の裏、内側、隙間、裏地）が、見えていない。
   - 小物が、1つだけで、マントの横に浮かぶか、すぐ脇の水辺・岩の上にある。
   - 尾びれ、柄、花、羽、飾りが、付いていない。

## 納品時にやること

1. 16枚を `assets/art/resident-01〜16.webp` に上書きする（1024×1024、WebP）。
2. [ARTWORK.md](ARTWORK.md) の「海の住人」の節を、新しい方針（神様の簡素な姿＋ワンポイント）の説明に書き換える。
3. `src/` は触らない。
