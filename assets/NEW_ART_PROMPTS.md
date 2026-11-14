# 新しい画像のプロンプト（海流 12 枚・海況 24 枚）

## 作業のしかた（Codex 向け・必ず守る）

作業用ブランチは `codex/new-sea-art`。**メインの作業フォルダでは作業せず、必ずワークツリーを作ってその中で作業する。**

```bash
# リポジトリの外に、専用のワークツリーを作る（ブランチは既にある）
git worktree add ../chokan-uranai-web-new-sea-art codex/new-sea-art
cd ../chokan-uranai-web-new-sea-art
```

- 画像の追加・コミットは、このワークツリーの中だけで行う。元のフォルダ（`chokan-uranai-web`）の変更中のファイルには触らない。
- 触ってよいのは `assets/art/` に **新しい画像ファイルを追加する** ことだけ（`current2-01.webp` 〜 `current2-12.webp`、`stage2-01.webp` 〜 `stage2-24.webp`）。既存の画像・コード・`src/` は変更しない。
- 画像は 1:1 の `webp` に変換して置く（既存の画像と同じ形式）。ファイル名は下の表のとおり。
- 数枚ごと（または 12 枚の海流が終わった時点）でコミットする。メッセージ例：`art: add current2 sea current illustrations`。
- 終わったら、ワークツリーから `git push -u origin codex/new-sea-art` で押し上げる。メインのブランチには直接マージしない。
- 作業が終わったら `git worktree remove ../chokan-uranai-web-new-sea-art` で片づける。

置き場所は `assets/art/`。ファイル名を合わせると、アプリが自動で差し替えます。
- 海流：`current2-01.webp` 〜 `current2-12.webp`（子〜亥の順）
- 海況：`stage2-01.webp` 〜 `stage2-24.webp`（立春から始まる24の区間の順）

画像は 1 枚ずつ、正方形（1:1）で生成します。下の「共通の画風」を、各行の被写体の前に必ず付けてください。

## 共通の画風（全 36 枚の先頭に付ける）

```
Use case illustration-story. Single square artwork for a polished Japanese coastal mythology game. Rich indigo and teal watercolor on textured washi paper, gold ink flecks and mint flecks, refined editorial Japanese picture book. One clear focal subject centered with generous padding, full bleed painted background, soft vignette. No text, no letters, no logos, no border, no frame, no human faces, no anthropomorphic features.
```

## 海流（12 枚）

被写体は 1 匹（1 つ）を大きく。背景は深い青緑の海。

| ファイル | 海流 | 被写体 |
|---|---|---|
| current2-01 | 珊瑚（芽吹き） | `Subject: a branching coral tree in the deep blue sea, tiny pale pink buds just sprouting at its tips, a few glowing seed-like bubbles rising, warm gold light from above, sense of new life beginning.` |
| current2-02 | 牡蠣（根づき） | `Subject: a cluster of oysters firmly attached to a dark sea rock, one shell slightly open showing a soft pearl glow, thick roots of seaweed gripping the rock, calm steady mood, sense of putting down roots.` |
| current2-03 | 飛魚（旅立ち） | `Subject: a flying fish leaping out of the sea surface with long wing-like fins spread, water drops sparkling in the air, distant horizon at dawn, sense of departure and freedom.` |
| current2-04 | イルカ（出会い） | `Subject: two dolphins swimming side by side close together in clear turquoise water, light rays from the surface, gentle curved composition, sense of meeting and connection.` |
| current2-05 | 鮪（挑戦） | `Subject: a powerful bluefin tuna darting straight toward the viewer through deep dark water, streamlined body with gold streak lines, strong forward motion, sense of bold challenge.` |
| current2-06 | 鯨（表現） | `Subject: a humpback whale singing, rising upward through the water with visible gold sound ripples spreading from its head into the sea, small stars of light in the dark, sense of a voice reaching far away.` |
| current2-07 | 鰻（転換） | `Subject: a long eel curling into a graceful turning loop like the symbol of a turning point, dark teal body with silver belly, faint spiral current around it, sense of change of form.` |
| current2-08 | 鯛（実り） | `Subject: a red sea bream with a rich vermilion body, surrounded by scattered gold ginkgo-leaf-like flecks and ripe harvest tones in the water, plump and satisfied, sense of reaping the harvest.` |
| current2-09 | 鰯（結束） | `Subject: a huge tight shoal of sardines swirling in one perfect circle like a silver tornado, light shafts from above, every fish aligned in the same direction, sense of unity.` |
| current2-10 | 蛸（成就） | `Subject: an octopus carefully holding a finished glowing orb of gold light with several arms, other arms tidy and relaxed, calm proud mood, sense of completion.` |
| current2-11 | 海月（手放し） | `Subject: a moon jellyfish drifting slowly upward, translucent bell with trailing thin tentacles, tiny bubbles floating away from it, soft pale blue and lavender glow, sense of letting go.` |
| current2-12 | 鮭（源流） | `Subject: a salmon leaping up a small rocky waterfall against the current, clear river water and mossy stones, a faint golden light at the top of the stream, sense of returning to the source.` |

## 海況（24 枚）

