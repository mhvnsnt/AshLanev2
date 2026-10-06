# WORLD CONNECTIONS

## Art Direction

**CRITICAL:** Each district has its own visual identity. See
[DISTRICT_ART_DIRECTION.md](./DISTRICT_ART_DIRECTION.md) before dressing any stage.

The green/purple/blue neon palette belongs to the **Downtown Rooftop District only**.
Other districts: Marquee Mile (magenta/cyan), Industrial (rust/gray daylight),
Waterfront (cold blue fog), Projects (sodium orange dusk), Underground
(fluorescent green-white), Outskirts (dust brown), Suburbs (too-clean daylight).

--- — How Stages Connect to the Open World

**Vision:** Urban Reign-style stage select for quick fights. But in story/open-world
mode, every stage is a physical place in one continuous city you travel between.
No loading screens between districts — walk, drive, or take the subway.

## District Map

### DOWNTOWN
| Stage | Connection |
|-------|-----------|
| **RING SQUARE** (wrestling ring) | Inside the **Downtown Arena** building. Enter through the main doors on Arena Plaza. The arena dome skybox (`Arena.glb`) is the exterior city panorama. |
| **BACKSTAGE** | Behind the arena — same building, through the wrestler entrance tunnel. Story fights that start backstage can spill into the ring. |
| **ROOFTOP** | Top of the arena tower / adjacent high-rise. Accessible via stairwell or fire escape. Vertical combat space. |

### DOWNTOWN STRIP (entertainment district)
| Stage | Connection |
|-------|-----------|
| **THE BAR** | Corner bar on the strip. Neon sign outside. Bar fights spill onto the sidewalk. |
| **BOXING GYM** | Upstairs gym above a storefront. Training + grudge matches. |
| **ARCADE** | Neon arcade on the strip. Late-night brawls. |
| **HOTEL LOBBY** | Grand hotel on the strip. Five-star beatdowns. |
| **STUDIO** | TV/film studio. "Lights, camera, violence" — some fights are staged for cameras. |

### DOWNTOWN CIVIC
| Stage | Connection |
|-------|-----------|
| **POLICE YARD** | Impound lot behind the precinct. Authority faction territory — fighting here draws heat. |
| **HOSPITAL** | City hospital. You'll need a room after. |

### THE PROJECTS
| Stage | Connection |
|-------|-----------|
| **STREET COURT** (basketball) | Center of the projects courtyard. Chain nets, no refs. Neutral ground for crew meetups. |

### UNDERGROUND
| Stage | Connection |
|-------|-----------|
| **SUBWAY** | The transit system connecting ALL districts. Subway entrances in every district lead here. Fast travel + ambush fights on platforms. |

### INDUSTRIAL
| Stage | Connection |
|-------|-----------|
| **WORKSHOP** | Machine shop in the industrial zone. Tools everywhere — environmental weapons. |

### WATERFRONT
| Stage | Connection |
|-------|-----------|
| **BRIDGE** | The bridge connecting downtown to the industrial/waterfront area. Chokepoint — faction wars happen here. |

### OUTSKIRTS
| Stage | Connection |
|-------|-----------|
| **PRISON YARD** | County lockup on the outskirts. Story missions only — you don't walk here casually. |
| **TRAILER PARK** | Outskirts settlement. Rust, gravel, grudges. |
| **CEMETERY** | Outskirts cemetery. Night fights among the stones. |

### SUBURBS
| Stage | Connection |
|-------|-----------|
| **SCHOOL YARD** | Suburban school. After-hours fights. Quieter faction presence. |

## Travel System (design)

- **On foot:** Adjacent districts connect via streets/alleys. Seamless.
- **Subway:** Enter any station → ride to any other station. Fast travel with loading mask (tunnel animation).
- **Bridge:** The single chokepoint between downtown and waterfront/industrial. Contested in faction wars.
- **Rooftops:** Connected via planks/fire escapes in downtown. Parkour routes.

## Faction Territory Overlays

Each district has a default faction owner (see city generator docs). When ownership
changes, the stage's atmosphere changes:
- Neon sign colors shift to the owner's colors
- Graffiti/tags update
- Lighting tint shifts
- Ambient NPCs change (faction soldiers patrol)

Stages don't need separate variants — the territory system re-skins them live.

## Stage Select vs Open World

| Mode | How stages work |
|------|----------------|
| **Quick Fight** | Pick any stage from the grid. Instant load. No travel. |
| **Story** | Stages unlock as you discover their districts. You walk in. |
| **Faction War** | Contested districts change hands. Stage atmosphere follows. |

## Technical Notes

- Stage GLBs live in `public/models/stages/`
- Props in `public/models/stages/props/` — placed per the `props` array in `stage-catalog.ts`
- Skybox domes (e.g., `Arena.glb`) render inside-out — camera must be inside the dome
- MDickie stages are low-poly by design — they run fast on mobile
- Stage bounds in the catalog define the fight area; the game clamps fighters inside
