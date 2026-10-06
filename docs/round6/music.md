# Round 6 — Music & Adaptive Audio

**Rule (unchanged): only CC0 / public-domain / permissive (MIT/Apache-2.0/BSD/Unlicense/OFL) goes in the game build.** CC-BY allowed with written attribution. Everything below was license-checked at research time — re-verify before shipping.

Categories: CC/royalty-free music libraries · adaptive/interactive music engines & WebAudio frameworks · stem separation · procedural/generative music libs · loop composition tools.

(Excludes rounds 1–5: Incompetech, Kenney, Tallbeard, Openverse, Freesound, Pixabay, jsfxr, Tone.js, ZzFX, sfx-downloader, BBC.)

## 1. Free Music Archive (FMA)
- **URL:** https://freemusicarchive.org
- **What:** Curated royalty-free music repository (since 2009, now run by Tribe of Noise). Thousands of tracks across genres; per-track license search/filter.
- **License:** Per-track Creative Commons — **filter for CC0/CC-BY tracks only for the game build**. Many tracks are CC-BY-NC or other NC variants — exclude those. Also: the score and the recording each carry licenses; confirm BOTH are commercially usable per track.
- **Verdict:** ✅ Commercial-safe **with attribution** — CC-BY tracks only, credit per track on the credits screen. Non-commercial tracks = prototype-only.
- **Notes:** FMA API exists for scripted search/download; a `music-puller.py`-style puller for FMA's CC-BY/commercial subset would be a round-7 build task. Great pool for combat BGM, menu music, district ambience.

## 2. ccMixter (+ dig.ccmixter.org)
- **URL:** https://ccmixter.org · discovery: http://dig.ccmixter.org
- **What:** Remix-culture community music site — 10,000+ samples, remixes, a cappellas, curated collections. dig.ccmixter.org has a curated "game music" section aimed at game developers.
- **License:** **Mixed — check per track.** The curated dig.ccmixter game-music collections are CC-BY; many community uploads are CC-BY-NC; some curated mixes (e.g. "ccMixter beats vol.1/2") explicitly forbid unlicensed commercial use. Individual uploads can also be under retired Sampling licenses.
- **Verdict:** ⚠️ **Mixed** — CC-BY tracks (e.g. dig.ccmixter.org game collection) are commercial-safe WITH attribution; NC/unclear tracks = prototype-only. Per-track license check is mandatory.
- **Notes:** Good for remixed hip-hop/electronic fight music and vocal a cappellas (crowd chants, hype shouts). Record license name + version per track in a manifest.

## 3. filmmusic.io (Sascha Ende)
- **URL:** https://filmmusic.io
- **What:** Large catalog of production music by composer Sascha Ende — cinematic, ambient, action, electronic, "video games music" categories. Free direct MP3 download per track.
- **License:** **CC-BY 4.0** (standard license) — commercial use allowed, attribution required. Paid "pro" license removes the attribution requirement.
- **Verdict:** ✅ Commercial-safe WITH attribution — put credit on the credits screen. (Attribution-free option available via paid upgrade, not needed for prototype.)
- **Notes:** Strong fit for menu music, district ambience beds, story-mode cinematics. Has an explicit game-music category. Note exact license URL per track (filmmusic.io/standard-license).

