#!/usr/bin/env bash
# Cuadros de la web demo de Pádel Club para video-demo-padel.html (grabación de Guille 2026-11-02_19-16-55.mp4).
# Recorta solo la página (sin pestañas ni la barra de Windows) y guarda cada cuadro a 60 fps con su número absoluto: f{segundo×60}.jpg
#   .frames/pd/       página (1512×718): inicio → día y horario → cancha → datos → seña → reserva confirmada (15,5–40 s)
#   .frames/pd-home/  el inicio estirado hacia abajo (1512×945) para las pantallas de las laptops, más altas que la grabación (2,8–4 s)
# Uso: bash preparar-cuadros-demo-padel.sh grabacion.mp4 [escala]   (escala 0.5 = borrador liviano)
set -euo pipefail
cd "$(dirname "$0")"
SC=${2:-1}; W=$(python3 -c "print(int(1512*$SC)//2*2)")
mkdir -p .frames/pd .frames/pd-home && rm -f .frames/pd/*.jpg .frames/pd-home/*.jpg
tramo() { local n; n=$(python3 -c "print(round($3*60))"); ffmpeg -v error -y -ss "$3" -t "$4" -i "$5" -vf "fps=60,$2" -q:v 3 -start_number "$n" ".frames/$1/f%05d.jpg"; }
tramo pd "crop=1920:912:0:108,scale=$W:-2:flags=lanczos" 15.5 24.5 "$1"
tramo pd-home "split[a][b];[a]crop=1920:900:0:108[t];[b]crop=1920:2:0:1006,scale=1920:300,gblur=sigma=6:sigmaV=0[s];[t][s]vstack,scale=$W:-2:flags=lanczos" 2.8 1.2 "$1"
echo "listo: $(ls .frames/pd | wc -l) página · $(ls .frames/pd-home | wc -l) inicio"
