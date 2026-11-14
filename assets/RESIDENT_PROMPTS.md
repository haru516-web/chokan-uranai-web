# 16タイプのキャラ画像 刷新の依頼（Codex 用）

図鑑の16タイプ（resident-01〜16.webp）を、同じ幼い神様の姿で揃える。季節ごとの神様の色を基調にし、深さはマントの色の明るさで表す。横に置く小物は付けない。

作業ブランチ: codex/resident-art

## 参照

| 対象 | 扱い |
|---|---|
| assets/art/god-spring.webp、god-summer.webp、god-autumn.webp、god-winter.webp | 該当季節の色と胸の紋章の参考にする。形は共通プロンプトに合わせる。 |
| 既存の assets/art/resident-01〜16.webp | 旧デザインなので参照に使わない。 |
| 承認済みの新しい住人画像 | 幼い体型、構図、画風を揃える見本として使う。 |

## 16枚で固定する姿

- 正面向きで、全身を画面中央に置く。全タイプで大きさ、姿勢、余白を揃える。
- 子供らしい丸みのある円錐形のマントと、大きく尖ったフード。顔は目・鼻・口のない真っ黒な空洞。
- 首元の白い布は短く、短い端を首の近くに収める。長い風よけのスカーフにはしない。
- 胸の紋章は季節に合うものを小さく1つだけ付ける。
- 足・脚・手・腕は描かない。マントだけが立っているように見せる。
- マントの裾は閉じた単色の面にする。内側、裾の裏、裏地、隙間、開口部は描かない。フードの奥の構造も描かない。
- 外周の輪郭線、縁取り、外枠、光の縁を付けない。背景は完全に透過する。
- 柄、尾びれ、羽、花飾り、フリル、小物、背景の水辺や景色、影は描かない。桜は春の胸紋章としての1つだけ。

## 季節色と深さ

浅瀬から深海へ、季節の色相を保ったままマントを段階的に暗くする。深さはマントの色だけで示し、背景の明るさや景色では表現しない。

| 番号 | タイプ | マント色 | 胸の紋章 |
|---:|---|---|---|
| 01 | 春の浅瀬 | とても淡い若葉色 | 小さな桜 |
| 02 | 春の沿岸 | 明るい若葉色 | 小さな桜 |
| 03 | 春の沖合 | 落ち着いた中間の緑 | 小さな桜 |
| 04 | 春の深海 | 暗い森緑 | 小さな桜 |
| 05 | 夏の浅瀬 | 明るい珊瑚色 | 小さな太陽 |
| 06 | 夏の沿岸 | 珊瑚〜朱色 | 小さな太陽 |
| 07 | 夏の沖合 | 深い朱色 | 小さな太陽 |
| 08 | 夏の深海 | 暗い朱〜えんじ色 | 小さな太陽 |
| 09 | 秋の浅瀬 | 明るい琥珀色 | 小さな楓 |
| 10 | 秋の沿岸 | 金茶・琥珀色 | 小さな楓 |
| 11 | 秋の沖合 | 深い琥珀色 | 小さな楓 |
| 12 | 秋の深海 | 暗い茶琥珀色 | 小さな楓 |
| 13 | 冬の浅瀬 | とても淡い氷青色 | 小さな雪の結晶 |
| 14 | 冬の沿岸 | 明るい霜青色 | 小さな雪の結晶 |
| 15 | 冬の沖合 | 落ち着いた鋼青色 | 小さな雪の結晶 |
| 16 | 冬の深海 | 暗い藍色 | 小さな雪の結晶 |

## 共通プロンプト

各画像を個別に生成する。季節の神様画像は色と紋章の参考にし、承認済みの住人画像は体型と構図の参考にする。

Use case: illustration-story. One square transparent character illustration for a Japanese coastal mythology picture book. A simple, calm watercolor-on-washi image with soft texture and no drawn outline.

Character: a small childlike faceless hooded deity. Front-facing, full body, centered, same compact proportions and scale across the set. A rounded conical cloak with a large pointed hood; the hood opening is a pure black hollow with no eyes, nose, mouth, or visible inner structure. A tiny short white neck cloth with very short tucked ends close to the neck. One small seasonal emblem on the chest.

The cloak is a nearly solid seasonal color. Change only its lightness by depth while keeping the seasonal hue. The background is fully transparent; do not draw water, scenery, ground, rocks, harbor, horizon, particles, or shadows. Add no side item or accessory.

Show no feet, legs, hands, arms, or body. The cloak hem is closed, flat, and opaque. Never show the inside, underside, lining, opening, or gap of the cloak. Do not add an outline, border, rim, halo, or glow around the silhouette. No patterns, fins, tails, wings, flower ornaments, frills, extra decorations, text, letters, logo, or frame.

## タイプ別指定

共通プロンプトに、該当する指定を加える。

01 Spring / shallows: very pale young-leaf green cloak, tiny cherry-blossom chest emblem; brightest spring shade.
02 Spring / coast: light young-leaf green cloak, same tiny cherry-blossom emblem; slightly darker than 01.
03 Spring / offshore: medium muted fresh-green cloak, same tiny cherry-blossom emblem; darker than 02.
04 Spring / deep: dark forest-green cloak, same tiny cherry-blossom emblem; darkest spring shade.

05 Summer / shallows: bright coral cloak, tiny pale-gold sun emblem; brightest summer shade.
06 Summer / coast: richer coral-orange cloak, same tiny sun emblem; slightly darker than 05.
07 Summer / offshore: deep vermilion cloak, same tiny sun emblem; darker than 06.
08 Summer / deep: dark vermilion-burgundy cloak, same tiny sun emblem; darkest summer shade.

09 Autumn / shallows: bright amber-gold cloak, tiny muted orange maple-leaf emblem; brightest autumn shade.
10 Autumn / coast: golden-ochre cloak, same tiny maple-leaf emblem; slightly darker than 09.
11 Autumn / offshore: deep muted amber cloak, same tiny maple-leaf emblem; darker than 10.
12 Autumn / deep: dark brown-amber cloak, same tiny maple-leaf emblem; darkest autumn shade.

13 Winter / shallows: very pale ice-blue cloak, tiny snowflake emblem; brightest winter shade.
14 Winter / coast: medium frost-blue cloak, same tiny snowflake emblem; slightly darker than 13.
15 Winter / offshore: muted steel-blue cloak, same tiny snowflake emblem; darker than 14.
16 Winter / deep: dark midnight-indigo cloak, same tiny snowflake emblem; darkest winter shade.

## 出力・確認

- 正方形、1024×1024、透過背景のWebP。
- assets/art/resident-NN.webp に上書きする。src/ は変更しない。
- 1枚ずつ個別に生成し、16枚を並べて季節色と深さの流れを確認する。
- 各画像で、足・脚・手・腕がないこと、マントの内側が見えないこと、小物が追加されていないことを確認する。外れた画像だけ作り直す。
- ARTWORK.md の「海の住人」の説明を最新方針に合わせる。