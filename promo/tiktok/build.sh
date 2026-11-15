#!/usr/bin/env bash
# TikTok訴求動画（15秒・1080x1920・30fps）を、アプリの実際の絵と文面だけで作る。
# 使うもの：ffmpeg と、Windows の游ゴシック（YuGothB.ttc）。フォントは同梱しない。
# 使い方：bash promo/tiktok/build.sh   → promo/tiktok/out/tiktok-01.mp4
#
# 描くのは、今のアプリにあるものだけ：
#  - 160の名札の今日の順位 → 凱風・順風・凪・荒波・轟沈の5段階（src/domain.ts, src/dayText.ts の TIER_RANGE）
#  - 轟沈の日の一言「船を港につなぐのが、今日の最善手です。」（src/dayText.ts そのまま）
#  - 入口の文言「生年月日と名前でひらく、あなただけの海」「今日のあなたの海は、凪か、荒波か。」（src/Opening.tsx）
set -euo pipefail
cd "$(dirname "$0")/../.."
ART=assets/art
OUT=promo/tiktok/out
W=$(mktemp -d)
mkdir -p "$OUT"
cp /c/Windows/Fonts/YuGothB.ttc "$W/f.ttc"
cp $ART/*.webp "$W/" 2>/dev/null || true
cp $ART/app-icon.png "$W/"
FPS=30
SIZE=1080x1920

# 上と下を暗くして、文字を読ませるための板。
ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=${SIZE}:d=1,format=rgba,geq=r=0:g=0:b=0:a='255*min(1,0.22+0.55*pow(max(0,1-Y/650),1.5)+0.7*pow(max(0,(Y-850)/1070),1.1))'" -frames:v 1 "$W/grad.png"

# txt <name> <text> : 文字ファイルを作る（UTF-8）
txt() { printf '%s' "$2" > "$W/$1.txt"; }

# dt <textfile> <size> <color> <y> [extra] : 中央寄せの文字
dt() { echo -n "drawtext=fontfile=f.ttc:textfile=$1.txt:fontsize=$2:fontcolor=$3:x=(w-text_w)/2:y=$4:borderw=7:bordercolor=black@0.55:shadowcolor=black@0.6:shadowx=0:shadowy=8${5:+:$5}"; }

# seg <out> <img> <dur> <focusX 0-1> <zoomEnd> <textfilters...>
seg() {
  local out=$1 img=$2 dur=$3 fx=$4 ze=$5; shift 5
  local tf; tf=$(IFS=,; echo "$*")
  ( cd "$W" && ffmpeg -y -loglevel error -loop 1 -framerate $FPS -t "$dur" -i "$img" -loop 1 -framerate $FPS -t "$dur" -i grad.png \
    -filter_complex "[0:v]scale=w='2560*(1+($ze-1)*t/$dur)':h=-2:eval=frame:flags=bicubic,crop=1080:1920:x='min(max($fx*iw-540,0),iw-1080)':y='(ih-1920)/2',setsar=1,format=rgba[bg];[bg][1:v]overlay,format=yuv420p,${tf}[v]" \
    -map "[v]" -r $FPS -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p "$out.mp4" )
}

GOLD='0xeacc8c'; WHITE='white'
TC=('0xefd393' '0xb6dfc4' '0xc1d2ef' '0xe3af92' '0xe0a5b3')   # tierColors（src/domain.ts）

# ① フック（0〜3.0秒）。1フレーム目から、絵と文字が全部そろっている。
txt h0 '生年月日と名前で占う'
txt h1 '今日のあなたの海は'
txt h2 '凪か、荒波か。'
seg "$W/s1" tier-04.webp 3.0 0.69 1.07 \
  "$(dt h0 68 $GOLD 300)" "$(dt h1 104 $WHITE 430)" "$(dt h2 132 $GOLD 590)"

# ② 何をするか（1.6秒）
txt i0 '160の名札のなかの'
txt i1 '今日の順位が出る'
seg "$W/s2" tier-03.webp 1.6 0.55 1.05 \
  "$(dt i0 72 $GOLD 560)" "$(dt i1 112 $WHITE 680)"

# ③ 5段階のうち、凱風・順風・凪・荒波（各1.1秒）
names=('凱風' '順風' '凪' '荒波' '轟沈')
ranks=('1〜16位' '17〜56位' '57〜104位' '105〜144位' '145〜160位')
fxs=(0.5 0.62 0.5 0.69 0.5)
for i in 0 1 2 3; do
  txt "n$i" "${names[$i]}"; txt "r$i" "160位中 ${ranks[$i]}"
  seg "$W/t$i" "tier-0$((i+1)).webp" 1.1 "${fxs[$i]}" 1.06 \
    "$(dt r$i 72 ${TC[$i]} 600)" "$(dt n$i 300 ${TC[$i]} 720)"
done

# ④ 轟沈。文字が先に出て、後から今日の一言が重なる（3.8秒）
txt n4 '轟沈'; txt r4 '160位中 145〜160位'
txt v0 '船を港につなぐのが、'; txt v1 '今日の最善手です。'
seg "$W/s4" tier-05.webp 3.8 0.55 1.08 \
  "$(dt r4 72 ${TC[4]} 520)" "$(dt n4 300 ${TC[4]} 640)" \
  "$(dt v0 76 $WHITE 1060 "enable='gte(t,1.3)'")" "$(dt v1 88 $WHITE 1170 "enable='gte(t,1.3)'")"

# ⑤ 入口（2.2秒）：アプリのアイコンと名前
txt c0 '潮環占い'; txt c1 'あなたの今日の海は？'; txt c2 'プロフィールのリンクから'
( cd "$W" && ffmpeg -y -loglevel error -loop 1 -framerate $FPS -t 2.2 -i ritual-bg.webp -loop 1 -framerate $FPS -t 2.2 -i app-icon.png \
  -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=brightness=-0.12[bg];[1:v]scale=560:560,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(hypot(X-280,Y-280),278),255,0)'[ic];[bg][ic]overlay=(W-w)/2:300,format=yuv420p,$(dt c0 170 $WHITE 920),$(dt c1 76 $GOLD 1130),$(dt c2 60 $WHITE 1260)[v]" \
  -map "[v]" -r $FPS -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p s5.mp4 )

# 連結（無音。音源はTikTok側のライブラリで当てる前提）
( cd "$W" && printf "file 's1.mp4'\nfile 's2.mp4'\nfile 't0.mp4'\nfile 't1.mp4'\nfile 't2.mp4'\nfile 't3.mp4'\nfile 's4.mp4'\nfile 's5.mp4'\n" > list.txt \
  && ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart "$OLDPWD/$OUT/tiktok-01.mp4" )
echo "done: $OUT/tiktok-01.mp4"
