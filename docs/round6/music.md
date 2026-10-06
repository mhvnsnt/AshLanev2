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

## 8. TeknoAXE
- **URL:** http://teknoaxe.com · tracks mirrored at https://www.free-stock-music.com (search "teknoaxe")
- **What:** Large catalog (hundreds of tracks) by YouTube musician TeknoAXE — metal, synthwave, electronic, rock, ambient. Tracks tagged with BPM; several explicitly described as fitting video games ("The Exile of Kronos", "This Is My City" synthwave, "Waypoint H" metal).
- **License:** **CC-BY 4.0 / CC-BY 3.0** (per track) — free for commercial use with credit: `<Track> by TeknoAXE | http://teknoaxe.com / Creative Commons Attribution 4.0 https://creativecommons.org/licenses/by/4.0/`.
- **Verdict:** ✅ Commercial-safe WITH attribution — credit per track on the credits screen.
- **Notes:** Strong fit for AshLane combat BGM (metal/synthwave/electronic) and Bannon entrance themes (heavy guitar tracks). Verify the license version per track (mix of 3.0/4.0) and never redistribute as standalone music.

## 9. Newgrounds Audio Portal
- **URL:** https://www.newgrounds.com/audio/
- **What:** Huge community music portal (open since 2003) — hundreds of submissions weekly; hip-hop, electronic, rock, orchestral. Historically built for game/movie developers to use tracks in their Flash games.
- **License:** **Mixed per artist.** The OLD default was CC BY-NC-SA 3.0 (non-commercial). Modern Audio Portal lets each artist set their own permissions per track ("contact author" filter, some artists — e.g. Hypervolt — allow any creative work commercial or otherwise).
- **Verdict:** ⚠️ **Prototype-only for default-licensed tracks** (old BY-NC-SA = non-commercial, never ship). Ship-safe ONLY for tracks where the artist explicitly permits commercial use — get it in writing / screenshot the license setting per track.
- **Notes:** Great scouting ground for unique fight music, but licensing is artist-by-artist — treat as leads, not a library. For shipped tracks, prefer CC-BY sources above.

## 10. Demucs (Meta) — stem separation
- **URL:** https://github.com/facebookresearch/demucs
- **What:** State-of-the-art music source separation (htdemucs / htdemucs_ft / htdemucs_6s: vocals, drums, bass, other, + guitar/piano in 6s). PyTorch; ~44.1kHz output. Weights auto-download (~200MB).
- **License:** **MIT** — code AND official pretrained weights (verified in the upstream LICENSE: "Copyright (c) Meta Platforms").
- **Verdict:** ✅ Commercial-safe (MIT) as a **build-time tool** — never ship Demucs itself in the game client.
- **Notes:** KEY pipeline tool: split any CC0/CC-BY track into stems (drums, bass, vocals, other) at build time → layer stems in-game for adaptive fight music (e.g. drums-only at low heat, full mix at high heat; mute vocals during dialogue). Also: strip vocals from tracks for ambience beds. Only process audio we have rights to (separating a copyrighted track we don't own is still infringement of the source).

## 11. Spleeter (Deezer) — stem separation
- **URL:** https://github.com/deezer/spleeter
- **What:** Fast source separation (TensorFlow): 2-stem (vocals/accompaniment), 4-stem (vocals/drums/bass/other), 5-stem (+piano). 100× realtime on GPU. CLI + Python library; ships pretrained models. (Spleeter Pro is Deezer's separate commercial offering.)
- **License:** **MIT** — code AND pretrained models per the repo's JOSS paper and license notices.
- **Verdict:** ✅ Commercial-safe (MIT) as a **build-time tool** — never ship in the game client.
- **Notes:** Lighter/faster alternative to Demucs for batch stem extraction; ONNX conversions exist (sherpa-onnx) for runtime-lean pipelines. Same rights caveat as Demucs: only separate audio we have rights to. Avoid Ultimate Vocal Remover (UVR) for this role — its community model weights have no clear license (prototype-only).

## 12. Howler.js — WebAudio playback engine
- **URL:** https://howlerjs.com · https://github.com/goldfire/howler.js
- **What:** The standard JS audio library for games: WebAudio with HTML5 fallback, audio sprites, volume/pan/rate control, mobile unlock handling, spatial (3D positional) audio. `npm i howler`.
- **License:** **MIT** (James Simpson / GoldFire Studios).
- **Verdict:** ✅ Commercial-safe (MIT) — the playback layer for all game music/SFX.
- **Notes:** Adaptive-music architecture: layer Demucs-separated stems as multiple Howls and crossfade volumes by fight heat; audio sprites for menu UI; `stereo`/`pos()` for positional crowd/ambience. Replaces hand-rolled WebAudio plumbing.

## 13. Scribbletune — procedural music in JS
- **URL:** https://scribbletune.com · https://github.com/scribbletune/scribbletune
- **What:** "Create music with JavaScript" — scales, chords, arps, progressions, patterns → MIDI files (Node) or Tone.Sequence clips (browser). `npm i scribbletune`.
- **License:** **MIT** (verified in repo + cdnjs).
- **Verdict:** ✅ Commercial-safe (MIT).
- **Notes:** Compose original loops IN CODE: generate per-district chord progressions and drum patterns at build time → render to MIDI → render audio offline → ship loops. Zero licensed-audio baggage, infinite variety, fully original. Pair with Tone.js (already in stack) for rendering.

## 14. Magenta.js (Google) — ML music generation in the browser
- **URL:** https://github.com/magenta/magenta-js · npm `@magenta/music`
- **What:** Google's ML music toolkit for the browser (TensorFlow.js): MusicVAE (melody/drum generation), MusicRNN, GANSynth (instrument timbres), groove continuation, melody harmonization. Powers Lo-Fi Player-style generative rooms.
- **License:** **Apache-2.0** (verified in repo).
- **Verdict:** ✅ Commercial-safe (Apache-2.0).
- **Notes:** Best use: OFFLINE generation of original loops (generate → curate → render → ship audio; the model stays out of the game). Runtime in-browser generation is possible but heavy for a game client. Generated output from our own prompts is original work — no licensed-audio baggage. Watch checkpoint download size; generate at build time.

