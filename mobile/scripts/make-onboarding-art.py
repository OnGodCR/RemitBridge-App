"""Render the website's backdrop art for the app: `python3 scripts/make-onboarding-art.py`
(needs Pillow), run from mobile/. DECISIONS.md D62.

Everything here is copied from the website's components, not invented:

- The mark is LogoMark (src/components/Logo.jsx): viewBox 48x32, stroke 3, round caps,
  deck M2 17Q24 3 46 17, arch M14 30v-6q10-9 20 0v6. Drawn white, recoloured in the app
  with tintColor, so one file serves light and dark.
- The page ground is Backdrop (src/components/Backdrop.jsx): the mark tiled on a 120x90
  grid, rotated -8deg, translated (36,30) and scaled 1.05, stroke 2.5, at 6% opacity; with a
  light at 50%/35% of primary mixed to 22%, fading to nothing at 60% of a 38rem radius.
- The green band takes the light alone, with no marks ("the marks read much louder
  against green"), primary-foreground mixed to 13%.

Rendered at 3x for a 402x874pt screen and saved as WebP, opaque, so each is small. The
ground files carry @3x so the app treats them as 3x art; named plainly, they were drawn at
three times their size.
"""
import math
import os
import random

from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')
W, H = 1206, 2622  # 402x874pt at 3x
S = 3  # px per CSS px / pt
SUPER = 2  # supersampling for smooth strokes


def quad(p0, p1, p2, n=60):
    return [
        ((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
         (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
        for t in (i / n for i in range(n + 1))
    ]


DECK = quad((2, 17), (24, 3), (46, 17))
ARCH = [(14, 30), (14, 24)] + quad((14, 24), (24, 15), (34, 24)) + [(34, 30)]


def stroke(draw, pts, width, fill):
    """A round pen along the path: no seams where segments meet."""
    r = width / 2
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / 1.5))
        for i in range(n + 1):
            x = x0 + (x1 - x0) * i / n
            y = y0 + (y1 - y0) * i / n
            draw.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def mark(scale):
    """The outlined mark, white on transparent, at `scale` px per viewBox unit."""
    k = scale * SUPER
    pad = 1.5  # half the stroke, so the round caps aren't clipped
    im = Image.new('RGBA', (round((48 + 2 * pad) * k), round((32 + 2 * pad) * k)), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for path in (DECK, ARCH):
        stroke(d, [((x + pad) * k, (y + pad) * k) for x, y in path], 3 * k, (255, 255, 255, 255))
    return im.resize((round(im.width / SUPER), round(im.height / SUPER)), Image.LANCZOS)


def light(base, color, alpha, cx=0.5, cy=0.35):
    """The resting light: color at `alpha` in the middle, nothing at 60% of 38rem."""
    radius = 38 * 16 * 0.6 * S
    px = base.load()
    rng = random.Random(62)  # fixed seed: the same art on every run
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - cx * W, y - cy * H) / radius
            if d >= 1:
                continue
            # Eased, not linear: a straight falloff peaks in a point that reads as a disc.
            a = alpha * (1 - d) ** 2
            # Dither by under half a level: an 8-bit gradient this soft otherwise shows
            # as visible rings, most of all on the green band.
            n = rng.uniform(-0.5, 0.5)
            r, g, b = px[x, y]
            px[x, y] = tuple(
                max(0, min(255, round(c + (t - c) * a + n))) for c, t in ((r, color[0]), (g, color[1]), (b, color[2]))
            )
    return base


def ground(bg, ink, glow, glow_alpha):
    k = S * SUPER
    # Draw the tiling larger than the screen so the rotation leaves no bare corners.
    cw, ch = int(W * 1.35) * SUPER, int(H * 1.2) * SUPER
    tiles = Image.new('L', (cw, ch), 0)
    d = ImageDraw.Draw(tiles)
    for ty in range(-1, ch // (90 * k) + 2):
        for tx in range(-1, cw // (120 * k) + 2):
            ox, oy = tx * 120 * k + 36 * k, ty * 90 * k + 30 * k
            for path in (DECK, ARCH):
                stroke(d, [(ox + x * 1.05 * k, oy + y * 1.05 * k) for x, y in path], 2.5 * k, 255)
    tiles = tiles.rotate(8, resample=Image.BICUBIC)  # CSS rotate(-8deg) is counterclockwise
    left, top = (cw - W * SUPER) // 2, (ch - H * SUPER) // 2
    tiles = tiles.crop((left, top, left + W * SUPER, top + H * SUPER)).resize((W, H), Image.LANCZOS)
    mask = tiles.point(lambda v: round(v * 0.06))  # 6% opacity
    base = Image.new('RGB', (W, H), bg)
    base.paste(Image.new('RGB', (W, H), ink), (0, 0), mask)
    return light(base, glow, glow_alpha)


def band(bg, glow, glow_alpha):
    return light(Image.new('RGB', (W, H), bg), glow, glow_alpha)


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


if __name__ == '__main__':
    for suffix, scale in (('', 2), ('@2x', 4), ('@3x', 6)):
        mark(scale).save(os.path.join(OUT, f'mark{suffix}.png'))
    # Tokens from constants/theme.ts (light values are the website's own).
    ground(hexrgb('#f9fafb'), hexrgb('#14705a'), hexrgb('#14705a'), 0.22).save(
        os.path.join(OUT, 'ground-light@3x.webp'), 'WEBP', quality=94, method=6)
    ground(hexrgb('#111416'), hexrgb('#3fae8e'), hexrgb('#3fae8e'), 0.14).save(
        os.path.join(OUT, 'ground-dark@3x.webp'), 'WEBP', quality=94, method=6)
    # The bands are pure gradient, which lossy WebP turns back into rings; lossless keeps the
    # dither, and at 1x the file stays small (a gradient has no detail to lose by scaling).
    for name, bg, glow, a in (('band-light', '#14705a', '#ffffff', 0.16), ('band-dark', '#0e4a3c', '#f2f6f4', 0.12)):
        band(hexrgb(bg), hexrgb(glow), a).resize((W // S, H // S), Image.LANCZOS).save(
            os.path.join(OUT, f'{name}.webp'), 'WEBP', lossless=True, method=6)
