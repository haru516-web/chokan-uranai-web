#!/usr/bin/env bash
# 4本セット（中身も構成も別）。素材は record-set.mjs で撮った実画面の録画だけ。
#   05 タロット「今日の一枚」  … 自分で引いている目線（POV）
#   06 図鑑「あなたはどのタイプ？」… 問い → 16キャラ → 入力 → 儀式 → 答え
#   07 相性ランキング         … 実際のランキング画面を伏せて、5位→1位の順にめくる
#   08 人生の潮回り           … オープニングから始まる、物語仕立て
# 文字は、アプリの画面に出ている言葉だけを使う（フックの問いも画面の言葉から）。
# 使い方： RAWDIR=<raw-*.mp4 のある場所> bash promo/tiktok/build-set.sh [05 06 07 08]
set -euo pipefail
cd "$(dirname "$0")/../.."
source promo/tiktok/lib.sh
init_work
RAWDIR=${RAWDIR:-$(node -e "console.log(require('os').tmpdir().replace(/\\\\/g,'/') + '/tiktok-frames')")}
GOLD=0xeacc8c
OUT=promo/tiktok/out
want() { [ $# -eq 0 ] || [[ " $ALL " == *" $1 "* ]]; }
ALL="${*:-05 06 07 08}"
plate() { echo -n "drawbox=x=0:y=$1:w=iw:h=$2:color=0x0b1124@0.88:t=fill"; }

if want 05; then
  R="$RAWDIR/raw-tarot.mp4"
  txt h0 '潮環の神様から、今日のカード'; txt h1 'いま気になる'; txt h2 '一枚は？'
  clip "$W/a0" "$R" 0.2 2.0 1 "$(plate 210 470)" "$(dt h0 54 $GOLD 260)" "$(dt h1 120 white 350)" "$(dt h2 150 $GOLD 500)"
  clip "$W/a1" "$R" 2.0 5.2 1
  clip "$W/a2" "$R" 5.2 8.4 1.15
  clip "$W/a3" "$R" 9.0 21.0 3.5
  clip "$W/a4" "$R" 24.0 32.0 4
  cta "$W/a5" 1.6 '1日1回・入力や登録は不要' 'プロフィールのリンクから'
  join_segs $OUT/tiktok-05-tarot.mp4 a0 a1 a2 a3 a4 a5
fi

if want 06; then
  R="$RAWDIR/raw-type.mp4"
  txt h0 '16タイプ'; txt h1 'あなたは'; txt h2 'どのタイプ？'; txt p1 '入力は2つだけ'
  clip "$W/b0" "$R" 0.5 2.7 1 "$(plate 210 470)" "$(dt h0 60 $GOLD 260)" "$(dt h1 120 white 350)" "$(dt h2 150 $GOLD 500)"
  clip "$W/b1" "$R" 2.7 24.0 7.1
  clip "$W/b2" "$R" 38.0 50.0 5.5 "$(pill p1 56 215)"
  clip "$W/b3" "$R" 53.0 65.0 4.8
  clip "$W/b4" "$R" 88.6 95.8 2
  cta "$W/b5" 1.5 'あなたはどのタイプ？' 'プロフィールのリンクから'
  join_segs $OUT/tiktok-06-type.mp4 b0 b1 b2 b3 b4 b5
fi

if want 07; then
  R="$RAWDIR/raw-rank.mp4"
  # 40秒の時点のランキング画面（1〜5位が見えている）を止めて、行を伏せたりめくったりする。
  # 行の位置は録画（780x1386）で1位の中心 y=468、行の間隔125。1080幅に拡大するので1.3846倍。
  ( cd "$W" && ffmpeg -y -loglevel error -ss 40 -i "$R" -frames:v 1 -vf "scale=1080:1920:flags=lanczos" rk.png )
  txt q '？'; txt q1 '1位は…？'
  # mask <伏せる最下位> : 1位〜その順位までの行を伏せる。hl <順位> : その行を金の枠で囲む
  row_y() { echo $(( (410 + ($1 - 1) * 125) * 13846 / 10000 )); }
  masks() { local f="" r y; for r in $(seq 1 "$1"); do y=$(row_y $r); f="$f,drawbox=x=140:y=$((y+6)):w=880:h=152:color=0x141d36:t=fill"
      if [ "$r" = 1 ]; then f="$f,$(dt q1 72 $GOLD $((y+40)) 'x=580-text_w/2')"; else f="$f,$(dt q 80 white $((y+34)) 'x=580-text_w/2')"; fi; done; echo -n "${f#,}"; }
  hl() { local y; y=$(row_y $1); echo -n "drawbox=x=62:y=$((y-4)):w=960:h=172:color=$GOLD:t=7"; }
  still() { # out dur filters
    local out=$1 dur=$2; shift 2; local tf; tf=$(IFS=,; echo "$*")
    ( cd "$W" && ffmpeg -y -loglevel error -loop 1 -framerate $FPS -t "$dur" -i rk.png -vf "format=yuv420p${tf:+,$tf}" -c:v libx264 -crf 17 -preset fast "$out.mp4" ); }
  still "$W/c0" 2.0 "$(masks 5)"
  clip "$W/c1" "$R" 10.8 21.6 4.3
  clip "$W/c2" "$R" 22.8 25.6 1.4
  still "$W/c5" 1.3 "$(masks 4)" "$(hl 5)"
  still "$W/c4" 1.3 "$(masks 3)" "$(hl 4)"
  still "$W/c3" 1.3 "$(masks 2)" "$(hl 3)"
  still "$W/c2b" 1.3 "$(masks 1)" "$(hl 2)"
  still "$W/c1b" 1.3 "$(hl 1)"
  cta "$W/c9" 2.0 'あなたと相性がいいのは？' 'プロフィールのリンクから'
  join_segs $OUT/tiktok-07-rank.mp4 c0 c1 c2 c5 c4 c3 c2b c1b c9
fi

if want 08; then
  R="$RAWDIR/raw-life.mp4"; O="$RAWDIR/raw-opening.mp4"
  txt h0 '6年前から6年後まで'; txt h1 'あなたの'; txt h2 '人生の潮回り'
  txt p1 '今年は「順風」の年'; txt p2 '次の追い風　2027年'; txt p3 'これから1年で気をつけたい月'
  freeze "$W/d0" "$R" 92 2.2 "$(plate 200 470)" "$(dt h0 58 $GOLD 250)" "$(dt h1 110 white 340)" "$(dt h2 140 $GOLD 480)"
  clip "$W/d1" "$O" 1.3 5.4 1.5
  clip "$W/d2" "$R" 78.0 90.0 4.5
  clip "$W/d3" "$R" 108.0 113.0 2.5 "$(pill p1 56 215)"
  clip "$W/d4" "$R" 116.0 121.0 2.5 "$(pill p2 56 215)"
  clip "$W/d5" "$R" 124.5 129.5 2.5 "$(pill p3 52 215)"
  cta "$W/d6" 1.4 'あなたの追い風の年は？' 'プロフィールのリンクから'
  join_segs $OUT/tiktok-08-life.mp4 d0 d1 d2 d3 d4 d5 d6
fi
echo done
