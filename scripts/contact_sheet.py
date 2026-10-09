#!/usr/bin/env python3
"""Build contact sheets: <qc>/<asset>_contact.png from <tmp>/<asset>_punch|kick.png."""
import os, sys
from PIL import Image, ImageDraw

TMP, MODELSDIR = sys.argv[1], sys.argv[2]
ASSETS = [
    ('gloves', 'street'), ('gloves', 'boxing'), ('gloves', 'mma'), ('gloves', 'opera_theory'),
    ('wristbands', 'sweatband'), ('wristbands', 'wrap'), ('wristbands', 'pad'),
    ('footwear', 'sneaker_high'), ('footwear', 'sneaker_low'),
    ('footwear', 'wrestling_boot'), ('footwear', 'theory_boot'),
]
for cat, aid in ASSETS:
    imgs = []
    for pose in ('punch', 'kick'):
        p = os.path.join(TMP, f'{aid}_{pose}.png')
        imgs.append(Image.open(p).convert('RGB'))
    w, h = imgs[0].size
    sheet = Image.new('RGB', (w * 2 + 30, h + 60), (20, 20, 24))
    sheet.paste(imgs[0], (0, 60)); sheet.paste(imgs[1], (w + 30, 60))
    d = ImageDraw.Draw(sheet)
    d.text((10, 12), f'{aid}  |  punch (L)  /  kick (R)', fill=(240, 240, 240))
    out = os.path.join(MODELSDIR, cat, 'qc', f'{aid}_contact.png')
    sheet.save(out)
    print('contact ->', out)
