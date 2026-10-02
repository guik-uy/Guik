#!/usr/bin/env bash
# Cuadros de la web de Bs.As. Top para el video (video-bsas.html), sacados de la grabación de pantalla de Guille
# (2026-10-02_20-10-58.mp4: la página se recarga y se hace una reserva completa). Recorta solo la página
# (sin pestañas ni barra de Windows) y guarda cada cuadro a 60 fps con su número absoluto: f{segundo×60}.jpg en .frames/bsas3/.
# Tramos: recarga → inicio → turno → cancha → datos → seña (2,2–22,1 s) y turno confirmado → vuelve al inicio (35,6–39,7 s).
# Se saltea la página de Mercado Pago. El ritmo (qué tramo, a qué velocidad, cortes) lo decide CLIPS en video-bsas.html.
# Uso: bash preparar-cuadros-bsas.sh ruta/a/la-grabacion.mp4
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .frames/bsas3 && rm -f .frames/bsas3/*.jpg
tramo() { # inicio(s) duración(s) grabación
  local n; n=$(python3 -c "print(round($1*60))")
  ffmpeg -v error -y -ss "$1" -t "$2" -i "$3" -vf "crop=1500:911:210:109,scale=1512:918:flags=lanczos" -q:v 3 -start_number "$n" .frames/bsas3/f%05d.jpg
}
tramo 2.2 19.9 "$1"
tramo 35.6 4.1 "$1"
echo "listo: $(ls .frames/bsas3 | wc -l) cuadros"
