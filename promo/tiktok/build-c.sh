#!/usr/bin/env bash
# 動画C「夏の沖合タイプと相性がいいタイプ TOP5」（5位→1位）。
# データは実アプリの相性タブ「全タイプとの相性」から rank-data.mjs で読み取った値（out/rank.json）。
# キャラ絵は図鑑（assets/art/resident-XX.webp）、タイプ名・一言は src/residents.json の原文。
set -euo pipefail
cd "$(dirname "$0")/../.."
source promo/tiktok/lib.sh
init_work
for n in 02 03 04 01 06 07; do cp $ART/resident-$n.webp "$W/"; done
GOLD=0xeacc8c

# 金色のぼかし円（キャラの後ろの光）と、「？」の枠
ffmpeg -y -loglevel error -f lavfi -i "color=c=0xeacc8c:s=900x900:d=1,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*0.6*pow(max(0,1-hypot(X-450,Y-450)/450),1.6)'" -frames:v 1 "$W/glow.png"
ffmpeg -y -loglevel error -f lavfi -i "color=c=0x141c33:s=170x170:d=1,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(hypot(X-85,Y-85),83),235,0)'" -frames:v 1 "$W/slot.png"
ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=1080x1920:d=1,format=rgba,geq=r=0:g=0:b=0:a='min(255,70+150*pow(max(0,1-Y/700),1.4)+190*pow(max(0,(Y-1000)/920),1.2))'" -frames:v 1 "$W/shade.png"

# 下の「5位 4位 3位 2位 1位」の進行表示。revealed 以下は金、残りは薄く
progress() { # $1=いま表示している順位（5..1）、"0"なら全部薄い
  local f="" i r col
  for i in 0 1 2 3 4; do r=$((5-i)); if [ "$1" -gt 0 ] && [ "$r" -ge "$1" ]; then col="$GOLD"; else col="white@0.35"; fi
    txt "pg$r" "${r}位"
    f="$f,drawtext=fontfile=f.ttc:textfile=pg$r.txt:fontsize=54:fontcolor=$col:x=$((150+i*195))-text_w/2:y=1445:borderw=5:bordercolor=black@0.5"
  done; echo -n "${f#,}"
}

# 順位の画面（1コマ目から全部そろっている。キャラだけ頭の0.3秒で少し膨らむ）
rank_seg() { # out dur rank band sub score level img [note]
  local out=$1 dur=$2 r=$3 band=$4 sub=$5 score=$6 level=$7 img=$8 note=${9:-}
  txt "k$r" "${r}位"; txt "b$r" "$band"; txt "s$r" "$sub"; txt "sc$r" "相性 ${score}点　${level}"; txt top '夏の沖合タイプと相性がいいタイプ'
  local extra=""; [ -n "$note" ] && { txt "n$r" "$note"; extra=",$(dt n$r 50 white 1375)"; }
  ( cd "$W" && ffmpeg -y -loglevel error -loop 1 -framerate $FPS -t "$dur" -i ritual-bg.webp -loop 1 -framerate $FPS -t "$dur" -i shade.png -loop 1 -framerate $FPS -t "$dur" -i glow.png -loop 1 -framerate $FPS -t "$dur" -i "resident-$img.webp" \
    -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];[bg][1:v]overlay[b1];[2:v]scale=900:900[g];[b1][g]overlay=(W-w)/2:520[b2];[3:v]scale=w='600+80*min(t/0.3\,1)':h=-2:eval=frame,format=rgba[c];[b2][c]overlay=x='(W-w)/2':y='900-h/2-30':eval=frame,format=yuv420p,$(pill top 44 190),$(dt k$r 250 $GOLD 270),$(dt b$r 112 white 1095),$(dt s$r 60 0xdfe6f5 1235),$(dt sc$r 60 $GOLD 1300),$(progress $r)$extra[v]" \
    -map "[v]" -r $FPS -c:v libx264 -crf 17 -preset fast "$out.mp4" )
}

# ① フック（2.5秒）：自分のキャラと、まだ伏せた5つの枠。結果が気になって止まる
txt h0 '生年月日と名前でわかる'; txt h1 '夏の沖合タイプと'; txt h2 '相性がいいのは？'; txt h3 '相性ランキング TOP5'
txt q '？'
( cd "$W" && ffmpeg -y -loglevel error -loop 1 -framerate $FPS -t 2.5 -i ritual-bg.webp -loop 1 -framerate $FPS -t 2.5 -i shade.png -loop 1 -framerate $FPS -t 2.5 -i glow.png -loop 1 -framerate $FPS -t 2.5 -i resident-07.webp -loop 1 -framerate $FPS -t 2.5 -i slot.png \
  -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];[bg][1:v]overlay[b1];[2:v]scale=900:900[g];[b1][g]overlay=(W-w)/2:430[b2];[3:v]scale=560:-2[c];[b2][c]overlay=(W-w)/2:560[b3];[4:v]split=5[s1][s2][s3][s4][s5];[b3][s1]overlay=110:1130[o1];[o1][s2]overlay=295:1130[o2];[o2][s3]overlay=480:1130[o3];[o3][s4]overlay=665:1130[o4];[o4][s5]overlay=850:1130,format=yuv420p,$(pill h3 48 190),$(dt h1 112 white 280),$(dt h2 116 $GOLD 420),$(dt q 100 white 1150 "x=195-text_w/2"),$(dt q 100 white 1150 "x=380-text_w/2"),$(dt q 100 white 1150 "x=565-text_w/2"),$(dt q 100 white 1150 "x=750-text_w/2"),$(dt q 100 white 1150 "x=935-text_w/2"),$(progress 0)[v]" \
  -map "[v]" -r $FPS -c:v libx264 -crf 17 -preset fast s0.mp4 )

# ② 5位 → 1位（実アプリのランキングそのまま。1位と2位はどちらも88点）
rank_seg "$W/r5" 2.0 5 '夏の沿岸' '港に火を灯す人' 77 'とても良い' 06
rank_seg "$W/r4" 2.0 4 '春の浅瀬' '火花の発見者' 86 'ぴったり' 01
rank_seg "$W/r3" 2.0 3 '春の沖合' '航路を描く人' 87 'ぴったり' 03
rank_seg "$W/r2" 2.0 2 '春の深海' '眠る発明家' 88 'ぴったり' 04
rank_seg "$W/r1" 3.0 1 '春の沿岸' '芽を育てる人' 88 'ぴったり' 02 '春が夏を育てる「相生」の相性'

# ③ 締め（1.5秒）
cta "$W/z" 1.5 'あなたのタイプは？' 'プロフィールのリンクから'
join_segs promo/tiktok/out/tiktok-04-ranking.mp4 s0 r5 r4 r3 r2 r1 z
echo done
