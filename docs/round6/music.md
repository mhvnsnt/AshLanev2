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

## 4. FreePD (Kevin MacLeod's public-domain library)
- **URL:** https://freepd.com (offline since late 2025) · mirrors: https://github.com/SoundSafari/CC0-1.0-Music (branch: freepd.com) · https://github.com/0lhi/FreePD · Internet Archive item `allfreepdmusicbykuronekony4n`
- **What:** Kevin MacLeod's curated library of music explicitly dedicated to the public domain by various artists (MacLeod, Rafael Krux, Bryan Teoh, Alexander Nakarada). Genres: upbeat, epic, electronic, cinematic, horror, world.
- **License:** **CC0 1.0** — entire catalog. Commercial use allowed, no attribution required.
- **Verdict:** ✅ Commercial-safe, no attribution needed.
- **Notes:** ⚠️ Site shut down late 2025 — source from the GitHub mirrors or Internet Archive; verify the CC0 banner via Wayback if audited. Do NOT confuse with incompetech.com (MacLeod's main catalog is CC-BY, not PD). Menu/combat BGM without any credit-line obligation.

## 5. Musopen
- **URL:** https://musopen.org
- **What:** Non-profit library of public-domain sheet music and classical recordings (Beethoven, Brahms, Tchaikovsky symphonies recorded by Czech Philharmonic, commissioned for public-domain release). Also hosts contributed recordings.
- **License:** **Per-recording — check the license icon on the exact recording.** Many recordings carry Public Domain Mark 1.0 (PDM); some contributed recordings are CC-BY or CC-BY-NC-SA. Composition being PD does NOT make the recording PD — verify the recording's own license.
- **Verdict:** ⚠️ **Mixed** — PDM 1.0-marked recordings are commercial-safe (no attribution); CC-BY recordings are commercial-safe WITH attribution; CC-BY-NC-SA recordings = prototype-only, never ship.
- **Notes:** Classical/orchestral for dramatic entrances (Bannon wrestling entrances!), cinematic stingers, menu elegance. Keep a per-track provenance record (recording + license URL). Musopen's ToS boilerplate disclaims warranty of PD status — the per-recording icon is the authority.

## 6. Mixkit Music (Envato) — ⚠️ MUSIC NOT FOR GAMES
- **URL:** https://mixkit.co/free-stock-music/
- **What:** Envato's curated free stock music library (1,000–2,000 tracks), no sign-up, no attribution required.
- **License:** Mixkit Free License — but the **music license explicitly excludes use in video games** (covers web/social/video/VoD/podcasts/ads only; rules out CDs, DVDs, **video games**, TV/radio broadcast). (The separate Mixkit SFX license DOES allow games.)
- **Verdict:** ❌ **DO NOT SHIP game music from Mixkit** — license excludes games. Prototype-only at most.
- **Notes:** Documented here so nobody mistakes it for ship-safe. If a track is Content-ID-claimed, Mixkit support handles it — but that doesn't fix the game-use exclusion.

## 7. Purple Planet Music
- **URL:** https://www.purple-planet.com
- **What:** Royalty-free music library (ambient, cinematic, electronic, chill) by Chris Martyn & Geoff Harvey. Long-running free-music staple for creators.
- **License:** Royalty-free with **attribution required** on the free tier — credit line `Music: https://www.purple-planet.com`. Paid commercial licenses available (attribution-free).
- **Verdict:** ✅ Commercial-safe WITH attribution on the free tier.
- **Notes:** Good ambient/cinematic beds for district ambience and menus. Re-verify the current license page before shipping (terms evolve). Not a CC license — follow their credit-line wording exactly.

