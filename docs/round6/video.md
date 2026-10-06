# Round 6 — Video Production

Open-source / free resources for the staged-entrance promo-video pipeline (50-second cinematic promos, El Toro de Oro style).
Everything below is RESEARCH; no code wired yet. Licenses recorded per entry with commercial-safety verdicts.

## Internet Archive Feature Films collection
- **URL:** https://archive.org/details/feature_films
- **What:** ~28,000 public-domain feature films — silents, pre-Code studio era, B-noirs, sci-fi/horror. Stream or download (often HD), no account needed. New PD titles added as copyrights expire each January.
- **License:** Collection-level claim is public domain, but the collection is only ~65% verified PD; rights vary per item (user uploads; some titles had copyright restored under GATT/URAA).
- **Verdict:** Commercial-safe ONLY with per-title verification (check the item's `licenseurl`/`rights` fields via `https://archive.org/metadata/<identifier>`). Otherwise prototype-only.
- **Notes:** Larger than Prelinger for long-form footage (flavor on in-game TVs, promo B-roll, title-card textures). Never assume "old = PD" — the test is publication date + registration/renewal status, not age.
## NARA — National Archives motion picture holdings
- **URL:** https://catalog.archives.gov (series info: https://www.archives.gov/research/motion-pictures/newsreels)
- **What:** 300,000+ reels of motion picture film: US-govt-produced films (military, educational, WWII-era documentaries 1915–1976), plus gift collections — e.g. Universal Newsreel releases and outtakes 1929–1967 (MCA/Universal deeded the copyright to the US Government).
- **License:** Federal works are public domain under 17 U.S.C. 105; NARA states "the vast majority of the digital images in the National Archives Catalog are in the public domain." BUT: NARA does not confirm copyright status — some holdings (donated/private materials) are copyrighted, and individual reels can include third-party-owned content.
- **Verdict:** Commercial-safe for federal-produced works; verify per item (user's responsibility per NARA policy). Universal Newsreels mostly PD but check per reel.
- **Notes:** Online downloads limited; most material viewable/copiable in the College Park research room. NARA's YouTube channel links catalog downloads for a subset — good scouting shortcut.
## Library of Congress — National Screening Room
- **URL:** https://www.loc.gov/collections/national-screening-room/
- **What:** Curated LOC moving-image collection, 1890–1999 (The Great Train Robbery, pre/post-1906 San Francisco footage, D.W. Griffith shorts, All-American News newsreels, the 1964 "Daisy Girl" ad, early gay-pride footage). Most titles downloadable as ~5MB MP4 and ProRes 422 MOV.
- **License:** MIXED. Loc's own open-content policy describes the room as "free to use and reuse motion pictures" — but per LOC, the room mixes public-domain titles with copyrighted titles included by permission (copyrighted ones are stream-only). The per-item "Rights and Access"/"Rights Advisory" statement is authoritative.
- **Verdict:** Commercial-safe ONLY for titles whose Rights Advisory says "public domain" or "no known copyright restrictions." Per-title check required; stream-only titles are prototype-only.
- **Notes:** Higher curation quality than archive.org; ProRes masters useful for grading. Watch underlying rights (music, underlying literary works) even on PD prints.
## NASA Image and Video Library
- **URL:** https://images.nasa.gov (usage terms: https://www.nasa.gov/nasa-brand-center/images-and-media/)
- **What:** 140,000+ searchable NASA images, videos and audio (launches, missions, Earth science); multiple resolutions, downloadable caption files on videos, embed support.
- **License:** NASA content "generally not subject to copyright in the United States" (federal). Restrictions: NASA insignia/worm/seal may NOT be used without permission; don't imply NASA endorsement; third-party material marked on NASA pages stays with its owner; identifiable people raise publicity/privacy rights.
- **Verdict:** Commercial-safe in the US for genuine NASA-produced media with guidelines observed (no logos, no endorsement, credit NASA). Verify per item for third-party-marked content.
- **Notes:** Complements the round-2 NASA 3D resources entry (models). Great for futuristic district interstitials and "broadcast" texture in promos.
## FedFlix (Public.Resource.Org / NTIS on archive.org)
- **URL:** https://archive.org/details/FedFlix
- **What:** 5,000+ US-government documentary films digitized by Public.Resource.Org for the National Technical Information Service — training films, national parks, civil defense, USIA public-diplomacy films, Postal Inspectors, Fire Academy.
- **License:** Public domain — "free of known copyright restrictions... free to use this material without restriction." Verified per-item `licenseurl` fields on archive.org metadata (e.g. Duck and Cover 1951 carries `creativecommons.org/licenses/publicdomain` plus 17 U.S.C. 105 as a federal work).
- **Verdict:** Commercial-safe. Still verify the item's `licenseurl`/`rights` field per title (collection contains some CC items alongside PD).
- **Notes:** Strong source for retro/period B-roll and in-game TV flavor. The per-item metadata check is the same discipline as the Feature Films entry.
## Wikimedia Commons — video archive
- **URL:** https://commons.wikimedia.org (reuse guide: https://commons.wikimedia.org/wiki/Commons:Simple_media_reuse_guide)
- **What:** ~146M freely-licensed media files including video (.webm/.ogv) — city footage, crowds, nature, historical clips. Every file MUST be freely licensed or PD (strict upload requirement, community-enforced). Timed-text subtitle files available per language.
- **License:** Per-file: CC0, CC BY, or CC BY-SA (mostly). All allow commercial use + derivatives; CC BY requires credit; CC BY-SA requires attribution AND share-alike on derivatives.
- **Verdict:** Commercial-safe for CC0/CC BY (credit the author). AVOID CC BY-SA clips in promos — share-alike arguably reaches the rendered video as a derivative.
- **Notes:** Search by category/gallery. License info lives on each file's description page — check per file. Good hunting ground for crowd B-roll plates and city establishing shots.
## Pixabay Videos
- **URL:** https://pixabay.com/service/license/
- **What:** 100,000+ community-contributed HD/4K video clips (backgrounds, time-lapses, people, animations) plus free music/SFX. Filterable by resolution/orientation/effects. Free API available.
- **License:** Pixabay Content License — free for commercial and non-commercial use, NO attribution required. Prohibited: selling unaltered copies, redistributing clips on other stock platforms, implying endorsement by depicted subjects/brands.
- **Verdict:** Commercial-safe for rendered videos (don't resell raw clips or run a competing stock service). Terms prohibit permanent hotlinking — download and rehost.
- **Notes:** Biggest free library, but community-contributed = quality varies. One-stop for clip + music + SFX sourcing. Free API key at pixabay.com/api/docs/.
## Pexels Videos
- **URL:** https://www.pexels.com/license/
- **What:** Millions of free HD/4K stock videos and photos; strong curated library, instant previews, orientation/resolution filters. Free API (200 req/hr, key at pexels.com/api).
- **License:** Pexels License — free for personal AND commercial use, NO attribution required. Prohibited: selling unaltered copies, portraying people offensively, implying endorsement.
- **Verdict:** Commercial-safe (no standalone redistribution — clips only inside rendered videos, which is our use).
- **Notes:** API: `curl -H "Authorization: $PEXELS_KEY" "https://api.pexels.com/videos/search?query=...&per_page=15"` → `video_files[]` with per-resolution MP4 links. Curated quality is higher than Pixabay on average — good for hero B-roll plates.
## Coverr
- **URL:** https://coverr.co/license
- **What:** Curated free stock video focused on clean backgrounds and hero footage (nature, tech, urban, aerial). Smaller than Pixabay/Pexels but consistently high quality.
- **License:** Coverr license — free for commercial and non-commercial use, no attribution required. Prohibited: reselling, offering clips as part of services or stock sites, trademark/logo misuse.
- **Verdict:** Commercial-safe for rendered promos. Note the "can't offer as part of services" clause — fine for us (final MP4s, not a clip library), but don't bundle raw Coverr clips into any downloadable tool.
- **Notes:** Best use: atmospheric background plates and looping textures behind title cards. Quality-over-quantity alternative to Pixabay.
## Mixkit (Envato)
- **URL:** https://mixkit.co/license/
- **What:** Free curated stock video, music, SFX, and Premiere Pro / After Effects templates. No sign-up, no watermark, instant download.
- **License:** TWO tiers per asset — Mixkit Free License (most assets): commercial use OK, no attribution; Mixkit Restricted License (some clips): personal/educational ONLY, no ads/company social/commercial YouTube. CHECK THE LICENSE ON EACH DOWNLOAD.
- **Verdict:** Commercial-safe for Free-License assets only. Restricted-license clips are prototype/personal only.
- **Notes:** Also supplies free title/lower-third templates (Premiere + AE; no Resolve/FCP templates). Music license excludes games/broadcast — use only in the promo videos, not the game.
