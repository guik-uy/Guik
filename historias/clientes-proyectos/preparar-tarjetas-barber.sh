#!/usr/bin/env bash
# Tarjetas tipo billete de $2.000 que Guille diseñó para FC Barber Shop (PDF de Canva, frente y dorso).
# Saca cada cara a imagen para las historias de Proyectos. Necesita pdftoppm (poppler) y ffmpeg.
# Uso: bash preparar-tarjetas-barber.sh
set -euo pipefail
cd "$(dirname "$0")/assets/fc-barber-tarjetas"
tmp=$(mktemp -d)
pdftoppm -r 600 -png horizontal-dorso-blanco.pdf "$tmp/hb"
pdftoppm -r 600 -png horizontal-dorso-negro.pdf  "$tmp/hn"
pdftoppm -r 900 -png vertical-dorso-blanco.pdf   "$tmp/vb"
pdftoppm -r 900 -png vertical-dorso-negro.pdf    "$tmp/vn"
# Horizontal: 2000×923 (el dorso del PDF mide 0,2 % más; se lleva a la misma proporción del frente)
ffmpeg -v error -y -i "$tmp/hb-1.png" -vf "scale=2000:923:flags=lanczos" -q:v 2 horizontal-frente.jpg
ffmpeg -v error -y -i "$tmp/hb-2.png" -vf "scale=2000:923:flags=lanczos" -q:v 2 horizontal-dorso-blanco.jpg
ffmpeg -v error -y -i "$tmp/hn-2.png" -vf "scale=2000:923:flags=lanczos" -q:v 2 horizontal-dorso-negro.jpg
# Vertical: 1000×1792
ffmpeg -v error -y -i "$tmp/vb-1.png" -vf "scale=1000:1792:flags=lanczos" -q:v 2 vertical-frente.jpg
ffmpeg -v error -y -i "$tmp/vb-2.png" -vf "scale=1000:1792:flags=lanczos" -q:v 2 vertical-dorso-blanco.jpg
ffmpeg -v error -y -i "$tmp/vn-2.png" -vf "scale=1000:1792:flags=lanczos" -q:v 2 vertical-dorso-negro.jpg
# Para el video: el dorso negro horizontal en alta (el primer plano del QR lo muestra a ~2,7×)
pdftoppm -r 900 -f 2 -l 2 -png horizontal-dorso-negro.pdf "$tmp/hq"
ffmpeg -v error -y -i "$tmp"/hq-*.png -vf "scale=4800:2214:flags=lanczos" -q:v 2 horizontal-dorso-negro-video.jpg
rm -rf "$tmp"
ls -la *.jpg
