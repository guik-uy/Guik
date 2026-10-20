# Uso: PYTHONPATH=<carpeta con fonttools y brotli> python3 glyphs.py aicia-web/fonts/geist-latin-wght-normal.woff2 clientes/padel-club-logo/glyphs-geist-600.json
# Saca el contorno de cada letra de "Pádel Club" en Geist 600 (instancia de la fuente variable) como path SVG en unidades de la fuente
import sys, json, io
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
font_path, out = sys.argv[1], sys.argv[2]
f = TTFont(font_path)
inst = instancer.instantiateVariableFont(f, {"wght": 600}, inplace=False)
gs = inst.getGlyphSet(); cmap = inst.getBestCmap(); upm = inst['head'].unitsPerEm
os2 = inst['OS/2']
res = {"upm": upm, "cap": getattr(os2, 'sCapHeight', 0), "asc": inst['hhea'].ascent, "desc": inst['hhea'].descent, "glyphs": {}}
for ch in sorted(set("Pádel Club")):
    if ch == ' ': continue
    g = cmap[ord(ch)]
    pen = SVGPathPen(gs); gs[g].draw(pen)
    res["glyphs"][ch] = {"d": pen.getCommands(), "adv": gs[g].width}
json.dump(res, open(out, 'w'))
print('ok', upm, res['cap'], {k: v['adv'] for k, v in res['glyphs'].items()})
