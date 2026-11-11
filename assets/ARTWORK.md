# 潮環占いの画像

`assets/art/` に55点を収録。ホーム背景1点、住人16体、海流12点、海況12点、神話と航海帳の挿絵8点、既存素材から切り出した神々5点、アプリアイコン1点。

組み込みの ImageGen でホーム背景と3枚の絵素材シートを作成。各マスをWebPに書き出して画面に配置し、神話の「空白の環」をアイコンにも使用した。神々の絵は既存の `img/sheet-*.webp` の先頭フレーム。

## 生成に使用したプロンプト

### ホーム背景

Use case illustration-story. Wide 3:2 painted app home backdrop for a Japanese coastal mythology game called 潮環占い. Refined tactile washi, watercolor and layered cut paper, deep turquoise and midnight navy with aged pale gold. Full bleed view from a dark island coast across luminous tidal rings toward a tiny lighthouse far right and a crescent moon, small traditional sailboat, turquoise surf, quiet stars. Upper LEFT third and lower edges have calm dark negative space for overlay UI. Handcrafted, mysterious, calming, beautifully detailed, professional Japanese indie game. No words, typography, labels, frames or UI.

### 海の住人

Use case illustration-story. Single square 4x4 contact sheet for a polished Japanese coastal folklore game, 16 DIFFERENT collectible sea spirit illustrations, 4 rows 4 columns EXACT even grid. Each cell has a single small readable spirit silhouette centered with generous padding and a full bleed softly textured color background. No visible grid borders, no text, no overlaps. Handmade Japanese washi watercolor, whimsical but elegant, big expressive black eyes, gold ink accents. Row 1 pale mint spring: pale shrimp carrying a seed, shell spirit with sprout, small seabird with folded map, coral seahorse with tiny lantern. Row 2 sunny aqua summer: cheerful jumping fish, round pink crab, winged manta ray, indigo glowing jellyfish. Row 3 warm apricot autumn: orange round shell creature, gold starfish, sea turtle carrying a basket, violet octopus with an ink bottle. Row 4 frost blue winter: white seal pup, blue hermit crab, silver narwhal, midnight whale with constellation markings. Crisp color blocking, rich visual texture, no lettering, no symbols at the edges.

### 海流と海況

Use case illustration-story. Single square 4x4 contact sheet for a polished Japanese coastal mythology game, 16 separate artworks, 4 rows 4 columns EXACT even grid, no gaps or margins or grid outlines, crisp compositions centered in each cell, none overlap, no text. Rich indigo watercolor and washi paper, gold and mint flecks, editorial Japanese picture book. Cells row 1 dolphin, red sea bream, curling eel, sea turtle. Row 2 bluefin tuna, moon jellyfish, octopus, humpback whale. Row 3 squid, shoal of sardines, flying fish, salmon. Row 4 morning still sea, rippling water, tide rising around rocks, gold breeze over sailboat. Distinct silhouettes, avoid anthropomorphic features, each tile with full bleed teal ocean setting.

### 海況と神話

Use case illustration-story. Single square 4x4 contact sheet for a polished Japanese coastal mythology game, 16 separate scenes, 4 rows 4 columns EXACT even grid, no gaps margins or grid outlines, compositions centered per cell, no overlaps, no text. Rich indigo watercolor washi paper, gold and mint flecks, refined Japanese picture book. Row 1 wind fills a sail, scattered choppy waves, long rolling ocean swell, lightning storm on black sea. Row 2 a clear eye in a storm, thin rainbow after rain, receding tide on sand, still sea under purple twilight. Row 3 the missing sea at midnight, two ancient lighthouses facing away, faded hand painted sea chart, mysterious whirlpool in navy. Row 4 old moon over harbor, boat tilted into wind, golden celestial empty ring over water, turquoise moonlit tide pool.

## 追加アート（2026-11）

15点を組み込み ImageGen で個別生成し、指定サイズに変換した。各プロンプトに共通して次のスタイル指定を使った。

> Use case: illustration-story. Asset type: Japanese coastal mythology website/app artwork matching the tactile handcrafted world of the existing harbor artwork. Layered washi paper, watercolor washes, delicate cut-paper edges and subtle paper grain; deep indigo #10172a to #1a243c, turquoise sea, pale aged gold #eacc8c accents, refined picture-book painting, quiet and mysterious. No people, no letters, no text, no logo, no frame, no UI, no watermark.

### 5段階の海

横長4:3、1200×900。各段階を個別に生成。

