# AshLane Game Identity Audit — 2026-10-06

**Binding identity (owner):** AshLane = Urban Reign-style STREET brawler. NOT a
wrestling game, NOT Bannon. Wrestling is the spice, not the dish (~5-10% of
presentation): wrestling moves in the moveset (suplexes/DDTs on concrete —
very Urban Reign), wrestling arenas as LOCATIONS, wrestling matches playable
in those spots, wrestler factions with their promo/backstage flavor.

**Calibration:** Characters who ARE wrestling-industry by "Off The Top Rope"
book canon (El Toro de Oro, Static, Hollow, others) keep their wrestling
moves, promos, and wrestling-world flavor. That's who they are. Don't scrub
wrestling from the wrestlers — fix the game's DEFAULT posture.

## What was already street (kept)

- **Menus:** "Story — take the jobs", "Walk the ward", "Pick a block",
  "The jobs", "Who walks in", "Scrap street", "Cinder Ward" — correct.
- **Campaign (`src/game3d/campaign.ts`):** jobs, blocks, crews, turf, purses,
  "The block hears who won." Correct throughout. The ring appears only as a
  LOCATION ("The ropes", east of the pier) — exactly right.
- **Stage select header:** "Urban Reign-style quick fight setup." Correct.
- **Banners:** "Slammed on the car", "The car caves in", "Roof caves" — street.
- **Announcer voice samples** exist but are NOT wired into default flow —
  correct as wrestling-arena-location assets.
- **Voice profiles:** character-appropriate; Static's wrestling flavor is
  correct FOR HIM.

## What was wrestling-framed by default (fixed)

| Location | Was | Now | Why |
|---|---|---|---|
| `ashlane-app.tsx` menu | "Exhibition" | "Throw down" | Wrestling-match term as default mode |
| `ashlane-app.tsx` arenas | "Exhibition here" | "Throw down here" | Same |
| `ashlane-app.tsx` arenas | "…use a ring in the middle of it" | "…clear the middle of the block" | Ring is not the default; rings live at wrestling spots |
| `ashlane-app.tsx` post-win | "Card's down" / "Exhibition clear" | "They're down" / "Block taken" | "Card" = fight card; post-win = territory |
| `ashlane-app.tsx` objective | "Exhibition. One card in the ring." | "Throwdown. One of theirs in the middle." | Same |
| `sim.ts` bout foe | `foe.name = "The card"` | foe keeps generated street name | Grunts already get street names (Cinder, Bolt, Moth…) |
| `sim.ts` bout banner | "Exhibition." | "Throwdown." | Bout start |
| `sim.ts` bout-done | "Exhibition clear" | "Block taken" | Bout end = territory |
| `cinematics.ts` | `entranceShots`, "fighter entrances", "entrance-kit" | `arrivalShots`, "block arrivals / roll-ups" | Bannon-era wrestling language for in-engine pre-fight |
| `docs/FREE_APIS_AND_PUBLIC_DOMAIN.md` | entrance-kit preset ref | arrival preset ref | Doc consistency |

Internal keys (`startBout("exhibit")`, `bout: "exhibit"`) kept — renaming them
risks breaking other workers' checkouts; only player-visible text changed.

## What stays wrestling (per calibration)

- Wrestler characters' promos, interviews, moves, flavor (El Toro, Static,
  Hollow) — ~5-10% of presentation, authentic to who they are.
- Wrestling arenas as locations; wrestling matches playable in those spots.
- Announcer samples for wrestling-arena use.
- The El Toro de Oro promo pipeline's entrance-kit concept — that's a PROMO
  for a wrestler character, which is correct.

## Open / handed off

- Dialogue system (`round6/physics-vfx` branch): situations were
  wrestling-heavy (promo/backstage/weighin/title); street expansion in flight
  by a separate worker. Wrestler-character banks stay as-is per calibration.
- Voice samples `static_prematch.wav` / `static_postwin.wav`: correct FOR
  STATIC (wrestler). Default prematch/postwin for non-wrestler contexts should
  use street framing when those flows get voice.
