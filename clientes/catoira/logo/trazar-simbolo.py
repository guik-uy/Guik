# Redibuja el símbolo del logo (casa + A + flecha) en vector a partir de la única versión que hay (JPG chico, generado con IA).
# 1) recorta el símbolo, lo agranda x4 y lo binariza; 2) saca los contornos; 3) los simplifica (rectas largas = una sola recta)
# y separa esquinas de curvas: las esquinas quedan filosas y los tramos curvos pasan a Bézier suaves (Catmull-Rom).
# Sale logo/simbolo-trazado.json (los trazados en coordenadas 0–1000). Uso: python3 -I clientes/catoira/logo/trazar-simbolo.py
import json, math, numpy as np, cv2
from pathlib import Path
from PIL import Image, ImageFilter
here = Path(__file__).resolve().parent
im = Image.open(here.parent / 'insumos' / 'logo-chico-con-contacto.jpg').convert('L')
K = 4; X0, Y0, X1, Y1 = 680, 85, 1225, 570
c = im.crop((X0, Y0, X1, Y1)); c = c.resize((c.width * K, c.height * K), Image.LANCZOS).filter(ImageFilter.GaussianBlur(K * 1.4))
mask = (np.asarray(c) < 150).astype(np.uint8) * 255
cnts, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
S = 1000 / (max(mask.shape))           # a coordenadas 0–1000
def angle(a, b, c):
    v1, v2 = a - b, c - b
    cs = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9)
    return 180 - math.degrees(math.acos(max(-1, min(1, cs))))   # giro
paths = []
for i, cn in enumerate(cnts):
    if cv2.contourArea(cn) < 2000: continue
    p = cv2.approxPolyDP(cn, 2.2 * K, True)[:, 0, :].astype(float)
    n = len(p); turn = [angle(p[k - 1], p[k], p[(k + 1) % n]) for k in range(n)]
    seglen = [np.linalg.norm(p[(k + 1) % n] - p[k]) for k in range(n)]
    # esquina: giro fuerte, o vértice entre dos rectas largas
    corner = [turn[k] > 32 or (seglen[k - 1] > 60 * K and seglen[k] > 60 * K) for k in range(n)]
    if not any(corner): corner[0] = True
    start = corner.index(True); pts = [p[(start + k) % n] for k in range(n)]; cor = [corner[(start + k) % n] for k in range(n)]
    pts.append(pts[0]); cor.append(True)
    d = [f'M{pts[0][0]*S:.1f},{pts[0][1]*S:.1f}']
    k = 0
    while k < n:
        j = k + 1
        while not cor[j]: j += 1
        run = pts[k:j + 1]
        if len(run) == 2: d.append(f'L{run[1][0]*S:.1f},{run[1][1]*S:.1f}')
        else:
            # Catmull-Rom → Bézier, con tangentes de borde hacia el vecino (sin pasarse)
            for m in range(len(run) - 1):
                p0 = run[m - 1] if m > 0 else run[m]; p1 = run[m]; p2 = run[m + 1]; p3 = run[m + 2] if m + 2 < len(run) else run[m + 1]
                c1 = p1 + (p2 - p0) / 6; c2 = p2 - (p3 - p1) / 6
                d.append(f'C{c1[0]*S:.1f},{c1[1]*S:.1f} {c2[0]*S:.1f},{c2[1]*S:.1f} {p2[0]*S:.1f},{p2[1]*S:.1f}')
        k = j
    d.append('Z'); paths.append(''.join(d))
W, H = mask.shape[1] * S, mask.shape[0] * S
(here / 'simbolo-trazado.json').write_text(json.dumps({'w': round(W, 1), 'h': round(H, 1), 'd': ' '.join(paths)}))
print('trazados', len(paths), 'caja', round(W), round(H))
