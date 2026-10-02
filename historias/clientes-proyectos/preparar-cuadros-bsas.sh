#!/usr/bin/env bash
# Cuadros de la web de Bs.As. Top para el video (video-bsas.html), sacados de la grabación de pantalla de Guille
# (2026-10-02_18-34-10.mp4: una reserva completa). Recorta solo la página (sin pestañas ni barra de Windows)
# y guarda cada cuadro a 60 fps con su número absoluto: f{segundo×60}.jpg en .frames/bsas2/.
# Tramos: inicio → turno → cancha → datos (31,4–40,9 s), celular → confirmar → seña (43,1–49,5 s),
# turno confirmado → vuelve al inicio (67,5–72,8 s). Se saltean el autocompletado del navegador y Mercado Pago.
# El ritmo (qué tramo, a qué velocidad, fundidos) lo decide CLIPS en video-bsas.html.
# Uso: bash preparar-cuadros-bsas.sh ruta/a/la-grabacion.mp4
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .frames/bsas2 && rm -f .frames/bsas2/*.jpg
tramo() { # inicio(s) duración(s)
  local n; n=$(python3 -c "print(round($1*60))")
  ffmpeg -v error -y -ss "$1" -t "$2" -i "$3" -vf "crop=1500:911:210:109,scale=1512:918:flags=lanczos" -q:v 3 -start_number "$n" .frames/bsas2/f%05d.jpg
}
tramo 31.4 9.5 "$1"
tramo 43.1 6.4 "$1"
tramo 67.5 5.3 "$1"
echo "listo: $(ls .frames/bsas2 | wc -l) cuadros"
