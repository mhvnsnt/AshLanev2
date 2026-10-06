#!/usr/bin/env python3
"""
x-to-json.py — Convert Schwarzerblitz .x skeletal animations to JSON.
BSD-3 engine; assets are all-rights-reserved (reference/compare only, do not ship).

Usage: python3 x-to-json.py <input.x> <output.json>
"""
import json, sys
from pyassimp import load

def s(x):
    try:
        return bytes(x.data).decode('utf-8', errors='replace').rstrip('\x00') if hasattr(x, 'data') else str(x)
    except Exception:
        return str(x)

def v3(v):
    return [float(v[0]), float(v[1]), float(v[2])]

def q4(q):
    # pyassimp quaternion: check field order via _fields_
    return [float(q[0]), float(q[1]), float(q[2]), float(q[3])]

def main():
    inp, outp = sys.argv[1], sys.argv[2]
    with load(inp) as scene:
        assert len(scene.animations) > 0, "no animations in file"
        anim = scene.animations[0]
        hier = {}
        offsets = {}
        def walk(n, parent=None):
            nm = s(n.name)
            hier[nm] = parent
            # node offset matrix
            try:
                m = n.transformation
                offsets[nm] = [float(m[i][j]) for i in range(4) for j in range(4)]
            except Exception:
                pass
            for c in n.children:
                walk(c, nm)
        walk(scene.rootnode)
        tracks = {}
        for ch in anim.channels:
            nm = s(ch.nodename)
            # rotation keys: .time / .value ; value is quaternion
            rks = [(float(k.time), k.value) for k in ch.rotationkeys]
            pks = [(float(k.time), k.value) for k in ch.positionkeys]
            # quaternion to [x,y,z,w] — inspect component access
            def qq(q):
                try:
                    return [float(q.x), float(q.y), float(q.z), float(q.w)]
                except AttributeError:
                    return [float(q[0]), float(q[1]), float(q[2]), float(q[3])]
            tracks[nm] = {
                "times": [t for t, _ in rks],
                "pos": [v3(v) for _, v in pks],
                "rot": [qq(q) for _, q in rks],
            }
        data = {
            "source": inp,
            "duration_ticks": float(anim.duration),
            "ticks_per_second": float(anim.tickspersecond or 30.0),
            "bones": list(hier.keys()),
            "hierarchy": hier,
            "offsets": offsets,
            "tracks": tracks,
        }
        with open(outp, "w") as f:
            json.dump(data, f)
        print(f"wrote {outp}: {len(tracks)} tracks, {len(hier)} bones")

if __name__ == "__main__":
    main()