- `tier-01.webp` — A bountiful sea at dawn: calm open water filled with subtle schools of fish silhouettes beneath the surface; expansive warm sunrise glow and pale gold light spreading across the water, celebratory but serene. Make this the brightest tier, with golden apricot dawn and touches of young mint green over the established indigo and turquoise palette. No boats.
- `tier-02.webp` — A small traditional Japanese sailing boat with full white sail glides lightly across a bright clear blue-green sea in a favorable breeze; soft young green and turquoise highlights, pale gold sunlight on the sail and wavelets. Open optimistic sky, energetic but gentle. Brighter than the next three tiers.
- `tier-03.webp` — A mirror-still pale indigo sea at twilight, reflecting a softly luminous moon and a few quiet clouds; generous uncluttered negative space, delicate ripples and restrained pale gold glimmer. Balanced calm, muted cool blue and turquoise, neither stormy nor celebratory. No boat.
- `tier-04.webp` — A darkening sea with lively whitecaps and wind-shaped waves; one small traditional sailing boat leans into the wind, safely navigating through the swell. Add restrained vermilion-coral undertones in distant clouds and foam, dramatic but not frightening, readable silhouettes, no wreckage.
- `tier-05.webp` — A near-black midnight storm sea in deep indigo, with layered cut-paper waves and muted deep-crimson undertones. Distant cloud and subdued far-off lightning glow, very dark overall and visually darker than the rough-sea tier. At the far edge, a simple shadowed harbor quay shelters exactly one small moored boat, with exactly one tiny warm pale-gold lantern as the only visible point of light. No lighthouse, buildings, second boat, stars, or other lights. The sheltered boat feels reassuring and conveys permission to rest.

### 儀式の背景

縦長9:16、1080×1920。

- `ritual-bg.webp` — Vertical full-bleed midnight ocean seen straight on. A large pale-gold moon hangs above the sea in the upper quarter; broad concentric tidal rings radiate gently across the sky and water. Keep the central band around 35–45% image height dark, calm, and uncluttered for a deity overlay, with ring highlights curving around rather than crossing that center. Keep the entire lower half very dark indigo with only faint turquoise texture, quiet enough for readable overlay text. Deep ocean, soft mist, restrained golden moonlight, no figures or boats.

### アイコン

正方形512×512、透過背景WebP。淡い金の線、藍の面、少ない要素で小さくても形を読める構成。

- `icon-compass.webp` — One isolated centered Japanese-style mariner's compass: a simple elegant four-point compass rose in pale aged-gold linework over a small deep-indigo circular enamel/washi-paper face, a few turquoise accents, bold silhouette legible at tiny size. Generous transparent padding.
- `icon-question.webp` — One isolated centered symbol: a single luminous turquoise water bubble hovering over a small dark-indigo ripple, with one delicate pale-gold highlight suggesting a question without any punctuation or letters. Minimal bold silhouette legible at tiny size. Generous transparent padding.
- `icon-book.webp` — One isolated centered open Japanese stab-bound book, two deep-indigo washi pages gently opening, a few pale-gold thread stitches visible along the central spine and a fine turquoise page accent. No writing or marks on pages. Simple bold silhouette legible at tiny size. Generous transparent padding.
- `icon-work.webp` — One isolated centered sturdy traditional anchor, deep-indigo body with a clean pale aged-gold outline and a tiny turquoise rope loop. Simple iconic silhouette, balanced and legible at tiny size. Generous transparent padding.
- `icon-love.webp` — One isolated centered pair of small seashells leaning gently together, deep-indigo shells with pale aged-gold edges and a subtle turquoise shared glimmer; tender but understated, no hearts. Simple bold silhouette legible at tiny size. Generous transparent padding.
- `icon-money.webp` — One isolated centered deep-indigo scallop shell gently holding one round luminous pale-gold pearl, with a restrained turquoise accent at the base. Simple bold silhouette clearly legible at tiny size. Generous transparent padding.
- `icon-health.webp` — One isolated centered fresh young sea-green leaf with one turquoise dew drop, pale aged-gold contour accents, calm and restorative. Simple bold silhouette clearly legible at tiny size. Generous transparent padding.

### 共有画像とfavicon

- `og.png` — Wide 1200×630 social-sharing illustration. Reserve the entire left half as calm dark indigo open sky and sea for later typography. On the right, show a luminous pale-gold moon above broad concentric turquoise and gold tide rings, with one small traditional Japanese sailing boat. Same quiet harbor world, no lighthouse or other focal objects.
- `favicon.png` — Square 256×256 browser icon simplifying the existing app icon's 空白の環: one thick incomplete pale-gold tidal ring with an opening at the bottom, deep-indigo inner disk, and one tiny turquoise wave inside the lower edge. Strong silhouette, generous padding, restrained washi grain, legible at 16 pixels.
