"""Build contact sheets per asset from QC renders. Usage: -- <qc_dir>"""
import os, sys
from PIL import Image, ImageDraw

qc = sys.argv[sys.argv.index('--') + 1]
files = sorted(f for f in os.listdir(qc) if f.endswith('.png') and '_contact' not in f)
# group by asset (strip trailing _astrid/_echo/_hollow/_static/_nohair/_johnford + _front/_side/_turn)
groups = {}
for f in files:
    base = f[:-4]
    for v in ('_front', '_side', '_turn'):
        if base.endswith(v):
            base = base[:-len(v)]
            break
    groups.setdefault(base, []).append((f, v))

for asset, items in sorted(groups.items()):
    items.sort(key=lambda x: {'_front': 0, '_side': 1, '_turn': 2}.get(x[1], 3))
    imgs = [Image.open(os.path.join(qc, f)) for f, _ in items]
    w, h = imgs[0].size
    cols = len(imgs)
    sheet = Image.new('RGB', (w * cols, h + 28), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    d.text((10, 6), asset, fill=(255, 255, 255))
    for i, (im, (_, v)) in enumerate(zip(imgs, items)):
        sheet.paste(im, (i * w, 28))
        d.text((i * w + 8, h + 8), v.strip('_'), fill=(200, 200, 200))
    out = os.path.join(qc, asset + '_contact.png')
    sheet.save(out)
    print('wrote', out, cols, 'views')
