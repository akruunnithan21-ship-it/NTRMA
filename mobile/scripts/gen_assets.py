"""
Generate WealthMaster brand assets (icon, adaptive icon, splash, favicon).
Neon "Neon Terminal" look: cyan hexagon ring + gradient 'W' + glow on near-black.
Run:  python3 scripts/gen_assets.py
"""
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BG = (10, 10, 15, 255)        # #0A0A0F
CYAN = (0, 240, 255, 255)     # #00F0FF
BLUE = (0, 102, 255, 255)     # #0066FF
ASSETS = "assets"
FONT_PATH = "node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def hexagon(cx, cy, r, rotation=math.pi / 6):
    return [
        (cx + r * math.cos(rotation + i * math.pi / 3),
         cy + r * math.sin(rotation + i * math.pi / 3))
        for i in range(6)
    ]


def draw_logo(size, with_bg=True, logo_scale=0.62):
    """Render the logo centered on a `size`x`size` canvas."""
    S = size
    img = Image.new("RGBA", (S, S), BG if with_bg else (0, 0, 0, 0))

    # --- glow layer (drawn big, blurred) ---
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx = cy = S / 2
    r = S * logo_scale / 2
    gd.polygon(hexagon(cx, cy, r), outline=CYAN, width=int(S * 0.03))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.03))
    img.alpha_composite(glow)

    # --- crisp hexagon ring ---
    ring = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.polygon(hexagon(cx, cy, r), outline=CYAN, width=max(2, int(S * 0.016)))
    img.alpha_composite(ring)

    # --- gradient "W" ---
    try:
        font = ImageFont.truetype(FONT_PATH, int(S * 0.42))
    except Exception:
        font = ImageFont.load_default()

    # text mask
    mask_img = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask_img)
    bbox = md.textbbox((0, 0), "W", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (S - tw) / 2 - bbox[0]
    ty = (S - th) / 2 - bbox[1]
    md.text((tx, ty), "W", font=font, fill=255)

    # vertical gradient fill
    grad = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    px = grad.load()
    for y in range(S):
        c = lerp(CYAN, BLUE, y / S)
        for x in range(S):
            px[x, y] = c
    grad.putalpha(mask_img)

    # subtle glow behind text
    tglow = grad.filter(ImageFilter.GaussianBlur(S * 0.02))
    img.alpha_composite(tglow)
    img.alpha_composite(grad)
    return img


def main():
    # App icon (square, with background)
    icon = draw_logo(1024, with_bg=True, logo_scale=0.64)
    icon.convert("RGB").save(f"{ASSETS}/icon.png")

    # Android adaptive icon foreground (transparent, smaller safe area)
    adaptive = draw_logo(1024, with_bg=False, logo_scale=0.46)
    adaptive.save(f"{ASSETS}/adaptive-icon.png")

    # Splash logo (transparent, centered; backgroundColor set in app.json)
    splash = draw_logo(1024, with_bg=False, logo_scale=0.7)
    splash.save(f"{ASSETS}/splash-icon.png")

    # Favicon (web)
    fav = draw_logo(196, with_bg=True, logo_scale=0.66)
    fav.convert("RGB").save(f"{ASSETS}/favicon.png")

    print("Generated: icon.png, adaptive-icon.png, splash-icon.png, favicon.png")


if __name__ == "__main__":
    main()
