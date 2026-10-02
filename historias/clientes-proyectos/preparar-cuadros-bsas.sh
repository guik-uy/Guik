#!/usr/bin/env bash
# Cuadros de la web de Bs.As. Top para el video (video-bsas.html), sacados de la grabación de pantalla de Guille.
# Recorta solo la página (sin pestañas ni barra de Windows) y deja la grabación a 60 cuadros por segundo,
# desde que carga la página (3,70 s) hasta "Entrená con nosotros" (10,85 s): 432 JPG de 1512×918 en .frames/bsas60/.
# El ritmo (pausas y cámara lenta) lo decide recAbs(t) en video-bsas.html.
# Uso: bash preparar-cuadros-bsas.sh ruta/a/la-grabacion.mp4
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .frames/bsas60 && rm -f .frames/bsas60/*.jpg
ffmpeg -v error -y -ss 3.70 -t 7.20 -i "$1" -vf "crop=1500:911:210:109,scale=1512:918:flags=lanczos" -q:v 2 .frames/bsas60/%04d.jpg
echo "listo: $(ls .frames/bsas60 | wc -l) cuadros"
