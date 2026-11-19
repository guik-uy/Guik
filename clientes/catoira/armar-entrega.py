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
    '1-perfil/logo-simbolo-degrade.svg': c / 'logo' / 'simbolo-degrade.svg',
    '1-perfil/logo-simbolo-blanco.svg': c / 'logo' / 'simbolo-blanco.svg',
    '1-perfil/logo-simbolo-azul-petroleo.svg': c / 'logo' / 'simbolo-petroleo.svg',
    '3-whatsapp/portada-whatsapp-business.jpg': P / 'portadas' / 'portada-whatsapp-business.jpg',
    '4-facebook/portada-facebook.jpg': P / 'portadas' / 'portada-facebook.jpg',
    '4-facebook/portada-facebook-zonas-prueba.png': P / 'portadas' / 'portada-facebook-prueba.png',
    '5-campana/planilla-prospeccion-catoira.xlsx': c / 'kit' / 'planilla-prospeccion-catoira.xlsx',
    '5-campana/textos-para-copiar.txt': c / 'kit' / 'textos-para-copiar.md',
    '6-reel/reel-presentacion.mp4': c / 'reel' / 'reel-presentacion-catoira.mp4',
}
for f in sorted((P / 'destacadas').glob('*.png')): files[f'2-instagram/destacadas/{f.name}'] = f
for f in sorted((P / 'historias').glob('*.png')):
    files[f'2-instagram/historias/{"NO-PUBLICAR-plantilla/" if "plantilla" in f.name else ""}{f.name}'] = f
for f in sorted((P / 'publicaciones').glob('*.png')): files[f'2-instagram/publicaciones/{f.name}'] = f
for f in sorted((P / 'catalogo').glob('*.png')): files[f'3-whatsapp/catalogo/{f.name}'] = f
faltan = [str(v) for v in files.values() if not v.exists()]
if faltan: raise SystemExit('Faltan:\n  ' + '\n  '.join(faltan))
out = c / 'entrega' / 'kit-catoira.zip'; out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for k, v in files.items(): z.write(v, R + k)
print('ok', out, f'{out.stat().st_size / 1e6:.1f} MB', len(files), 'archivos')
