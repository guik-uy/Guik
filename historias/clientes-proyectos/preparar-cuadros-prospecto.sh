#!/usr/bin/env bash
# Cuadros del video de prospección (video-prospecto.html), sacados de las grabaciones de Guille del 27/10/2026.
# Recorta solo la página (sin pestañas ni la barra de Windows) y guarda cada cuadro a 60 fps con su número absoluto:
# f{segundo×60}.jpg, como preparar-cuadros-aerosport.sh.
#   .frames/pw/   web de Pádel Club (1512×718): el inicio baja por la página y hace una reserva completa (4,3–56,6 s)
#   .frames/pwh/  el inicio de Pádel Club estirado hacia abajo (1512×945) para la pantalla más alta de la MacBook (1,6–4,5 s)
#   .frames/pp/   panel del club (1512×718, 1,1–9,5 s)
#   .frames/ch/   el chat con el asistente (grabación del iPhone, 750×1288, entera)
# Uso: bash preparar-cuadros-prospecto.sh web.mp4 panel.mp4 chat.mov [escala]   (escala 0.5 = borrador liviano)
set -euo pipefail
cd "$(dirname "$0")"
SC=${4:-1}
W=$(python3 -c "print(int(1512*$SC)//2*2)"); WC=$(python3 -c "print(int(750*$SC)//2*2)")
for d in pw pwh pp ch; do mkdir -p .frames/$d; rm -f .frames/$d/*.jpg; done
tramo() { # carpeta filtro inicio(s) duración(s) grabación
  local n; n=$(python3 -c "print(round($3*60))")
  ffmpeg -v error -y -ss "$3" -t "$4" -i "$5" -vf "fps=60,$2" -q:v 3 -start_number "$n" ".frames/$1/f%05d.jpg"
}
PAGE="crop=1920:912:0:108,scale=$W:-2:flags=lanczos"
HOME="split[a][b];[a]crop=1920:900:0:108[t];[b]crop=1920:2:0:1006,scale=1920:300,gblur=sigma=6:sigmaV=0[s];[t][s]vstack,scale=$W:-2:flags=lanczos"
tramo pw "$PAGE" 4.3 52.3 "$1"
tramo pwh "$HOME" 1.6 2.9 "$1"
tramo pp "$PAGE" 1.1 8.4 "$2"
tramo ch "scale=$WC:-2:flags=lanczos" 0 60.9 "$3"
echo "listo: $(ls .frames/pw | wc -l) web · $(ls .frames/pwh | wc -l) inicio · $(ls .frames/pp | wc -l) panel · $(ls .frames/ch | wc -l) chat"
