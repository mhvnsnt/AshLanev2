#!/usr/bin/env python3
"""
CMU/cMonkeys Mocap FBX Puller for AshLane
Downloads FBX motion-capture animations from the cMonkeys Huge FBX Mocap Library
on archive.org (2,534 clips — FBX conversion of the CMU Graphics Lab mocap database).

License: CMU original data is free for commercial use (see mocap.cs.cmu.edu license:
  "You may include this data in commercially-sold products, but you may not
  resell this data directly, even in converted form."
  Acknowledgment: "The data used in this project was obtained from mocap.cs.cmu.edu.
  The database was created with funding from NSF EIA-0196217.")
The converter (Ward Dewaele) places no extra restrictions.
=> Commercial-safe for IN-GAME use. Do not redistribute the raw FBX files.

Usage:
  python3 cmu-mocap-puller.py --list-subjects          # show CMU subject numbers
  python3 cmu-mocap-puller.py --subject 13 --out ./mocap
  python3 cmu-mocap-puller.py --subjects 13,16,143 --out ./mocap

CMU subjects of interest for a brawler (verify against mocap subject docs):
  13  = boxing           14 = playground/stunts
  16  = martial arts     143 = boxing 2
  144 = boxing 3         05 = jumps   07 = walks/runs
"""
import argparse, json, os, sys, urllib.request, urllib.parse

ARCHIVE_ID = "Huge_FBX_Mocap_Library"
BASE = f"https://archive.org/download/{ARCHIVE_ID}/Huge%20FBX%20Mocap%20Library/mocap%20animations"
META_URL = f"https://archive.org/metadata/{ARCHIVE_ID}"
ACK = ("The data used in this project was obtained from mocap.cs.cmu.edu. "
       "The database was created with funding from NSF EIA-0196217.")

COMBAT_SUBJECTS = {
    "13": "boxing", "14": "playground/stunts", "16": "martial arts",
    "143": "boxing 2", "144": "boxing 3",
}

def fetch_metadata():
    req = urllib.request.Request(META_URL, headers={"User-Agent": "AshLane/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

def list_subjects():
    meta = fetch_metadata()
    subjects = set()
    for f in meta.get("files", []):
        parts = f["name"].split("/")
        if len(parts) > 3 and f["name"].endswith(".fbx"):
            subjects.add(parts[2])
    print(f"{'Subject':<10} {'Clips':<8} Note")
    for s in sorted(subjects, key=lambda x: int(x) if x.isdigit() else 9999):
        n = sum(1 for f in meta.get("files", [])
                if f["name"].startswith(f"Huge FBX Mocap Library/mocap animations/{s}/")
                and f["name"].endswith(".fbx"))
        note = COMBAT_SUBJECTS.get(s, "")
        print(f"{s:<10} {n:<8} {note}")

def download_subject(subject, outdir, meta):
    prefix = f"Huge FBX Mocap Library/mocap animations/{subject}/"
    files = [f["name"] for f in meta.get("files", [])
             if f["name"].startswith(prefix) and f["name"].endswith(".fbx")]
    if not files:
        print(f"No FBX files found for subject {subject}")
        return 0
    dest = os.path.join(outdir, f"subject_{subject}")
    os.makedirs(dest, exist_ok=True)
    ok = 0
    for name in files:
        fname = name.split("/")[-1]
        url = f"https://archive.org/download/{ARCHIVE_ID}/" + urllib.parse.quote(name)
        target = os.path.join(dest, fname)
        if os.path.exists(target):
            ok += 1
            continue
        try:
            urllib.request.urlretrieve(url, target)
            ok += 1
            print(f"  {fname}")
        except Exception as e:
            print(f"  FAIL {fname}: {e}", file=sys.stderr)
    print(f"Subject {subject}: {ok}/{len(files)} files -> {dest}")
    return ok

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list-subjects", action="store_true")
    ap.add_argument("--subject", help="single CMU subject number")
    ap.add_argument("--subjects", help="comma-separated subject numbers")
    ap.add_argument("--combat", action="store_true", help="download known combat subjects (13,16,143,144)")
    ap.add_argument("--out", default="./mocap")
    a = ap.parse_args()

    if a.list_subjects:
        list_subjects()
        return

    subjects = []
    if a.combat:
        subjects = list(COMBAT_SUBJECTS.keys())
    if a.subject:
        subjects.append(a.subject)
    if a.subjects:
        subjects += a.subjects.split(",")
    if not subjects:
        ap.error("specify --subject, --subjects, --combat, or --list-subjects")

    print("Fetching archive metadata...")
    meta = fetch_metadata()
    total = 0
    for s in subjects:
        total += download_subject(s.strip(), a.out, meta)
    print(f"\nDone: {total} FBX files downloaded.")
    print(f"LICENSE: {ACK}")
    print("Commercial-safe for in-game use. Do NOT redistribute raw FBX files.")

if __name__ == "__main__":
    main()
