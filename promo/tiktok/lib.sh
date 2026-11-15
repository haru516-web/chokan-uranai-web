# 動画づくりの共通部品（build-a.sh / build-b.sh から読み込む）。
# フォントは Windows の游ゴシック Bold を作業フォルダにコピーして使う（同梱しない）。
FPS=30
ART=assets/art
init_work() {
  W=$(mktemp -d); mkdir -p promo/tiktok/out
  cp /c/Windows/Fonts/YuGothB.ttc "$W/f.ttc"; cp $ART/ritual-bg.webp $ART/app-icon.png "$W/"
}
txt() { printf '%s' "$2" > "$W/$1.txt"; }
# dt <textfile> <size> <color> <y> [extra]  中央寄せ・縁取り・影つきの文字
dt() { echo -n "drawtext=fontfile=f.ttc:textfile=$1.txt:fontsize=$2:fontcolor=$3:x=(w-text_w)/2:y=$4:borderw=7:bordercolor=black@0.55:shadowcolor=black@0.6:shadowy=8${5:+:$5}"; }
# pill <textfile> <size> <y> [extra]  黒い角丸っぽい帯つきの手順ラベル
pill() { echo -n "drawtext=fontfile=f.ttc:textfile=$1.txt:fontsize=$2:fontcolor=white:x=(w-text_w)/2:y=$3:box=1:boxcolor=black@0.62:boxborderw=26${4:+:$4}"; }
# clip <out> <src> <start> <end> <speed> <filters...>  録画を 1080x1920 に拡大して切り出し、倍速と文字を足す
clip() {
  local out=$1 src=$2 ss=$3 ee=$4 sp=$5; shift 5; local tf; tf=$(IFS=,; echo "$*")
  ( cd "$W" && ffmpeg -y -loglevel error -ss "$ss" -to "$ee" -i "$src" -vf "setpts=PTS/$sp,fps=$FPS,scale=1080:1920:flags=lanczos,format=yuv420p${tf:+,$tf}" -an -c:v libx264 -crf 17 -preset fast "$out.mp4" )
}
# freeze <out> <src> <time> <dur> <filters...>  1コマを止めて、ゆっくり寄る
freeze() {
  local out=$1 src=$2 at=$3 dur=$4; shift 4; local tf; tf=$(IFS=,; echo "$*")
  ( cd "$W" && ffmpeg -y -loglevel error -ss "$at" -i "$src" -frames:v 1 fz.png && ffmpeg -y -loglevel error -loop 1 -framerate $FPS -t "$dur" -i fz.png \
    -vf "scale=w='1080*(1+0.04*t/$dur)':h=-2:eval=frame:flags=lanczos,crop=1080:1920:x='(iw-1080)/2':y='(ih-1920)/2',format=yuv420p${tf:+,$tf}" -c:v libx264 -crf 17 -preset fast "$out.mp4" )
}
# cta <out> <dur> <line1> <line2> <line3>  アプリのアイコンと名前で締める
cta() {
  txt c0 '潮環占い'; txt c1 "$3"; txt c2 "$4"
  ( cd "$W" && ffmpeg -y -loglevel error -loop 1 -framerate $FPS -t "$2" -i ritual-bg.webp -loop 1 -framerate $FPS -t "$2" -i app-icon.png \
    -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=brightness=-0.12[bg];[1:v]scale=560:560,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(hypot(X-280,Y-280),278),255,0)'[ic];[bg][ic]overlay=(W-w)/2:300,format=yuv420p,$(dt c0 170 white 920),$(dt c1 76 0xeacc8c 1130),$(dt c2 60 white 1260)[v]" \
    -map "[v]" -r $FPS -c:v libx264 -crf 17 -preset fast "$1.mp4" )
}
# join <out> <seg...>  連結（無音）
join_segs() {
  local out=$1; shift; : > "$W/list.txt"; for s in "$@"; do echo "file '$s.mp4'" >> "$W/list.txt"; done
  local abs; abs="$(pwd)/$out"; ( cd "$W" && ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart "$abs" )
}
