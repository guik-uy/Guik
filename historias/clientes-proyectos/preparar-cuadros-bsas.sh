#!/usr/bin/env bash
# Cuadros de la pantalla para la historia en video de Bs.As. Top (sale de la grabación de pantalla de Guille).
# Recorta solo la página (sin pestañas ni barra de Windows), la pasa a 0,6x (cámara lenta suave),
# congela 1,4 s el inicio y 0,8 s el final. Deja 424 cuadros JPG de 1512×918 en .frames/bsas/.
# Uso: bash preparar-cuadros-bsas.sh ruta/a/la-grabacion.mp4
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .frames/bsas && rm -f .frames/bsas/*.jpg
ffmpeg -v error -y -i "$1" -filter_complex "\
[0:v]trim=start=3.70:end=4.30,setpts=(PTS-STARTPTS)/0.6,crop=1500:911:210:109,scale=1512:918:flags=lanczos,tpad=stop_mode=clone:stop_duration=1.4[a];\
[0:v]trim=start=4.30:end=10.85,setpts=(PTS-STARTPTS)/0.6,crop=1500:911:210:109,scale=1512:918:flags=lanczos,tpad=stop_mode=clone:stop_duration=0.8[b];\
[a][b]concat=n=2:v=1:a=0,fps=30[v]" -map "[v]" -q:v 2 .frames/bsas/%04d.jpg
echo "listo: $(ls .frames/bsas | wc -l) cuadros"
