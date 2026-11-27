"""Video para @barbero_leaa: 1080x1920, 30 fps, ~15 s, sin audio (la música se agrega después).

Uso:  python3 clientes/barbero-leaa/render.py            -> video/barbero-leaa-reel.mp4 + poster + hoja de revisión
      python3 clientes/barbero-leaa/render.py --frames 2.5,6,13.5   -> solo esos cuadros en PNG (revisión rápida)

Recorrido:
  A 0.0–5.0   clip vertical (giro alrededor del corte) en cámara lenta 0.75x, empuje suave.
              "@barbero_leaa" / "El detalle" / "lo es todo."
  B 4.7–9.4   clip de perfil (viene girado 90° en el archivo: se lee ya derecho), pantalla completa, empuje lento.
              "Prolijo desde" / "todos los ángulos."
  C 9.1–13.2  clip vertical, otro tramo, en cámara lenta.
  D 12.1–15.0 se desenfoca y oscurece: "Tu próximo corte" / línea / "@barbero_leaa", y baja a negro al final.
Cada cuadro se arma desde el cuadro original con un solo remuestreo (zoom con decimales, sin saltos),
corrección de color cálida y contrastada, viñeta y textos con entrada suave (sube, se enfoca y aparece).
"""
import os, sys, subprocess, json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, DUR = 1080, 1920, 30, 15.0
OUT_DIR = os.path.join(HERE, 'video')
CLIP_V = os.path.join(HERE, 'insumos', 'clip-giro-vertical.mp4')
CLIP_H = os.path.join(HERE, 'insumos', 'clip-perfil-vertical.mp4')


def load(path):
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                      'stream=width,height:stream_side_data=rotation:format=duration', '-of', 'json', path],
                                     capture_output=True, text=True).stdout)
    st = info['streams'][0]
    w, h = st['width'], st['height']
    if any(abs(int(d.get('rotation', 0))) == 90 for d in st.get('side_data_list', [])):
        w, h = h, w  # ffmpeg lo devuelve ya girado
    dur = float(info['format']['duration'])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
    return fr, len(fr) / dur


def frame_at(frames, fps, t):
    """cuadro en el tiempo t (s) mezclando los dos cuadros vecinos, para la cámara lenta sin saltos"""
    x = min(max(t * fps, 0), len(frames) - 1.001)
    i = int(x); k = x - i
    a = frames[i].astype(np.float32)
    if k < 1e-3:
        return a
    return a * (1 - k) + frames[i + 1].astype(np.float32) * k


def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ramp(t, a, b):
    return min(max((t - a) / (b - a), 0.0), 1.0)


def crop_resize(src, cx, cy, bw, bh, ow, oh):
    """remuestrea la caja (con decimales) de src a ow x oh en un solo paso"""
    im = Image.fromarray(np.clip(src, 0, 255).astype(np.uint8))
    return np.asarray(im.resize((ow, oh), Image.LANCZOS,
                                box=(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2)), np.float32)


# ---------- color ----------
_x = np.linspace(0, 1, 256)
_curve = np.clip(_x + 0.10 * np.sin(2 * np.pi * (_x - 0.5)) * -1 * 0.0 + 0.0, 0, 1)
# curva en S suave: un poco más de contraste y altas luces que caen suave (las paredes blancas estaban quemadas)
_s = 1 / (1 + np.exp(-(_x - 0.5) * 6.2)); _s = (_s - _s.min()) / (_s.max() - _s.min())
_curve = 0.55 * _x + 0.45 * _s
_curve = _curve ** 1.08 * 0.965 + 0.012
LUT = np.stack([np.clip(_curve * 1.025 + 0.004, 0, 1), _curve, np.clip(_curve * 0.94 + 0.012, 0, 1)], 1) * 255  # cálido

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
_d = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H * 0.46) / (H * 0.62)) ** 2)
VIGNETTE = (1 - 0.42 * np.clip(_d - 0.35, 0, 1) ** 1.6)[..., None]
TOP = (1 - 0.74 * np.clip(1 - yy / 1060, 0, 1) ** 1.6)[..., None]          # oscurece arriba, donde van los textos
BOTTOM = (1 - 0.35 * np.clip((yy - 1350) / 570, 0, 1) ** 1.5)[..., None]


def grade(img):
    idx = np.clip(img, 0, 255).astype(np.uint8)
    out = np.empty_like(img)
    for c in range(3):
        out[..., c] = LUT[idx[..., c], c]
    lum = out @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    out = lum[..., None] + (out - lum[..., None]) * 0.86                 # un poco menos de saturación
    return out


