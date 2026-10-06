# DISTRICT ART DIRECTION

**Owner rule (2026-10-06):** The green/purple/gold/blue neon palette is the
**Downtown Rooftop District** identity — NOT the whole game's look. Every
district has its own visual identity. Each district should FEEL different.

## The Rule

When building or dressing any stage, check this doc first. Ask: **which
district is this in?** Then use THAT district's palette, lighting, weather,
and mood. Never default to neon-noir unless you're in the rooftops.

---

## District Identities

### DOWNTOWN ROOFTOPS — "Neon Noir"
- **Palette:** Purple `#b537f2` / Green `#39ff6e` / Blue `#28c8ff` / Warm amber `#ffb347` practicals
- **Lighting:** Night only. Neon edge strips on buildings, glowing billboards, warm wall sconces.
- **Weather:** Rain (frequent), lightning storms. Wet reflective rooftops.
- **Mood:** Cyberpunk-noir. High above the city, nowhere to run.
- **Signature stage:** NEON ROOFTOP (built from stage-rooftop-night.webp concept)
- **Faction note:** Neutral ground — no single faction owns the sky.

### DOWNTOWN STRIP — "Marquee Mile"
- **Palette:** Hot magenta `#ff2d78` / Cyan `#00e5ff` / Warm white marquee bulbs `#fff3d6`
- **Lighting:** Night. Theater marquees, bar signs, arcade glow spilling onto sidewalks.
- **Weather:** Clear nights, occasional drizzle.
- **Mood:** Loud, crowded, electric. The city's playground.
- **Stages:** THE BAR, BOXING GYM, ARCADE, HOTEL LOBBY, STUDIO

### DOWNTOWN CIVIC — "Cold Authority"
- **Palette:** Steel blue `#4a6fa5` / Fluorescent white `#e8f0ff` / Hazard yellow `#ffd23f` accents
- **Lighting:** Harsh fluorescents, police cruiser lightbars (red/blue strobe).
- **Weather:** Overcast, cold.
- **Mood:** Oppressive, surveilled. The Authority faction's home turf.
- **Stages:** POLICE YARD, HOSPITAL
- **Faction note:** Authority faction territory — clean, no graffiti, cameras everywhere.

### THE PROJECTS — "Sodium Dusk"
- **Palette:** Sodium orange `#ff9a3c` / Deep shadow brown `#2a1a0f` / Faded teal `#2a7f6f` (peeling paint)
- **Lighting:** Dusk into night. Orange streetlights, windows glowing warm.
- **Weather:** Humid evenings, heat haze in summer.
- **Mood:** Lived-in, tight-knit, wary of outsiders. Laundry lines, stoops, corner stores.
- **Stages:** STREET COURT
- **Faction note:** Heavy graffiti — every wall tells you who runs the block.

### INDUSTRIAL — "Rust Belt Day"
- **Palette:** Rust orange `#b5541e` / Concrete gray `#8a8a8a` / Safety yellow `#e8b923` / Oil-stain black
- **Lighting:** Harsh daylight through dusty air. God rays in warehouses.
- **Weather:** Hot, hazy days. Dust motes.
- **Mood:** Grimy, working-class, dangerous machinery. Everything is a weapon.
- **Stages:** WORKSHOP
- **Faction note:** Contested — no one faction holds the industrial zone for long.

### WATERFRONT — "Cold Blue Fog"
- **Palette:** Steel blue `#3a6b8a` / Fog gray `#9aa5a8` / Sodium dock lamps `#ffb347` / Deep water green `#1a3a2a`
- **Lighting:** Night/dawn. Fog diffuses everything. Ship lights on the horizon.
- **Weather:** Fog (heavy), sea mist, cold rain.
- **Mood:** Isolated, melancholic, secrets. Foghorns. Containers like canyons.
- **Stages:** BRIDGE
- **Faction note:** Smuggler territory — Combine faction moves product through here.

### UNDERGROUND — "Fluorescent Tomb"
- **Palette:** Fluorescent green-white `#d6ffe0` / Concrete gray `#6a6a6a` / Warning red `#cc2222` / Darkness
- **Lighting:** Flickering fluorescents, emergency lighting, train headlights in tunnels.
- **Weather:** N/A (underground). Dripping water, stale air.
- **Mood:** Claustrophobic, liminal. Graffiti tunnels, buskers, things that live below.
- **Stages:** SUBWAY
- **Faction note:** Hollows faction territory — they own what's beneath.

### OUTSKIRTS — "Dust and Bone"
- **Palette:** Dust brown `#8a7355` / Faded green `#5a6b4a` / Bone white `#e0d8c0` / Blood red `#8a1a1a` accents
- **Lighting:** Harsh daylight or moonlit night. Long shadows.
- **Weather:** Dry, windy. Dust devils.
- **Mood:** Forgotten, desolate. Places the city pretends don't exist.
- **Stages:** PRISON YARD, TRAILER PARK, CEMETERY
- **Faction note:** Ashes faction territory — outcasts and exiles.

### SUBURBS — "Too Clean"
- **Palette:** Lawn green `#4a8a3a` / Sky blue `#87ceeb` / Suburban beige `#d4c5a0` / Red brick `#a04434`
- **Lighting:** Bright daylight or golden hour. Everything is well-lit (suspiciously so).
- **Weather:** Clear, pleasant. The weather is always nice here (that's the point).
- **Mood:** Uncanny. Too quiet, too clean. Something is wrong behind the picket fences.
- **Stages:** SCHOOL YARD
- **Faction note:** No visible faction presence — which means someone is hiding.

---

## Faction Visual Language

| Faction | Colors | Tag style | Territory cleanliness |
|---------|--------|-----------|----------------------|
| Ashes | Scarlet red, black | Burn marks, ash handprints | Scorched, damaged |
| Combine | Gold, navy | Corporate logos, QR codes | Pristine, surveilled |
| Hollows | Orange, deep shadow | Carved symbols, tunnel marks | Dark, hidden |
| Unaffiliated | Mixed/none | Random tags, faded | Varied |
| Authority | Steel blue, white | Official signage, warnings | Spotless, no graffiti |

When a faction takes over a district, blend their colors into the district's
base palette over ~5 seconds. Don't replace — **blend**. The district identity
stays; the faction is a layer on top.

## Implementation Checklist

For each new stage:
- [ ] Identify its district from WORLD_CONNECTIONS.md
- [ ] Look up the district palette above
- [ ] Set lighting, fog, and sky to match — NOT the neon default
- [ ] Add district-appropriate props and graffiti level
- [ ] If faction-owned, layer faction colors as a blend, not a replacement
- [ ] Render a thumbnail and check: does this FEEL like its district?
