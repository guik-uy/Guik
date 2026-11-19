# Arma el zip para Workana con todo el kit, ordenado en carpetas numeradas.
# Uso: python3 clientes/catoira/armar-entrega.py  → clientes/catoira/entrega/kit-catoira.zip
import zipfile
from pathlib import Path

c = Path(__file__).resolve().parent
P = c / 'piezas'
R = 'Kit A. Servicios Integrales Catoira/'
files = {
    '0-EMPEZA-ACA-guia-y-kit.pdf': c / 'kit' / 'kit-presencia-digital-catoira.pdf',
    '1-perfil/foto-de-perfil.png': P / 'perfil' / 'catoira-foto-perfil.png',
    '1-perfil/foto-de-perfil-fondo-claro.png': P / 'perfil' / 'catoira-foto-perfil-fondo-claro.png',
    '1-perfil/simbolo-degrade.png': c / 'logo' / 'png' / 'simbolo-degrade.png',
    '1-perfil/simbolo-blanco.png': c / 'logo' / 'png' / 'simbolo-blanco.png',
    '1-perfil/simbolo-azul-petroleo.png': c / 'logo' / 'png' / 'simbolo-petroleo.png',
    '3-whatsapp/portada-whatsapp-business.png': P / 'portadas' / 'portada-whatsapp-business.png',
    '4-facebook/portada-facebook.png': P / 'portadas' / 'portada-facebook.png',
    'textos-para-copiar.txt': c / 'kit' / 'textos-para-copiar.txt',
    '5-reel/reel-presentacion.mp4': c / 'reel' / 'reel-presentacion-catoira.mp4',
}
for f in sorted((P / 'destacadas').glob('*.png')): files[f'2-instagram/destacadas/{f.name}'] = f
# Historias: una carpeta por destacada. La plantilla de antes y después no va (la completa Guille con fotos reales)
SUB = {'servicios': '1-servicios', 'trabajos': '2-trabajos', 'como-trabajamos': '3-como-trabajamos', 'contacto': '4-contacto'}
for f in sorted((P / 'historias').glob('*.png')):
    if 'plantilla' in f.name: continue
    k = next(k for k in SUB if f.name.startswith(k))
    files[f'2-instagram/historias/{SUB[k]}/{f.name}'] = f
for f in sorted((P / 'publicaciones').glob('*.png')): files[f'2-instagram/publicaciones/{f.name}'] = f
for f in sorted((P / 'catalogo').glob('*.png')): files[f'3-whatsapp/catalogo/{f.name}'] = f
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
        if not k.startswith('5-reel'): z.write(v, R + k)
print('ok', out2, f'{out2.stat().st_size / 1e6:.1f} MB')
