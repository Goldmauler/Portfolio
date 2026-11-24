"""Builds every image the static SEO pages use (run from the project root).

    python scripts/make-images.py --portrait "<hi-res headshot.png>" --linkedin "<folder of LinkedIn post images>"

* portrait variants (1:1 colour, 1:1 black-and-white, 4:3, 16:9) from the 1254 px headshot
* event photos copied from the downloaded LinkedIn post images under descriptive file names
* project hero images resized from public/images/{phanovex,lazarus,avav}.jpg
* one 1200x630 social card per page (face + title) from `node scripts/export-og.mjs`
"""
import argparse, json, math, os, subprocess, sys, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("--portrait", required=True)
ap.add_argument("--linkedin", required=True)
args = ap.parse_args()

OUT = os.path.join("public", "images")
OG = os.path.join(OUT, "og")
os.makedirs(OG, exist_ok=True)
BG = (3, 6, 5)

def save_jpg(im, path, q=88):
    im.convert("RGB").save(path, "JPEG", quality=q, optimize=True, progressive=True)
    print(f"{os.path.getsize(path)/1024:7.0f} KB  {path}")

# ── portraits ────────────────────────────────────────────────────────────────────────────────
src = Image.open(args.portrait).convert("RGB")
sq = src.resize((1200, 1200), Image.LANCZOS)
save_jpg(sq, os.path.join(OUT, "vimal-harihar-s-k-portrait.jpg"), 90)
save_jpg(sq.convert("L"), os.path.join(OUT, "vimal-harihar-s-k-portrait-bw.jpg"), 90)

def pad(im, w, h):
    canvas = Image.new("RGB", (w, h), BG)
    s = min(w / im.width, h / im.height)
    r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    canvas.paste(r, ((w - r.width) // 2, (h - r.height) // 2))
    return canvas

save_jpg(pad(src, 1600, 1200), os.path.join(OUT, "vimal-harihar-s-k-portrait-4x3.jpg"), 90)
save_jpg(pad(src, 1920, 1080), os.path.join(OUT, "vimal-harihar-s-k-portrait-16x9.jpg"), 90)
# Old URL that Google already indexed: keep it, but serve the 1200 px colour version.
save_jpg(sq, os.path.join("public", "vimal-harihar-s-k.jpg"), 90)

# ── event photos (no third-party faces) ───────────────────────────────────────────────────────
EVENTS = {
    "li-post05-3-480x328.jpg": "gender-technology-2025-certificate-of-paper-presentation-vimal-harihar-s-k.jpg",
    "li-post10-2-480x253.jpg": "infineon-psoc6-sequence-quest-keypad-lcd-board.jpg",
    "li-post01-0-800x1066.jpg": "caterpillar-tech-challenge-2026-grand-finalist-caterpillar-office.jpg",
    "li-post01-3-480x279.jpg": "phanovex-mining-dump-truck-3d-model-blender.jpg",
    "li-post02-0-800x555.jpg": "rota-techx-2025-participant-badges-finstein.jpg",
    "li-post09-3-480x640.jpg": "nit-trichy-ai-for-all-one-day-ideathon-venue-board.jpg",
    "li-post08-1-480x617.jpg": "secureai-cyber-springer-itai-2025-paper-first-page.jpg",
    "li-post04-0-480x480.jpg": "rezo-vs-code-extension-logo.jpg",
    "li-post04-1-800x395.jpg": "rezo-vs-code-marketplace-listing.jpg",
}
for s, d in EVENTS.items():
    im = Image.open(os.path.join(args.linkedin, s))
    save_jpg(im, os.path.join(OUT, d), 90)

# ── project heroes ───────────────────────────────────────────────────────────────────────────
HEROES = {
    "phanovex": "phanovex-carry-back-intelligence-mining-trucks-vimal-harihar-s-k.jpg",
    "lazarus": "lazarus-multi-agent-legacy-code-resurrection-aws-vimal-harihar-s-k.jpg",
    "avav": "avav-autonomous-visual-asset-validator-vimal-harihar-s-k.jpg",
}
for k, d in HEROES.items():
    im = Image.open(os.path.join(OUT, f"{k}.jpg")).convert("RGB")
    im = im.resize((1200, round(1200 * im.height / im.width)), Image.LANCZOS)
    save_jpg(im, os.path.join(OUT, d), 82)

# ── social cards ─────────────────────────────────────────────────────────────────────────────
F = r"C:\Windows\Fonts"
f_title = lambda s: ImageFont.truetype(os.path.join(F, "segoeuib.ttf"), s)
f_body = lambda s: ImageFont.truetype(os.path.join(F, "segoeui.ttf"), s)
f_mono = lambda s, b=False: ImageFont.truetype(os.path.join(F, "consolab.ttf" if b else "consola.ttf"), s)
GREEN = (0, 255, 157)

# circular crop of the headshot (it is already a circle on black; trim to the circle)
c = src.crop((57, 57, 1197, 1197)).resize((340, 340), Image.LANCZOS)
mask = Image.new("L", (340, 340), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 339, 339), fill=255)

def card(file, kicker, title, sub):
    im = Image.new("RGB", (1200, 630), BG)
    d = ImageDraw.Draw(im)
    # faint grid
    for x in range(0, 1200, 60):
        d.line([(x, 0), (x, 630)], fill=(8, 18, 13))
    for y in range(0, 630, 60):
        d.line([(0, y), (1200, y)], fill=(8, 18, 13))
    cx, cy = 80, 145
    d.ellipse((cx - 10, cy - 10, cx + 350, cy + 350), outline=GREEN, width=5)
    im.paste(c, (cx, cy), mask)
    x0 = 480
    d.text((x0, 90), f"> {kicker}", font=f_mono(30), fill=GREEN)
    lines = textwrap.wrap(title, width=22 if len(title) > 26 else 30)[:3]
    size = 66 if len(lines) <= 2 else 54
    y = 150
    for ln in lines:
        d.text((x0, y), ln, font=f_title(size), fill=(241, 255, 248))
        y += size + 10
    for ln in textwrap.wrap(sub, width=40)[:2]:
        d.text((x0, y + 12), ln, font=f_body(30), fill=(150, 200, 175))
        y += 40
    d.text((x0, 520), "Vimal Harihar S K", font=f_title(30), fill=(220, 245, 232))
    d.text((x0, 562), "vimalharihar.dev  ·  github.com/Goldmauler", font=f_mono(24), fill=GREEN)
    save_jpg(im, os.path.join("public", file.lstrip("/")), 86)

cards = json.loads(subprocess.check_output(["node", "scripts/export-og.mjs"], text=True, encoding="utf-8"))
for k in cards:
    card(k["file"], k["kicker"], k["title"], k["sub"])
print("cards:", len(cards))
