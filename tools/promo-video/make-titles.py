#!/usr/bin/env python3
"""
make-titles.py — title card PNGs for promo videos.
Uses Bangers (name) + Anton (subtitle) from the OFL street fonts.
Transparent PNGs, composited with fade in ffmpeg.

Usage: python3 make-titles.py --name "EL TORO DE ORO" --sub "ASHLANE" --out titles/
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1080

def load_font(fname, size):
    p = os.path.join(HERE, 'fonts', fname)
    # fonts live in subdirs like Bangers/Bangers-Regular.ttf
    for root, _, files in os.walk(os.path.join(HERE, 'fonts')):
        for f in files:
            if f == os.path.basename(fname) or f == fname:
                p = os.path.join(root, f); break
    return ImageFont.truetype(p, size)

def text_card(text, font, fill, stroke_w, stroke_fill, y_center, glow=None):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0, 0), text, font=font, stroke_width=stroke_w)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x, y = (W - tw) / 2 - bbox[0], y_center - th / 2 - bbox[1]
    if glow:
        gimg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(gimg)
        gd.text((x, y), text, font=font, fill=glow + (255,), stroke_width=stroke_w + 14, stroke_fill=glow + (255,))
        gimg = gimg.filter(ImageFilter.GaussianBlur(28))
        img = Image.alpha_composite(img, gimg)
        d = ImageDraw.Draw(img)
    d.text((x, y), text, font=font, fill=fill + (255,),
           stroke_width=stroke_w, stroke_fill=stroke_fill + (255,))
    return img

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--name', required=True)
    ap.add_argument('--sub', default='ASHLANE')
    ap.add_argument('--out', default='titles')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    name_font = load_font('Bangers-Regular.ttf', 190)
    sub_font = load_font('Anton-Regular.ttf', 64)

    # main name card — gold with black outline, red glow
    card = text_card(a.name, name_font, (255, 200, 90), 6, (10, 5, 0), H * 0.44, glow=(255, 60, 20))
    # red slash underline
    d = ImageDraw.Draw(card)
    d.rectangle([W*0.5 - 320, H*0.44 + 120, W*0.5 + 320, H*0.44 + 132], fill=(200, 30, 20, 255))
    card.save(os.path.join(a.out, 'name.png'))

    # subtitle card — smaller, white stencil feel
    sub = text_card(a.sub, sub_font, (235, 235, 240), 3, (0, 0, 0), H * 0.72)
    sub.save(os.path.join(a.out, 'sub.png'))

    # end card: ASHLANE big, "URBAN REIGN 2, 2026" small
    end = text_card('ASHLANE', name_font, (255, 255, 255), 6, (0, 0, 0), H * 0.42, glow=(255, 180, 60))
    d = ImageDraw.Draw(end)
    tag_font = load_font('Anton-Regular.ttf', 44)
    tag = 'URBAN REIGN 2  •  2026'
    tb = d.textbbox((0, 0), tag, font=tag_font)
    d.text(((W - (tb[2]-tb[0]))/2, H*0.42 + 130), tag, font=tag_font, fill=(255, 200, 90, 255))
    end.save(os.path.join(a.out, 'end.png'))
    print(f'title cards -> {a.out}/ (name.png, sub.png, end.png)')

if __name__ == '__main__':
    main()
