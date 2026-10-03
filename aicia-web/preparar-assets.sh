#!/usr/bin/env bash
# Prepara las imágenes y el video de la web a partir de los originales de historias/.
# Recortes a WebP con transparencia (los chicos se agrandan con lanczos y un enfoque suave), logos de clientes
# a un tamaño web y el video de Bs.As. Top en una versión liviana para la página.
# Uso: bash preparar-assets.sh
set -euo pipefail
cd "$(dirname "$0")"
H=../historias
A=assets
webp() { # origen destino escala calidad
  ffmpeg -v error -y -i "$1" -vf "scale=iw*$3:-1:flags=lanczos+accurate_rnd,unsharp=3:3:0.4:3:3:0" \
    -c:v libwebp -pix_fmt yuva420p -quality "$4" -compression_level 6 "$2"
}
webp $H/destacada-aicia/assets/mano-robot-celular-sin-telefono.png $A/mano-celular.webp 2 88
webp $H/destacada-aicia/assets/iphone-mockup.png                    $A/iphone.webp       1.5 90
webp $H/destacada-aicia/assets/cabeza-documentos.webp               $A/cabeza-documentos.webp 1 84
webp $H/clientes-proyectos/assets/apreton-robot-humano.png          $A/apreton.webp      2 84
webp $H/destacada-aicia/assets/mano-robot-senalando.png             $A/mano-senalando.webp 1.5 86
for l in fc-barber bsas-top-blanco fusion-blanco alas-fit-blanco aerosport; do
  src=$H/clientes-proyectos/assets/logo-$l.png
  ffmpeg -v error -y -i "$src" -vf "scale='min(iw,520)':-1:flags=lanczos" -c:v libwebp -pix_fmt yuva420p -quality 92 "$A/logo-${l%-blanco}.webp"
done
# Video del proyecto: 720×1280, H.264, sin audio, liviano para la web
V=$H/clientes-proyectos/aicia-proyectos-02-bsas-top-web.mp4
ffmpeg -v error -y -i $V -an -vf "scale=720:1280:flags=lanczos" -c:v libx264 -preset slow -crf 25 -tune film \
  -profile:v high -pix_fmt yuv420p -movflags +faststart $A/bsas-reservas.mp4
ffmpeg -v error -y -ss 10 -i $V -frames:v 1 -vf "scale=720:1280:flags=lanczos" -c:v libwebp -quality 82 $A/bsas-reservas-poster.webp
ls -la $A
