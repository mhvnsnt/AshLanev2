#!/usr/bin/env python3
"""Shared GLB I/O, quaternion math, and skeleton loading for anim-retarget."""
import struct
import json
import numpy as np

# --------------------------------------------------------------------------
# Quaternion math (xyzw convention, numpy)
# --------------------------------------------------------------------------

def qmul(a, b):
    """Hamilton product a*b. Shapes (...,4)."""
    a = np.asarray(a, dtype=np.float64)
    b = np.asarray(b, dtype=np.float64)
    ax, ay, az, aw = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    bx, by, bz, bw = b[..., 0], b[..., 1], b[..., 2], b[..., 3]
    return np.stack([
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz,
    ], axis=-1)


def qinv(q):
    q = np.asarray(q, dtype=np.float64)
    n2 = np.sum(q * q, axis=-1, keepdims=True)
    n2 = np.maximum(n2, 1e-12)
    c = q.copy()
    c[..., :3] *= -1
    return c / n2


def qnorm(q):
    return np.sqrt(np.sum(np.asarray(q, dtype=np.float64) ** 2, axis=-1))


def qnormalize(q):
    q = np.asarray(q, dtype=np.float64)
    n = qnorm(q)[..., None]
    return q / np.maximum(n, 1e-12)


def qangle(a, b):
    """Angular distance between quaternions in radians. Shapes (...,4)."""
    a = qnormalize(a)
    b = qnormalize(b)
    d = np.abs(np.sum(a * b, axis=-1)).clip(0, 1)
    return 2 * np.arccos(d)


IDENTITY_Q = np.array([0.0, 0.0, 0.0, 1.0])


# --------------------------------------------------------------------------
# GLB container
# --------------------------------------------------------------------------

_COMP = {5120: "b", 5121: "B", 5122: "h", 5123: "H", 5125: "I", 5126: "f"}
_NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


class Glb:
    def __init__(self, path):
        data = open(path, "rb").read()
        if data[:4] != b"glTF":
            raise ValueError(f"{path}: not a GLB")
        self.json_len = struct.unpack("<I", data[12:16])[0]
        self.js = json.loads(data[20:20 + self.json_len])
        # Fuzz-found (AFL++, 2026-10-06): a JSON chunk that decodes to a
        # non-object (e.g. `5` or `[1,2]`) used to crash every downstream
        # .get()/[] access with AttributeError/TypeError. Reject it here
        # with a clean error instead.
        if not isinstance(self.js, dict):
            raise ValueError(f"{path}: GLB JSON chunk is not an object")
        off = 20 + self.json_len
        self.bin = b""
        if off + 8 <= len(data):
            blen = struct.unpack("<I", data[off:off + 4])[0]
            self.bin = data[off + 8:off + 8 + blen]

    def accessor(self, idx):
        acc = self.js["accessors"][idx]
        bv = self.js["bufferViews"][acc["bufferView"]]
        boff = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
        n = acc["count"]
        ncomp = _NCOMP[acc["type"]]
        fmt = "<" + _COMP[acc["componentType"]] * (n * ncomp)
        vals = struct.unpack_from(fmt, self.bin, boff)
        return np.array(vals, dtype=np.float64).reshape(n, ncomp) if ncomp > 1 else np.array(vals, dtype=np.float64)

    def node_names(self):
        return [n.get("name", "") for n in self.js.get("nodes", [])]


def extract_animations(glb):
    """Return list of {name, channels:[{node, bone, path, times, values, interp}]}."""
    nodes = glb.js.get("nodes", [])
    out = []
    for anim in glb.js.get("animations", []):
        chans = []
        for ch in anim.get("channels", []):
            tgt = ch["target"]
            samp = anim["samplers"][ch["sampler"]]
            chans.append({
                "node": tgt["node"],
                "bone": nodes[tgt["node"]].get("name", ""),
                "path": tgt["path"],
                "times": glb.accessor(samp["input"]).ravel(),
                "values": glb.accessor(samp["output"]),
                "interp": samp.get("interpolation", "LINEAR"),
            })
        out.append({"name": anim.get("name", "anim"), "channels": chans})
    return out


