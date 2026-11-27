"""Reel para @barbero_leaa: 1080x1920, 60 fps, 15,5 s, sin audio (la música se agrega después).

Uso:  python3 clientes/barbero-leaa/render.py                 -> video/barbero-leaa-reel.mp4 + cuadro del cierre + hoja
      python3 clientes/barbero-leaa/render.py --frames 2,13.5   -> solo esos cuadros en PNG (revisión rápida)
      --crf N  calidad de x264 (12 por defecto; más alto = archivo más liviano)
Logo: si existe insumos/logo.png (fondo transparente), entra en el cierre arriba del texto; si no, el cierre va sin logo.

Recorrido (sin textos hasta el cierre):
  A 0.0–4.6    clip del giro (vertical, 59 fps) a velocidad real.
  B 4.3–9.1    clip de perfil (viene girado 90° en el archivo: ffmpeg lo devuelve derecho).
  C 8.8–12.6   clip del giro, otro tramo.
  Cierre 11.9–15.5: la imagen se desenfoca y oscurece con una luz cálida al centro; entran el logo (si está),
  "Tu próximo corte", una línea dorada que se dibuja desde el centro y "@barbero_leaa".
Calidad: cada cuadro sale del cuadro original más cercano (sin mezclar cuadros, que ablanda), con un solo remuestreo
lanczos, un enfoque suave, empuje mínimo (3 %), color natural apenas más rico, y x264 crf 12 a 60 fps.
"""
import os, sys, subprocess, json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, DUR = 1080, 1920, 60, 15.5
CRF = sys.argv[sys.argv.index('--crf') + 1] if '--crf' in sys.argv else '12'
OUT_DIR = os.path.join(HERE, 'video')
CLIP_V = os.path.join(HERE, 'insumos', 'clip-giro-vertical.mp4')
CLIP_P = os.path.join(HERE, 'insumos', 'clip-perfil-vertical.mp4')
LOGO = os.path.join(HERE, 'insumos', 'logo.png')


def load(path):
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                      'stream=width,height:stream_side_data=rotation:format=duration', '-of', 'json',
                                      path], capture_output=True, text=True).stdout)
    st = info['streams'][0]
    w, h = st['width'], st['height']
    if any(abs(int(d.get('rotation', 0))) == 90 for d in st.get('side_data_list', [])):
        w, h = h, w  # ffmpeg lo devuelve ya girado
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
    return fr, len(fr) / float(info['format']['duration'])


def frame_at(frames, fps, t):
    """el cuadro original más cercano: nunca se mezclan dos cuadros (eso ablanda la imagen)"""
    return frames[min(max(int(round(t * fps)), 0), len(frames) - 1)]


def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ramp(t, a, b):
    return min(max((t - a) / (b - a), 0.0), 1.0)


SHARP = ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2)


def shot(frames, fps, t, t0, src0, length):
    """pantalla completa, un solo remuestreo desde el original, empuje mínimo"""
    src = frame_at(frames, fps, src0 + (t - t0))
    sh, sw = src.shape[:2]
    z = 1.0 + 0.03 * ease_io((t - t0) / length)
    bw = sw / z; bh = bw * H / W
    if bh > sh:
        bh = sh / z; bw = bh * W / H
    cx, cy = sw / 2, sh / 2
    im = Image.fromarray(src).resize((W, H), Image.LANCZOS, box=(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2))
    return np.asarray(im.filter(SHARP), np.float32)


# ---------- color: natural, apenas más contraste y calidez ----------
_x = np.linspace(0, 1, 256)
_s = 1 / (1 + np.exp(-(_x - 0.5) * 5.0)); _s = (_s - _s.min()) / (_s.max() - _s.min())
_c = 0.72 * _x + 0.28 * _s
LUT = np.stack([np.clip(_c * 1.015, 0, 1), _c, np.clip(_c * 0.965 + 0.006, 0, 1)], 1) * 255
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
_d = np.sqrt(((xx - W / 2) / (W * 0.66)) ** 2 + ((yy - H * 0.47) / (H * 0.66)) ** 2)
VIGNETTE = (1 - 0.30 * np.clip(_d - 0.42, 0, 1) ** 1.6)[..., None]
_g = np.sqrt(((xx - W / 2) / (W * 0.55)) ** 2 + ((yy - 860) / (H * 0.30)) ** 2)
GLOW = (np.clip(1 - _g, 0, 1) ** 2)[..., None] * np.array([46, 32, 16], np.float32)   # luz cálida del cierre


def grade(img):
    idx = np.clip(img, 0, 255).astype(np.uint8)
    out = np.empty(img.shape, np.float32)
    for c in range(3):
        out[..., c] = LUT[idx[..., c], c]
    lum = out @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    return (lum[..., None] + (out - lum[..., None]) * 0.95) * VIGNETTE