被写体は「海そのもの」の風景。立春から始まり、静 → 追い風 → 荒れ → 静と巡ります。人や顔は入れない。船は小さくてよい。

| ファイル | 海況 | 被写体 |
|---|---|---|
| stage2-01 | 凪の入り | `Subject: a perfectly calm sea at pale dawn, a thin mist on the water, a single tiny sailboat resting far away, quiet mood of waiting before moving.` |
| stage2-02 | そよ波 | `Subject: a calm sea with the first small ripples spreading across the surface, soft thawing light, a few ice-like pale fragments melting, sense of something hard loosening.` |
| stage2-03 | 舟出 | `Subject: a small wooden boat just pushing away from a quiet harbor pier at sunrise, rope loosened, sea gently glittering, sense of setting out.` |
| stage2-04 | 潮目 | `Subject: a visible tide line where two currents of different colors meet on the open sea, one teal and one pale gold, a lone buoy floating at the boundary, sense of choosing a direction.` |
| stage2-05 | 満ち潮 | `Subject: the sea rising slowly over a sandy shore and small rocks, shells and driftwood gathering at the water edge, warm afternoon light, sense of things gathering.` |
| stage2-06 | 帆あげ | `Subject: a small ship with a white sail just being hoisted up the mast, the sail catching light, calm bright sea, sense of beginning to move forward.` |
| stage2-07 | 追い風 | `Subject: a sailboat leaning forward with a full sail, a steady wind trail drawn as soft white streaks behind it, bright blue sea, sense of the wind pushing from behind.` |
| stage2-08 | 走り波 | `Subject: lively rolling waves with white tops racing across the sea toward the horizon, a sailboat riding along them, golden sparkle on the crests, sense of gaining momentum.` |
| stage2-09 | 帆満ち | `Subject: a sailboat at full speed under a fully filled round sail, bow throwing up a clean white spray, vivid blue and gold, sunny sky, the peak of speed.` |
| stage2-10 | 大海原 | `Subject: a vast open ocean viewed from a high angle in all directions to the horizon, clear sky, tiny sailboat in the distance, huge sense of openness and clear view.` |
| stage2-11 | 波頭 | `Subject: waves starting to rise with the first white foam crests curling, sky slightly paler, a tiny boat bobbing, sense of the first sign of change.` |
| stage2-12 | 無風 | `Subject: a sea with no wind at all, the sail hanging limp on a small boat, glassy flat water reflecting a hazy sky, mood of being stopped and waiting.` |
| stage2-13 | 遠雷 | `Subject: a distant thunderhead far on the horizon with a faint flash of lightning inside it, the nearby sea still calm and dim, sense of a faraway storm sign.` |
| stage2-14 | 黒雲 | `Subject: the sky turning dark with heavy black clouds spreading over the sea, the water becoming gray and steely, a small boat with its sail being lowered and tied down.` |
| stage2-15 | 時化 | `Subject: a rough stormy sea with tall dark waves and wind-blown spray, a ship staying in a sheltered cove at the edge of the frame, heavy rain streaks, strongest roughness.` |
| stage2-16 | 大嵐 | `Subject: a violent storm at sea with huge waves, lightning across the sky, rain lashing sideways, dramatic dark indigo and flashes of white, a tiny ship holding on.` |
| stage2-17 | 嵐の眼 | `Subject: the calm eye of a storm seen from above the sea, a circular opening in the clouds with a shaft of light and a small calm patch of water, walls of storm clouds all around.` |
| stage2-18 | 余波 | `Subject: the sea after a storm, leftover heavy swells, scattered driftwood and seaweed floating, clouds breaking up slowly, tired quiet mood.` |
| stage2-19 | 雲間 | `Subject: sunbeams breaking through a gap in the clouds over a rough but easing sea, a rainbow-colored glint on the water, a small boat starting to raise its sail again.` |
| stage2-20 | 澄み潮 | `Subject: extremely clear turquoise water where the sea floor, fish and rocks are visible far down, soft morning light, a compass-like glow on the surface, sense of seeing the next course.` |
| stage2-21 | 引き潮 | `Subject: the tide drawing out from a sandy beach, wet sand with shells and small tide pools shining, a trail of receding water, gentle sunset tones, sense of letting go and tidying.` |
| stage2-22 | 底潮 | `Subject: the deepest quiet part of the sea, dark blue water with a single small warm light glowing on the bottom among rocks, sense of reaching the bottom and turning back.` |
| stage2-23 | 夕凪 | `Subject: a windless evening sea mirror-flat under an orange and purple sunset, a boat silhouette at the horizon, sense of a quiet ending before a new cycle.` |
| stage2-24 | 静潮 | `Subject: the stillest night sea under a calm moon and a few stars, faint silver moon path on the black water, sense of rest and storing strength.` |

## 注意
- 24 枚は連続した 1 年の流れなので、色の流れ（静 → 明るい追い風 → 暗い荒れ → 澄む → 静）がつながるよう、同じセッションでまとめて作ると統一感が出ます。
- 海流の珊瑚（01）と牡蠣（02）は、いま別の生き物の絵で代用中なので、最優先です。
- 生成した画像は 1:1 のまま `webp` に変換して置いてください（既存の画像と同じ形式）。
