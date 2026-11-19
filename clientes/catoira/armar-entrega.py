# Arma el zip para Workana con todo el kit, ordenado en carpetas numeradas.
# Uso: python3 clientes/catoira/armar-entrega.py  → clientes/catoira/entrega/kit-catoira.zip
import zipfile
from pathlib import Path

c = Path(__file__).resolve().parent
P = c / 'piezas'
R = 'Kit A. Servicios Integrales Catoira/'
# Nombres legibles para Fernando (con mayúscula, tildes y espacios), los mismos que cita el PDF
files = {
    '0. Empezá acá - Guía y kit.pdf': c / 'kit' / 'kit-presencia-digital-catoira.pdf',
    '1. Perfil/Foto de perfil.png': P / 'perfil' / 'catoira-foto-perfil.png',
    '1. Perfil/Foto de perfil (fondo claro).png': P / 'perfil' / 'catoira-foto-perfil-fondo-claro.png',
    '1. Perfil/Logo degradé.png': c / 'logo' / 'png' / 'simbolo-degrade.png',
    '1. Perfil/Logo blanco.png': c / 'logo' / 'png' / 'simbolo-blanco.png',
    '1. Perfil/Logo azul petróleo.png': c / 'logo' / 'png' / 'simbolo-petroleo.png',
    '3. WhatsApp/Portada de WhatsApp Business.png': P / 'portadas' / 'portada-whatsapp-business.png',
    '4. Facebook/Portada de Facebook.png': P / 'portadas' / 'portada-facebook.png',
    'Textos para copiar.txt': c / 'kit' / 'textos-para-copiar.txt',
    '5. Reel/Reel de presentación.mp4': c / 'reel' / 'reel-presentacion-catoira.mp4',
}
H = 'historias'
NOMBRES = {
    'destacadas/portada-1-servicios': 'Destacadas/Portada 1 - Servicios',
    'destacadas/portada-2-trabajos': 'Destacadas/Portada 2 - Trabajos',
    'destacadas/portada-3-como-trabajamos': 'Destacadas/Portada 3 - Cómo trabajamos',
    'destacadas/portada-4-contacto': 'Destacadas/Portada 4 - Contacto',
    # Historias: una carpeta por destacada. La plantilla de antes y después no va (la completa Guille con fotos reales)
    'historias/servicios-1-portada': 'Historias/1. Servicios/Servicios 1 - Portada',
    'historias/servicios-2-sanitaria': 'Historias/1. Servicios/Servicios 2 - Sanitaria',
    'historias/servicios-3-construccion-reformas': 'Historias/1. Servicios/Servicios 3 - Construcción y reformas',
    'historias/servicios-4-visita-diagnostica': 'Historias/1. Servicios/Servicios 4 - Visita diagnóstica',
    'historias/servicios-5-administradoras': 'Historias/1. Servicios/Servicios 5 - Administradoras',
    'historias/trabajos-1-portada': 'Historias/2. Trabajos/Trabajos 1 - Portada',
    'historias/como-trabajamos-1-resumen': 'Historias/3. Cómo trabajamos/Cómo trabajamos 1 - Resumen',
    'historias/como-trabajamos-2-contanos': 'Historias/3. Cómo trabajamos/Cómo trabajamos 2 - Contanos',
    'historias/como-trabajamos-3-diagnostico': 'Historias/3. Cómo trabajamos/Cómo trabajamos 3 - Diagnóstico',
    'historias/como-trabajamos-4-propuesta': 'Historias/3. Cómo trabajamos/Cómo trabajamos 4 - Propuesta',
    'historias/contacto-1': 'Historias/4. Contacto/Contacto 1',
    'publicaciones/publicacion-1-no-ponemos-parches': 'Publicaciones/Publicación 1 - No ponemos parches',
    'publicaciones/publicacion-2-servicios': 'Publicaciones/Publicación 2 - Servicios',
    'publicaciones/publicacion-3-humedad-visita-diagnostica': 'Publicaciones/Publicación 3 - Humedad y visita diagnóstica',
}
for k, v in NOMBRES.items(): files[f'2. Instagram/{v}.png'] = P / f'{k}.png'
# Catálogo: mismo nombre que el servicio en el texto del catálogo
import json, subprocess
CAT = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require(process.argv[1]).wa.catalogo.map(x=>x[0])))", str(c / 'kit' / 'textos.js')]))
cat = sorted((P / 'catalogo').glob('*.png'))
assert len(cat) == len(CAT)
for i, (f, n) in enumerate(zip(cat, CAT), 1): files[f'3. WhatsApp/Catálogo/{i:02d} - {n}.png'] = f
assert all(k.endswith(('.png', '.pdf', '.txt', '.mp4')) for k in files), 'todas las imágenes en PNG'
faltan = [str(v) for v in files.values() if not v.exists()]
if faltan: raise SystemExit('Faltan:\n  ' + '\n  '.join(faltan))
out = c / 'entrega' / 'kit-catoira.zip'; out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for k, v in sorted(files.items()): z.write(v, R + k)
print('ok', out, f'{out.stat().st_size / 1e6:.1f} MB', len(files), 'archivos')
# Versión sin el video (el chat no acepta archivos de más de ~30 MB): el reel va aparte
out2 = c / 'entrega' / 'kit-catoira-sin-video.zip'
with zipfile.ZipFile(out2, 'w', zipfile.ZIP_DEFLATED) as z:
    for k, v in sorted(files.items()):
        if not k.startswith('5. Reel'): z.write(v, R + k)
print('ok', out2, f'{out2.stat().st_size / 1e6:.1f} MB')