def blur_small(img, radius, scale=4):
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    sm = im.resize((W // scale, H // scale), Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius / scale))
    return np.asarray(sm.resize((W, H), Image.BICUBIC), np.float32)


def dissolve(a, b, k):
    """fundido con desenfoque: en el medio todo se desenfoca, así no se ven dos cabezas superpuestas"""
    mix = a * (1 - k) + b * k
    r = np.sin(np.pi * k) ** 1.2
    return mix * (1 - r) + blur_small(mix, 40) * r if r > 0.02 else mix


# ---------- cierre ----------
def layer(name):
    im = Image.open(os.path.join(HERE, 'capas', name + '.png')).convert('RGBA')
    return im.resize((im.width // 2, im.height // 2), Image.LANCZOS)


KICK, HANDLE = layer('t3-kick'), layer('t3-handle')
LOGO_IM = None
if os.path.exists(LOGO):
    lg = Image.open(LOGO).convert('RGBA')
    k = min(400 / lg.width, 400 / lg.height)
    LOGO_IM = lg.resize((round(lg.width * k), round(lg.height * k)), Image.LANCZOS)
# centro vertical de cada pieza
Y_LOGO, Y_KICK, Y_LINE, Y_HANDLE = (700, 1000, 1056, 1130) if LOGO_IM else (0, 808, 864, 938)
T0 = 11.9   # empieza el cierre


def put(canvas, lay, cy, a, dy=0.0, blur=0.0, scale=1.0):
    if a <= 0.003:
        return
    if scale != 1.0:
        lay = lay.resize((max(1, round(lay.width * scale)), max(1, round(lay.height * scale))), Image.LANCZOS)
    if blur > 0.3:
        lay = lay.filter(ImageFilter.GaussianBlur(blur))
    if a < 1:
        r, g, b, al = lay.split()
        lay = Image.merge('RGBA', (r, g, b, al.point(lambda v: int(v * a))))
    canvas.alpha_composite(lay, ((W - lay.width) // 2, int(round(cy - lay.height / 2 + dy))))


def outro_texts(canvas, t):
    base = T0 + 0.55
    if LOGO_IM:
        u = ease_out(ramp(t, base, base + 0.9))
        put(canvas, LOGO_IM, Y_LOGO, u, dy=(1 - u) * 18, blur=(1 - u) * 8, scale=0.94 + 0.06 * u)
        base += 0.35
    u = ease_out(ramp(t, base, base + 0.7))
    put(canvas, KICK, Y_KICK, u, dy=(1 - u) * 20, blur=(1 - u) * 6)
    lw = 150 * ease_io(ramp(t, base + 0.2, base + 0.85))      # línea dorada que se dibuja desde el centro
    if lw > 1:
        d = Image.new('RGBA', (W, 6), (0, 0, 0, 0))
        ImageDraw.Draw(d).rounded_rectangle(((W - lw) / 2, 1.5, (W + lw) / 2, 4.5), radius=1.5,
                                            fill=(221, 187, 130, 255))
        canvas.alpha_composite(d, (0, Y_LINE - 3))
    u = ease_out(ramp(t, base + 0.35, base + 1.15))
    put(canvas, HANDLE, Y_HANDLE, u, dy=(1 - u) * 26, blur=(1 - u) * 9, scale=1.035 - 0.035 * u)


# ---------- cuadro ----------
def render_frame(t, fv, fpsv, fp, fpsp):
    A = lambda: grade(shot(fv, fpsv, t, 0.0, 0.2, 4.6))
    B = lambda: grade(shot(fp, fpsp, t, 4.3, 0.3, 4.8))

    def C():
        tt = t if t < 12.6 else 12.6 + (t - 12.6) * 0.35   # en el cierre el clip sigue, más lento
        return grade(shot(fv, fpsv, tt, 8.8, 5.6, 6.7))

    if t < 4.3:
        img = A()
    elif t < 4.7:
        img = dissolve(A(), B(), ease_io(ramp(t, 4.3, 4.7)))
    elif t < 8.8:
        img = B()
    elif t < 9.2:
        img = dissolve(B(), C(), ease_io(ramp(t, 8.8, 9.2)))
    else:
        img = C()
        k = ease_io(ramp(t, T0, T0 + 0.9))
        if k > 0:
            img = (img * (1 - k) + blur_small(img, 38) * k) * (1 - 0.66 * k) + GLOW * k
    fade = ease_io(ramp(t, DUR - 0.45, DUR))
    canvas = Image.fromarray(np.clip(img * (1 - 0.9 * fade), 0, 255).astype(np.uint8)).convert('RGBA')
    if t >= T0:
        outro_texts(canvas, t)
    if fade > 0:
        canvas.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, int(230 * fade))))
    return np.asarray(canvas.convert('RGB'))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    fv, fpsv = load(CLIP_V)
    fp, fpsp = load(CLIP_P)
    if '--frames' in sys.argv:
        for t in [float(x) for x in sys.argv[sys.argv.index('--frames') + 1].split(',')]:
            Image.fromarray(render_frame(t, fv, fpsv, fp, fpsp)).save(os.path.join(OUT_DIR, f'cuadro-{t:05.2f}.png'))
            print('ok', t)
        return
    out = os.path.join(OUT_DIR, 'barbero-leaa-reel.mp4')
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                            '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
                            '-tune', 'film', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                            '-an', out], stdin=subprocess.PIPE)
    n = int(round(DUR * FPS)); sheet = []
    for i in range(n):
        t = i / FPS
        fr = render_frame(t, fv, fpsv, fp, fpsp)
        enc.stdin.write(fr.tobytes())
        if i % 90 == 0:
            sheet.append(Image.fromarray(fr).resize((216, 384), Image.LANCZOS))
        if i == int(14.2 * FPS):
            Image.fromarray(fr).save(os.path.join(OUT_DIR, 'barbero-leaa-reel-cierre.png'))
        if i % 180 == 0:
            print(f'{t:5.1f} s', flush=True)
    enc.stdin.close(); enc.wait()
    sh = Image.new('RGB', (216 * len(sheet), 384), 'black')
    for k, im in enumerate(sheet):
        sh.paste(im, (216 * k, 0))
    sh.save(os.path.join(OUT_DIR, 'hoja-revision.png'))
    print('ok', out, os.path.getsize(out) // 1024, 'KB')


if __name__ == '__main__':
    main()