def load_skeleton(glb_path):
    """Load node hierarchy + rest pose from a GLB.

    Returns dict: names[list], index{map}, parent[list],
    rest_quat {name: (4,)}, translation {name: (3,)}.

    NOTE: cast GLB node translations do NOT form an anatomical figure
    (verified vs three.js); use canonical.canonical_offsets() for any
    visualization or position-based analysis.
    """
    glb = Glb(glb_path)
    nodes = glb.js.get("nodes", [])
    names = [n.get("name", f"node{i}") for i, n in enumerate(nodes)]
    index = {nm: i for i, nm in enumerate(names)}
    parent = [-1] * len(nodes)
    for i, n in enumerate(nodes):
        for c in n.get("children", []):
            parent[c] = i
    rest_quat = {}
    translation = {}
    for i, n in enumerate(nodes):
        nm = names[i]
        rest_quat[nm] = np.array(n.get("rotation", [0, 0, 0, 1]), dtype=np.float64)
        translation[nm] = np.array(n.get("translation", [0, 0, 0]), dtype=np.float64)
    return {
        "names": names, "index": index, "parent": parent,
        "nodes": nodes, "rest_quat": rest_quat, "translation": translation,
    }


# --------------------------------------------------------------------------
# GLB writer (minimal: nodes + animations)
# --------------------------------------------------------------------------

def write_glb(path, nodes, animations):
    """nodes: list of {name, translation, rotation, children:[idx]}.
    animations: list of {name, channels:[{node, path, times, values, interp}]}.
    Writes an animation/rig-only GLB."""
    bin_blob = bytearray()
    buffer_views = []
    accessors = []

    def add_array(arr, acc_type):
        nonlocal bin_blob
        arr = np.asarray(arr, dtype=np.float32)
        raw = arr.tobytes()
        while len(bin_blob) % 4:
            bin_blob.append(0)
        off = len(bin_blob)
        bin_blob.extend(raw)
        buffer_views.append({"buffer": 0, "byteOffset": off,
                             "byteLength": len(raw)})
        accessors.append({"bufferView": len(buffer_views) - 1,
                          "componentType": 5126, "count": arr.shape[0],
                          "type": acc_type})
        return len(accessors) - 1

    js_anims = []
    for anim in animations:
        js_samplers = []
        js_channels = []
        for ch in anim["channels"]:
            ia = add_array(ch["times"], "SCALAR")
            ncomp = ch["values"].shape[1]
            oa = add_array(ch["values"], "VEC4" if ncomp == 4 else "VEC3")
            js_samplers.append({"input": ia, "output": oa,
                                "interpolation": ch.get("interp", "LINEAR")})
            js_channels.append({"sampler": len(js_samplers) - 1,
                                "target": {"node": ch["node"],
                                           "path": ch["path"]}})
        js_anims.append({"name": anim["name"], "samplers": js_samplers,
                         "channels": js_channels})

    js_nodes = []
    for n in nodes:
        e = {"name": n["name"]}
        if "translation" in n:
            e["translation"] = [float(x) for x in n["translation"]]
        if "rotation" in n:
            e["rotation"] = [float(x) for x in n["rotation"]]
        if n.get("children"):
            e["children"] = n["children"]
        js_nodes.append(e)

    has_parent = set()
    for n in nodes:
        for c in n.get("children", []):
            has_parent.add(c)
    roots = [i for i in range(len(nodes)) if i not in has_parent]

    js = {
        "asset": {"version": "2.0",
                  "generator": "ashlane-anim-retarget"},
        "nodes": js_nodes,
        "scenes": [{"nodes": roots}],
        "scene": 0,
        "animations": js_anims,
        "buffers": [{"byteLength": len(bin_blob)}],
        "bufferViews": buffer_views,
        "accessors": accessors,
    }
    jraw = json.dumps(js, separators=(",", ":")).encode("utf-8")
    while len(jraw) % 4:
        jraw += b" "
    bin_blob.extend(b"\x00" * ((4 - len(bin_blob) % 4) % 4))
    total = 12 + 8 + len(jraw) + 8 + len(bin_blob)
    with open(path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total))
        f.write(struct.pack("<II", len(jraw), 0x4E4F534A))
        f.write(jraw)
        f.write(struct.pack("<II", len(bin_blob), 0x004E4942))
        f.write(bin_blob)
