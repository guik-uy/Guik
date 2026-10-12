#!/usr/bin/env bash
# Cuadros de la web de AeroSport para el video (video-aerosport.html), sacados de la grabación de pantalla de Guille
# (2026-10-12_19-50-16.mp4: la página se recarga y se hace una reserva completa). Recorta solo la página
# (sin pestañas, sin la barra de Windows y sin el aviso de enlaces de abajo a la izquierda) y guarda cada cuadro
# a 60 fps con su número absoluto: f{segundo×60}.jpg.
#   .frames/aero/       página entera (1512×699): recarga → inicio → día y horario → cancha → datos → pagar (6,3–27,4 s)
#                       y, a la vuelta de Mercado Pago, "Listo" → turno confirmado → vuelve al inicio (43,8–50,6 s).
#                       Se saltea Mercado Pago (aparecen los medios de pago de la cuenta).
#   .frames/aero-home/  el inicio para la MacBook (1512×866): la pantalla es más alta que la grabación, así que se corta
#                       arriba del botón flotante de WhatsApp y el fondo oscuro se estira hacia abajo.
# El ritmo (qué tramo, a qué velocidad, cortes) lo decide CLIPS en video-aerosport.html.
# Uso: bash preparar-cuadros-aerosport.sh ruta/a/la-grabacion.mp4
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .frames/aero .frames/aero-home && rm -f .frames/aero/*.jpg .frames/aero-home/*.jpg
tramo() { # carpeta filtro inicio(s) duración(s) grabación
  local n; n=$(python3 -c "print(round($3*60))")
  ffmpeg -v error -y -ss "$3" -t "$4" -i "$5" -vf "$2" -q:v 3 -start_number "$n" ".frames/$1/f%05d.jpg"
}
PAGE="crop=1920:888:0:108,scale=1512:699:flags=lanczos"
HOME="split[a][b];[a]crop=1920:826:0:108[t];[b]crop=1920:2:0:932,scale=1920:274[s];[t][s]vstack,scale=1512:866:flags=lanczos"
tramo aero "$PAGE" 6.3 21.1 "$1"
tramo aero "$PAGE" 43.8 6.8 "$1"
tramo aero-home "$HOME" 6.3 3.4 "$1"
echo "listo: $(ls .frames/aero | wc -l) + $(ls .frames/aero-home | wc -l) cuadros"
