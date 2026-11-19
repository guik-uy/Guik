# Símbolo final, dibujado a mano en vector (coordenadas 0–1000) sobre las medidas de logo/simbolo-trazado.json
# (el trazado del JPG): rectas paralelas, chimenea recta y la flecha en S con curvas Bézier continuas.
# Sale simbolo-limpio.json y los SVG (degradé, blanco, azul petróleo). Uso: python3 -I clientes/catoira/logo/limpiar-simbolo.py
import json
from pathlib import Path
here = Path(__file__).resolve().parent
P = [
  # pata derecha (forma de U)
  'M648.6,660.1L747.7,860.8L971.1,860.8L801.4,531.2L749.5,586.7L848,784.5L792.7,784.5L707.8,619.3Z',
  # A interior (verde)
  'M516.1,244L351.8,568.3L433,562.4L514.7,408.7L572.5,508.7L629.8,469.3Z',
  # franja de arriba a la derecha
  'M562.8,221.1L669.7,424.8L714.7,366.1C711,349 704,334 689,318.5Z',
  # franja de la izquierda
  'M470.2,216.5L332.6,325.2L180.3,627.5L289.4,575.7Z',
  # flecha en S
  'M961.5,161.5L771.1,234.9L817,282L745,382C680,472 580,580 441.7,594.5C370,602 260,622 190.4,662.8'
  'C148.6,687.3 100,760 60.6,860.8L284.4,860.8L350.9,731.7C315,733 270,752 237.6,786.7L197.7,786.2'
  'C210,762 262,718 320.2,701.4C380,688 480,684 541.7,670.2C603.4,656.4 740,540 801.8,470.2'
  'C840,427 870,375 895,333.5L952.3,368.8Z',
  # techo + chimenea
  'M772.5,283.9L709,229.5L745.6,207.5L514.7,28.9L305,192.7L305,114.5L218,114.5L218,260.7L61.5,382L200.5,382L513.8,140.8L750,317Z',
]
d = ' '.join(P)
(here / 'simbolo-limpio.json').write_text(json.dumps({'w': 1000, 'h': 890, 'd': d}))
G = '<defs><linearGradient id="g" x1="0.08" y1="0.95" x2="0.92" y2="0.08"><stop offset="0" stop-color="#1B4E86"/><stop offset=".45" stop-color="#17677F"/><stop offset="1" stop-color="#2BB3A3"/></linearGradient></defs>'
for name, fill, defs in [('simbolo-degrade', 'url(#g)', G), ('simbolo-blanco', '#FFFFFF', ''), ('simbolo-petroleo', '#0A2C4E', '')]:
    (here / (name + '.svg')).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 -10 992 910">{defs}<path fill="{fill}" d="{d}"/></svg>\n')
print('ok')