def blur_small(img, radius, scale=4):
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    sm = im.resize((W // scale, H // scale), Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius / scale))
    return np.asarray(sm.resize((W, H), Image.BICUBIC), np.float32)


# ---------- textos ----------
def load_layer(name):
    im = Image.open(os.path.join(HERE, 'capas', name + '.png')).convert('RGBA')
    return im.resize((im.width // 2, im.height // 2), Image.LANCZOS)


LAYERS = {n: load_layer(n) for n in ['t1-kick', 't1-a', 't1-b', 't2-a', 't2-b', 't3-kick', 't3-ln', 't3-handle']}
PAD = 44  # relleno de cada capa (a 1x)
LEFT = 84 - PAD
# (capa, x, y, entra, sale): x = 'c' centra
TEXTS = [
    ('t1-kick', LEFT, 292, 0.35, 4.25), ('t1-a', LEFT, 334, 0.50, 4.25), ('t1-b', LEFT, 452, 0.72, 4.25),
    ('t2-a', LEFT, 300, 5.55, 8.95), ('t2-b', LEFT, 386, 5.75, 8.95),
    ('t3-kick', 'c', 760, 12.55, 99), ('t3-ln', 'c', 826, 12.70, 99), ('t3-handle', 'c', 858, 12.80, 99),
]


def draw_texts(canvas, t):
    for name, x, y, tin, tout in TEXTS:
        if t < tin or t > tout + 0.45:
            continue
        a_in = ease_out(ramp(t, tin, tin + 0.7))
        a_out = 1 - ease_out(ramp(t, tout, tout + 0.42))
        a = a_in * a_out
        if a <= 0.002:
            continue
        lay = LAYERS[name]
        dy = (1 - a_in) * 28 - (1 - a_out) * 12
        blur = (1 - a_in) * 7
        if blur > 0.3:
            lay = lay.filter(ImageFilter.GaussianBlur(blur))
        if a < 1:
            r, g, b, al = lay.split()
            lay = Image.merge('RGBA', (r, g, b, al.point(lambda v: int(v * a))))
        px = (W - lay.width) // 2 if x == 'c' else x
        canvas.alpha_composite(lay, (int(px), int(round(y + dy))))


# ---------- escenas ----------
def scene_v(fv, fpsv, t, t0, src0, speed=0.75, z0=1.0, z1=1.07):
    """clip vertical: tiempo de origen = src0 + (t - t0) * speed, con empuje lento"""
    u = (t - t0) / 4.5
    z = z0 + (z1 - z0) * ease_io(u)
    src = frame_at(fv, fpsv, src0 + (t - t0) * speed)
    sh, sw = src.shape[:2]
    bw = sw / z; bh = bw * H / W
    if bh > sh / z * 1.0:
        bh = min(bh, sh); bw = bh * W / H
    cy = sh * 0.5 - 14 * ease_io(u)
    return crop_resize(src, sw / 2, cy, bw, bh, W, H)


def render_frame(t, fv, fpsv, fh, fpsh):
    # A
    def A():
        return scene_v(fv, fpsv, t, 0.0, 0.3)

    def B():
        return scene_v(fh, fpsh, t, 4.7, 0.5, speed=1.0, z0=1.04, z1=1.10)

    def C():
        return scene_v(fv, fpsv, t, 9.1, 5.2, z0=1.03, z1=1.10)

    def dissolve(a, b, k):
        # fundido con desenfoque: en el medio de la transición todo se desenfoca, así no se ven dos cabezas
        mix = a * (1 - k) + b * k
        r = np.sin(np.pi * k) ** 1.2
        return mix * (1 - r) + blur_small(mix, 40) * r if r > 0.02 else mix

    if t < 4.6:
        img = grade(A()) * TOP * BOTTOM * VIGNETTE
    elif t < 5.0:
        k = ease_io(ramp(t, 4.6, 5.0))
        img = dissolve(grade(A()) * TOP * BOTTOM * VIGNETTE, grade(B()) * TOP * BOTTOM * VIGNETTE, k)
    elif t < 9.1:
        img = grade(B()) * TOP * BOTTOM * VIGNETTE
    elif t < 9.5:
        k = ease_io(ramp(t, 9.1, 9.5))
        img = dissolve(grade(B()) * TOP * BOTTOM * VIGNETTE, grade(C()) * BOTTOM * VIGNETTE, k)
    else:
        img = grade(C()) * BOTTOM * VIGNETTE
        k = ease_io(ramp(t, 12.1, 12.9))
        if k > 0:
            bl = blur_small(img, 34)
            img = (img * (1 - k) + bl * k) * (1 - 0.5 * k)
    fade = ease_io(ramp(t, 14.45, 15.0))
    img = img * (1 - 0.92 * fade)
    canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')
    draw_texts(canvas, t)
    if fade > 0:
        dark = Image.new('RGBA', (W, H), (0, 0, 0, int(235 * fade)))
        canvas.alpha_composite(dark)
    return np.asarray(canvas.convert('RGB'))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    fv, fpsv = load(CLIP_V)
    fh, fpsh = load(CLIP_H)
    if '--frames' in sys.argv:
        ts = [float(x) for x in sys.argv[sys.argv.index('--frames') + 1].split(',')]
        for t in ts:
            Image.fromarray(render_frame(t, fv, fpsv, fh, fpsh)).save(os.path.join(OUT_DIR, f'cuadro-{t:05.2f}.png'))
            print('ok', t)
        return
    out = os.path.join(OUT_DIR, 'barbero-leaa-reel.mp4')
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                            '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15',
                            '-tune', 'film', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out],
                           stdin=subprocess.PIPE)
    n = int(round(DUR * FPS))
    sheet = []
    for i in range(n):
        t = i / FPS
        fr = render_frame(t, fv, fpsv, fh, fpsh)
        enc.stdin.write(fr.tobytes())
        if i % 45 == 0:
            sheet.append(Image.fromarray(fr).resize((216, 384), Image.LANCZOS))
        if i == int(2.6 * FPS):
            Image.fromarray(fr).save(os.path.join(OUT_DIR, 'barbero-leaa-reel-poster.png'))
        if i % 90 == 0:
            print(f'{t:5.1f} s', flush=True)
    enc.stdin.close(); enc.wait()
    sh = Image.new('RGB', (216 * len(sheet), 384), 'black')
    for k, im in enumerate(sheet):
        sh.paste(im, (216 * k, 0))
    sh.save(os.path.join(OUT_DIR, 'hoja-revision.png'))
    print('ok', out, os.path.getsize(out) // 1024, 'KB')


if __name__ == '__main__':
    main()
