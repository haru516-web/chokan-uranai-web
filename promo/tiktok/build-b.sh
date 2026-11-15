#!/usr/bin/env bash
# 動画B「気になるあの人との相性、見てみた」。相性タブの実画面録画（record-b.mjs）を15秒に編集する。
set -euo pipefail
cd "$(dirname "$0")/../.."
source promo/tiktok/lib.sh
init_work
cp "$(pwd)/promo/tiktok/out/raw-b.mp4" "$W/raw.mp4"
GOLD=0xeacc8c

# ① フック（2.4秒）：1コマ目から「88点・ぴったり」の結果が見える。問いは下半分に置く
txt h0 '生年月日と名前だけで'; txt h1 '気になるあの人との'; txt h2 '相性、見てみた'
freeze "$W/s0" raw.mp4 42.4 2.4 "drawbox=x=0:y=900:w=iw:h=520:color=black@0.6:t=fill" "$(dt h0 62 $GOLD 975)" "$(dt h1 104 white 1085)" "$(dt h2 128 $GOLD 1225)"
# ② 手順（実画面を倍速）
txt p1 '① 相手の生年月日と名前を入れる'; txt p2 '② 二人の海を重ねて読む'; txt p3 '③ 相性の点数が出る'
clip "$W/s1" raw.mp4 13.2 19.3 1.8 "$(pill p1 54 215)"
clip "$W/s2" raw.mp4 28.9 30.3 1.4 "$(pill p1 54 215)"
clip "$W/s3" raw.mp4 30.3 38.3 2.3 "$(pill p2 54 215)"
clip "$W/s4" raw.mp4 41.2 45.2 1.4 "$(pill p3 54 215)"
cta "$W/s5" 1.7 'あの人との海は？' 'プロフィールのリンクから'
join_segs promo/tiktok/out/tiktok-03-compat.mp4 s0 s1 s2 s3 s4 s5
echo done
