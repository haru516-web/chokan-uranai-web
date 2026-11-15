#!/usr/bin/env bash
# 動画A「生年月日と名前だけで、今日の運勢が出るまで」。実アプリの画面録画（record-a.mjs）を15秒に編集する。
# 先に： node promo/tiktok/record-a.mjs（DPR=2）→ out/frames/a から out/raw-a.mp4 を作っておく（README参照）
set -euo pipefail
cd "$(dirname "$0")/../.."
source promo/tiktok/lib.sh
init_work
RAW="$(pwd)/promo/tiktok/out/raw-a.mp4"; cp "$RAW" "$W/raw.mp4"
GOLD=0xeacc8c

# ① フック（2.4秒）：1コマ目から「結果の画面」と大きな問い。録画の「60位／160」の瞬間を止めて使う
txt h0 '生年月日と名前を入れるだけ'; txt h1 '今日、あなたは'; txt h2 '160位中 何位？'
freeze "$W/s0" raw.mp4 45.2 2.4 "drawbox=x=0:y=250:w=iw:h=560:color=black@0.55:t=fill" "$(dt h0 62 $GOLD 330)" "$(dt h1 120 white 470)" "$(dt h2 128 $GOLD 650)"
# ② 手順（実画面を倍速）
txt p1 '① 生年月日と名前を入れる'; txt p2 '② 今日の海を読んでいく'; txt p3 '③ 今日の順位が出る'
clip "$W/s1" raw.mp4 2.8 7.3 1.5 "$(pill p1 56 215)"
clip "$W/s2" raw.mp4 26.2 28.4 2 "$(pill p1 56 215)"
clip "$W/s3" raw.mp4 28.6 38.6 2.5 "$(pill p2 56 215)"
clip "$W/s4" raw.mp4 41.5 45.9 1.5 "$(pill p3 56 215)"
cta "$W/s5" 1.6 'あなたの今日の海は？' 'プロフィールのリンクから'
join_segs promo/tiktok/out/tiktok-02-procedure.mp4 s0 s1 s2 s3 s4 s5
echo done
