# Copias livianas (JPG, máx. 900 px de ancho) de las piezas, solo para el PDF. Uso: python3 clientes/catoira/kit/achicar-imagenes.py
from pathlib import Path
from PIL import Image
here = Path(__file__).resolve().parent; base = here.parent; out = here / 'img'; out.mkdir(exist_ok=True)
n = 0
for f in list((base / 'piezas').rglob('*.png')) + list((base / 'piezas').rglob('*.jpg')):
    rel = f.relative_to(base).with_suffix('').as_posix().replace('/', '__')
    im = Image.open(f).convert('RGB'); w = min(900, im.width); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(out / (rel + '.jpg'), quality=86, optimize=True); n += 1
print('ok', n)
