// tools/city/shots/entry.ts
import * as THREE10 from "three";

// src/game3d/city/districts.ts
var CITY_DISTRICTS = {
  "neon-district": {
    id: "neon-district",
    name: "Neon District",
    base: "rooftops",
    skyBase: "strip",
    tagline: "Neon Noir. The only green/purple zone in the city \u2014 neutral ground.",
    homeFaction: "unaffiliated",
    palette: {
      ground: 2763312,
      road: 1842210,
      buildingTones: [3816004, 3289660, 4473934, 3552832],
      accent: 3800942,
      lampColor: 11876338,
      fogColor: 1314844,
      ambient: 6969994,
      hemiGround: 1710622
    },
    fogNear: 20,
    fogFar: 110,
    neon: 1,
    graffiti: 0.35,
    propDensity: 0.7,
    weather: "rain",
    timeOfDay: "night",
    grid: [0, 0]
  },
  "marquee-mile": {
    id: "marquee-mile",
    name: "Marquee Mile",
    base: "strip",
    skyBase: "strip",
    tagline: "Hot magenta marquees and cyan arcade glow. The city's playground.",
    homeFaction: "unaffiliated",
    palette: {
      ground: 3354682,
      road: 2368040,
      buildingTones: [4864586, 4009789, 5587029, 4338242],
      accent: 16723320,
      lampColor: 16774102,
      fogColor: 1446426,
      ambient: 9071226,
      hemiGround: 1972768
    },
    fogNear: 18,
    fogFar: 95,
    neon: 0.95,
    graffiti: 0.3,
    propDensity: 0.65,
    weather: "clear",
    timeOfDay: "night",
    grid: [1, 0]
  },
  "civic": {
    id: "civic",
    name: "Civic Center",
    base: "warehouses",
    skyBase: "warehouses",
    tagline: "Cold Authority. Harsh fluorescents, surveilled, spotless.",
    homeFaction: "authority",
    palette: {
      ground: 3817544,
      road: 3028028,
      buildingTones: [5925498, 5003880, 6713983, 5529194],
      accent: 4878245,
      lampColor: 15266047,
      fogColor: 1712168,
      ambient: 8030874,
      hemiGround: 2237996
    },
    fogNear: 22,
    fogFar: 100,
    neon: 0.1,
    graffiti: 0,
    propDensity: 0.5,
    weather: "overcast",
    timeOfDay: "day",
    grid: [1, 1]
  },
  "projects": {
    id: "projects",
    name: "The Projects",
    base: "alleys",
    skyBase: "alleys",
    tagline: "Sodium Dusk. Orange streetlights, warm windows, every wall tells you who runs the block.",
    homeFaction: "ashes",
    palette: {
      ground: 3024416,
      road: 2367e3,
      buildingTones: [7031354, 5914420, 7624778, 5192240],
      accent: 16751164,
      lampColor: 16751164,
      fogColor: 1840144,
      ambient: 9071178,
      hemiGround: 2365970
    },
    fogNear: 14,
    fogFar: 70,
    neon: 0.15,
    graffiti: 0.95,
    propDensity: 0.85,
    weather: "clear",
    timeOfDay: "dusk",
    grid: [-1, 0]
  },
  "industrial": {
    id: "industrial",
    name: "The Yards",
    base: "warehouses",
    skyBase: "warehouses",
    tagline: "Rust Belt Day. Harsh daylight, dust, cranes. Contested \u2014 nobody holds it long.",
    homeFaction: "combine",
    palette: {
      ground: 4866616,
      road: 3814444,
      buildingTones: [8022618, 7036238, 8746343, 7628118],
      accent: 11883550,
      lampColor: 16773328,
      fogColor: 2761756,
      ambient: 11049594,
      hemiGround: 4866100
    },
    fogNear: 30,
    fogFar: 140,
    neon: 0.05,
    graffiti: 0.25,
    propDensity: 0.9,
    weather: "clear",
    timeOfDay: "day",
    grid: [0, 1]
  },
  "waterfront": {
    id: "waterfront",
    name: "The Waterfront",
    base: "warehouses",
    skyBase: "warehouses",
    tagline: "Cold Blue Fog. Containers like canyons, foghorns, secrets.",
    homeFaction: "combine",
    palette: {
      ground: 3029568,
      road: 2371124,
      buildingTones: [3820114, 3292742, 4477530, 3555914],
      accent: 3828618,
      lampColor: 16757575,
      fogColor: 2304558,
      ambient: 5925490,
      hemiGround: 1975336
    },
    fogNear: 6,
    fogFar: 55,
    neon: 0.1,
    graffiti: 0.3,
    propDensity: 0.8,
    weather: "fog",
    timeOfDay: "dawn",
    grid: [0, -1]
  },
  "underground": {
    id: "underground",
    name: "The Tunnels",
    base: "subway",
    skyBase: "subway",
    tagline: "Fluorescent Tomb. Hollows domain \u2014 what happens below stays below.",
    homeFaction: "hollows",
    palette: {
      ground: 1842716,
      road: 1579544,
      buildingTones: [3816504, 3290160, 4211262, 3553332],
      accent: 14090208,
      lampColor: 14090208,
      fogColor: 658442,
      ambient: 4870728,
      hemiGround: 1053200
    },
    fogNear: 8,
    fogFar: 45,
    neon: 0.1,
    graffiti: 0.7,
    propDensity: 0.5,
    weather: "clear",
    timeOfDay: "night",
    grid: [0, 0]
    // vertical layer, see underground.ts
  },
  "outskirts": {
    id: "outskirts",
    name: "The Outskirts",
    base: "park",
    skyBase: "park",
    tagline: "Dust and Bone. Forgotten places the city pretends don't exist.",
    homeFaction: "ashes",
    palette: {
      ground: 4865840,
      road: 3813926,
      buildingTones: [7036234, 6115648, 7693906, 6642248],
      accent: 9050650,
      lampColor: 14735552,
      fogColor: 2366996,
      ambient: 10127978,
      hemiGround: 3813926
    },
    fogNear: 35,
    fogFar: 160,
    neon: 0,
    graffiti: 0.4,
    propDensity: 0.4,
    weather: "windy",
    timeOfDay: "day",
    grid: [-1, -1]
  },
  "suburbs": {
    id: "suburbs",
    name: "The Suburbs",
    base: "park",
    skyBase: "park",
    tagline: "Too Clean. Bright, quiet, well-lit \u2014 suspiciously so.",
    homeFaction: "unaffiliated",
    palette: {
      ground: 3824180,
      road: 3815996,
      buildingTones: [13944224, 10503220, 12891280, 9060400],
      accent: 8900331,
      lampColor: 16775400,
      fogColor: 2106410,
      ambient: 11584720,
      hemiGround: 3820090
    },
    fogNear: 40,
    fogFar: 180,
    neon: 0,
    graffiti: 0,
    propDensity: 0.3,
    weather: "clear",
    timeOfDay: "day",
    grid: [1, -1]
  }
};
var CITY_DISTRICT_IDS = Object.keys(CITY_DISTRICTS);
function toWorldgenDef(d) {
  return {
    id: d.base,
    name: d.name,
    faction: d.homeFaction,
    tagline: d.tagline,
    streetWidth: 10,
    blockSize: 34,
    buildingHeight: d.base === "rooftops" ? [12, 30] : d.base === "alleys" ? [8, 20] : d.base === "subway" ? [4, 8] : [8, 24],
    ground: d.palette.ground,
    road: d.palette.road,
    buildingTones: d.palette.buildingTones,
    accent: d.palette.accent,
    lampColor: d.palette.lampColor,
    fogColor: d.palette.fogColor,
    fogNear: d.fogNear,
    fogFar: d.fogFar,
    ambient: d.palette.ambient,
    graffiti: d.graffiti,
    neon: d.neon,
    propDensity: d.propDensity
  };
}
var DISTRICT_SPACING = 130;
function districtWorldPos(id) {
  const d = CITY_DISTRICTS[id];
  return [d.grid[0] * DISTRICT_SPACING, d.grid[1] * DISTRICT_SPACING];
}

// src/game3d/city/factions.ts
var FACTION_VISUALS = {
  ashes: {
    id: "ashes",
    name: "The Ashes",
    tagline: "Outcasts and exiles. Burn marks and ash handprints.",
    colors: [14964526, 1710618],
    marker: {
      kind: "armband",
      accent: 14964526,
      detail: 1710618,
      symbol: "ash-hand",
      placement: "left upper arm",
      wear: "charred cloth armband, scarlet. Each member's clothes are their own \u2014 the armband is the only shared piece."
    },
    tagStyle: "burn",
    cleanliness: 0.25,
    tagDensity: 0.9
  },
  combine: {
    id: "combine",
    name: "The Combine",
    tagline: "Corporate power. Gold lapel pins, navy accents.",
    colors: [13934615, 1452095],
    marker: {
      kind: "lapel-pin",
      accent: 13934615,
      detail: 1452095,
      symbol: "hex-k",
      placement: "left lapel",
      wear: "gold hexagonal lapel pin. Members dress corporate-casual or tactical \u2014 the pin is the tell."
    },
    tagStyle: "corporate",
    cleanliness: 0.95,
    tagDensity: 0.15
  },
  hollows: {
    id: "hollows",
    name: "The Hollows",
    tagline: "They own what's beneath. Bone charms, carved symbols.",
    colors: [13396506, 789522],
    marker: {
      kind: "charm",
      accent: 13396506,
      detail: 15259824,
      symbol: "spiral-eye",
      placement: "neck cord",
      wear: "carved bone charm on a cord, orange thread binding. Members dress dark and layered \u2014 the charm catches light."
    },
    tagStyle: "carved",
    cleanliness: 0.4,
    tagDensity: 0.6
  },
  authority: {
    id: "authority",
    name: "The Authority",
    tagline: "Cold order. Steel-blue stripe, official signage.",
    colors: [4878245, 15266047],
    marker: {
      kind: "stripe",
      accent: 4878245,
      detail: 15266047,
      symbol: "shield-check",
      placement: "right shoulder stripe",
      wear: "thin steel-blue shoulder stripe. Members wear uniforms or plainclothes \u2014 the stripe is the tell."
    },
    tagStyle: "official",
    cleanliness: 1,
    tagDensity: 0
  },
  painted: {
    id: "painted",
    name: "The Painted",
    tagline: "Wildstyle color. Paint-splatter bandana.",
    colors: [16723592, 58879],
    marker: {
      kind: "bandana",
      accent: 16723592,
      detail: 58879,
      symbol: "splat",
      placement: "wrist wrap",
      wear: "paint-splatter wrist wrap. Members dress loud and varied \u2014 the wrap is the tell."
    },
    tagStyle: "wildstyle",
    cleanliness: 0.5,
    tagDensity: 1
  },
  unaffiliated: {
    id: "unaffiliated",
    name: "Unaffiliated",
    tagline: "No colors. No marker.",
    colors: [10132122],
    marker: {
      kind: "none",
      accent: 10132122,
      detail: 10132122,
      symbol: "",
      placement: "",
      wear: "No marker. Random faded tags, varied dress."
    },
    tagStyle: "faded",
    cleanliness: 0.6,
    tagDensity: 0.3
  }
};

// src/game3d/city/territory.ts
import * as THREE6 from "three";

// src/game3d/worldgen.ts
import * as THREE5 from "three";

// src/game3d/worldgen-buildings.ts
import * as THREE2 from "three";

// src/game3d/worldgen-textures.ts
import * as THREE from "three";
function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}
function toTexture(c, repeatX = 1, repeatY = 1) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function hex(n) {
  return "#" + n.toString(16).padStart(6, "0");
}
function grime(ctx, rng, w, h, count, alpha) {
  for (let i = 0; i < count; i++) {
    const x = rng.range(0, w), y = rng.range(0, h), r = rng.range(4, 40);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = rng.chance(0.7);
    g.addColorStop(0, dark ? `rgba(10,8,8,${alpha})` : `rgba(200,190,170,${alpha * 0.5})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
function asphaltTexture(rng, base = "#232326") {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2500; i++) {
    const v = rng.int(18, 58);
    ctx.fillStyle = `rgb(${v},${v},${v + rng.int(0, 6)})`;
    ctx.fillRect(rng.int(0, 255), rng.int(0, 255), 1.5, 1.5);
  }
  ctx.strokeStyle = "rgba(8,8,10,0.7)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let x = rng.range(0, 256), y = rng.range(0, 256);
    ctx.moveTo(x, y);
    for (let s = 0; s < 8; s++) {
      x += rng.range(-30, 30);
      y += rng.range(-30, 30);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "rgba(12,12,14,0.5)";
    ctx.fillRect(rng.int(0, 200), rng.int(0, 200), rng.int(30, 80), rng.int(20, 50));
  }
  grime(ctx, rng, 256, 256, 24, 0.14);
  return toTexture(c, 8, 8);
}
function brickTexture(rng, base = "#6b4a3a") {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = "#2a2422";
  ctx.fillRect(0, 0, 256, 256);
  const bh = 16, bw = 42;
  const baseC = new THREE.Color(base);
  for (let row = 0; row < 256 / bh; row++) {
    const off = row % 2 * (bw / 2);
    for (let col = -1; col < 256 / bw + 1; col++) {
      const v = rng.range(0.82, 1.12);
      const cc = baseC.clone().multiplyScalar(v);
      ctx.fillStyle = hex(cc.getHex());
      ctx.fillRect(col * bw + off + 1, row * bh + 1, bw - 2, bh - 2);
      if (rng.chance(0.12)) {
        ctx.fillStyle = "rgba(15,10,8,0.35)";
        ctx.fillRect(col * bw + off + 1, row * bh + 1, bw - 2, bh - 2);
      }
    }
  }
  grime(ctx, rng, 256, 256, 30, 0.16);
  return toTexture(c, 2, 2);
}
function facadeTexture(rng, opts) {
  const W = 256, H = 256;
  const [c, ctx] = makeCanvas(W, H);
  ctx.fillStyle = opts.base;
  ctx.fillRect(0, 0, W, H);
  const cw = W / opts.cols, ch = H / opts.floors;
  for (let f = 0; f < opts.floors; f++) {
    for (let col = 0; col < opts.cols; col++) {
      const x = col * cw + cw * 0.22, y = f * ch + ch * 0.2;
      const w = cw * 0.56, h = ch * 0.6;
      const lit = rng.next() < opts.litRatio;
      if (lit) {
        const warm = opts.warm;
        const hue = warm ? rng.int(28, 45) : rng.int(195, 215);
        ctx.fillStyle = `hsl(${hue}, 70%, ${rng.int(55, 72)}%)`;
      } else {
        const v = rng.int(12, 30);
        ctx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
      }
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(10,10,12,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      if (lit && rng.chance(0.4)) {
        ctx.fillStyle = "rgba(20,16,14,0.45)";
        ctx.fillRect(x, y, w * rng.range(0.3, 0.7), h);
      }
    }
  }
  grime(ctx, rng, W, H, 36, 0.12);
  return toTexture(c, 1, 1);
}
var ASHES_TAGS = ["ASHES", "EMBER", "RISE", "CINDER", "BURN", "WARD 7", "NO KINGS"];
var COMBINE_SIGNS = ["KENNEDY CORP", "MERIDIAN CROSSING", "PRIVATE PROPERTY", "SECURED BY KCS", "NO TRESPASS"];
var HOLLOWS_TAGS = ["HOLLOW", "EMPTY", "THE QUIET", "LISTEN", "BELOW", "IT SEES"];
var PAINTED_TAGS = ["PAINT", "CLOWN", "SMILE", "FREAK", "HAHA"];
function tagFor(faction, rng) {
  switch (faction) {
    case "ashes":
      return rng.pick(ASHES_TAGS);
    case "combine":
      return rng.pick(COMBINE_SIGNS);
    case "hollows":
      return rng.pick(HOLLOWS_TAGS);
    case "painted":
      return rng.pick(PAINTED_TAGS);
    default:
      return rng.pick([...ASHES_TAGS, ...HOLLOWS_TAGS]);
  }
}
function graffitiTexture(rng, faction, text) {
  const [c, ctx] = makeCanvas(256, 128);
  ctx.clearRect(0, 0, 256, 128);
  const t = text ?? tagFor(faction, rng);
  ctx.font = `bold ${rng.int(38, 56)}px Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const colors = {
    ashes: ["#e4572e", "#ff7b3d", "#f0b429"],
    combine: ["#2e9bff", "#7cc4ff"],
    hollows: ["#9d4edd", "#6a2c91", "#c77dff"],
    painted: ["#ff2e88", "#00e5ff", "#aaff00"],
    unaffiliated: ["#cccccc", "#999999"],
    authority: ["#2e9bff", "#ffffff"]
  };
  const col = rng.pick(colors[faction]);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = col + "22";
    const a = rng.range(0, Math.PI * 2), r = rng.range(20, 70);
    ctx.fillRect(128 + Math.cos(a) * r - 2, 64 + Math.sin(a) * r * 0.5 - 2, 4, 4);
  }
  ctx.save();
  ctx.translate(128, 64);
  ctx.rotate(rng.range(-0.08, 0.08));
  ctx.fillStyle = col;
  ctx.fillText(t, 0, 0);
  ctx.restore();
  ctx.fillStyle = col + "aa";
  for (let i = 0; i < rng.int(2, 6); i++) {
    const x = rng.range(40, 216);
    ctx.fillRect(x, rng.range(70, 90), 3, rng.range(8, 30));
  }
  ctx.save();
  ctx.translate(128, 64);
  ctx.rotate(-0.02);
  ctx.strokeStyle = "rgba(0,0,0,0.85)";
  ctx.lineWidth = 5;
  ctx.strokeText(t, 0, 0);
  ctx.fillStyle = col;
  ctx.fillText(t, 0, 0);
  ctx.restore();
  const tex = toTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
function neonSignTexture(rng, text, color = "#00e5ff") {
  const [c, ctx] = makeCanvas(256, 96);
  ctx.fillStyle = "#0a0a0e";
  ctx.fillRect(0, 0, 256, 96);
  ctx.font = "bold 44px 'Arial Narrow', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [blur, alpha] of [[18, 0.35], [10, 0.6], [4, 0.9]]) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillText(text, 128, 48);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px 'Arial Narrow', sans-serif";
  ctx.globalAlpha = 0.85;
  ctx.fillText(text, 128, 48);
  ctx.globalAlpha = 1;
  const tex = toTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
function plateSignTexture(text, sub, bg = "#1a2b4a", fg = "#dfe8f5") {
  const [c, ctx] = makeCanvas(256, 128);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 240, 112);
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.fillText(text, 128, 58);
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText(sub, 128, 92);
  const tex = toTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// src/game3d/worldgen-buildings.ts
function lam(color, map) {
  return new THREE2.MeshLambertMaterial({ color, map: map ?? null });
}
function hex2(n) {
  return "#" + n.toString(16).padStart(6, "0");
}
function generateBuilding(o) {
  const { rng, district } = o;
  const g = new THREE2.Group();
  const floors = Math.max(1, Math.round(o.h / 3.2));
  const cols = Math.max(2, Math.round(o.w / 3));
  const warm = district.id === "alleys" || district.id === "rooftops";
  const litRatio = district.id === "subway" ? 0.08 : district.id === "warehouses" ? 0.25 : 0.45;
  const facade = facadeTexture(rng, {
    floors,
    cols,
    base: hex2(o.tone),
    litRatio,
    warm
  });
  const wallMat = lam(16777215, facade);
  const sideMat = lam(
    new THREE2.Color(o.tone).multiplyScalar(0.82).getHex(),
    district.id === "alleys" ? brickTexture(rng, hex2(o.tone)) : void 0
  );
  const mass = new THREE2.Mesh(new THREE2.BoxGeometry(o.w, o.h, o.d), [sideMat, sideMat, wallMat, wallMat, sideMat, sideMat]);
  mass.position.y = o.h / 2;
  g.add(mass);
  const cap = new THREE2.Mesh(
    new THREE2.BoxGeometry(o.w + 0.3, 0.35, o.d + 0.3),
    lam(new THREE2.Color(o.tone).multiplyScalar(0.6).getHex())
  );
  cap.position.y = o.h + 0.17;
  g.add(cap);
  if (o.storefront || district.id === "strip" && rng.chance(0.7)) {
    addStorefront(g, o, rng);
  } else if (o.industrial || district.id === "warehouses") {
    addIndustrialDoor(g, o, rng);
  } else {
    addEntryDoor(g, o, rng);
  }
  if (district.id === "alleys" && o.h > 8 && rng.chance(0.65)) {
    g.add(makeFireEscape(rng, o.w * 0.5, Math.min(o.h - 3, 12)));
  }
  if (rng.chance(0.7)) {
    const n = rng.int(1, 3);
    for (let i = 0; i < n; i++) {
      const vent = new THREE2.Mesh(
        new THREE2.BoxGeometry(rng.range(0.6, 1.2), rng.range(0.5, 1), rng.range(0.6, 1.2)),
        lam(9081498)
      );
      vent.position.set(rng.range(-o.w / 3, o.w / 3), o.h + 0.5, rng.range(-o.d / 3, o.d / 3));
      g.add(vent);
    }
  }
  if ((district.id === "rooftops" || district.id === "alleys") && rng.chance(0.3)) {
    g.add(makeWaterTower(rng));
  }
  if (rng.next() < district.graffiti) {
    const tag = new THREE2.Mesh(
      new THREE2.PlaneGeometry(rng.range(2.5, 5), rng.range(1.2, 2.5)),
      new THREE2.MeshBasicMaterial({
        map: graffitiTexture(rng, district.faction),
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -1
      })
    );
    tag.position.set(rng.range(-o.w / 3, o.w / 3), rng.range(1.5, 3.5), o.d / 2 + 0.02);
    g.add(tag);
  }
  if (rng.next() < district.neon) {
    g.add(makeNeonSign(rng, o));
  }
  if (district.id === "warehouses" && rng.chance(0.6)) {
    const plate = new THREE2.Mesh(
      new THREE2.PlaneGeometry(3, 1.5),
      new THREE2.MeshBasicMaterial({
        map: plateSignTexture(
          rng.pick(["KENNEDY CORP", "MERIDIAN", "KCS LOGISTICS", "AWE HOLDINGS", "SECURED"]),
          rng.pick(["AUTHORIZED ONLY", "PRIVATE PROPERTY", "SECTOR 7", "NO TRESPASS"])
        )
      })
    );
    plate.position.set(0, rng.range(2.5, 4), o.d / 2 + 0.02);
    g.add(plate);
  }
  return g;
}
function addStorefront(g, o, rng) {
  const { w } = o;
  const glass = new THREE2.Mesh(
    new THREE2.PlaneGeometry(w * 0.8, 2.6),
    new THREE2.MeshLambertMaterial({
      color: 10470616,
      transparent: true,
      opacity: 0.45,
      emissive: 2767434,
      emissiveIntensity: 0.7
    })
  );
  glass.position.set(0, 1.5, o.d / 2 + 0.01);
  g.add(glass);
  const awnColors = [9318191, 3103374, 3045962, 12093742];
  const awn = new THREE2.Mesh(
    new THREE2.BoxGeometry(w * 0.85, 0.08, 1.2),
    lam(rng.pick(awnColors))
  );
  awn.position.set(0, 3.1, o.d / 2 + 0.6);
  awn.rotation.x = 0.18;
  g.add(awn);
  const names = ["NOODLE", "CUTS", "PAWN", "LIQUOR", "TACOS", "CASH", "BAR", "DELI", "INK", "GYM"];
  const sign = new THREE2.Mesh(
    new THREE2.PlaneGeometry(w * 0.7, 0.9),
    new THREE2.MeshBasicMaterial({
      map: neonSignTexture(rng, rng.pick(names), rng.pick(["#00e5ff", "#ff2e88", "#f0b429", "#7bc96f"]))
    })
  );
  sign.position.set(0, 3.9, o.d / 2 + 0.03);
  g.add(sign);
}
function addIndustrialDoor(g, o, rng) {
  const door = new THREE2.Mesh(
    new THREE2.PlaneGeometry(3.2, 3),
    lam(6975606)
  );
  door.position.set(rng.range(-o.w / 4, o.w / 4), 1.5, o.d / 2 + 0.01);
  g.add(door);
  for (let i = 0; i < 6; i++) {
    const slat = new THREE2.Mesh(new THREE2.BoxGeometry(3.2, 0.06, 0.02), lam(5527646));
    slat.position.set(door.position.x, 0.4 + i * 0.45, o.d / 2 + 0.02);
    g.add(slat);
  }
  const stripe = new THREE2.Mesh(
    new THREE2.PlaneGeometry(3.4, 0.3),
    new THREE2.MeshBasicMaterial({ color: 14196768 })
  );
  stripe.position.set(door.position.x, 0.25, o.d / 2 + 0.02);
  g.add(stripe);
}
function addEntryDoor(g, o, rng) {
  const door = new THREE2.Mesh(
    new THREE2.BoxGeometry(1.1, 2.3, 0.1),
    lam(rng.pick([5913128, 2771546, 3815994, 7023146]))
  );
  door.position.set(rng.range(-o.w / 4, o.w / 4), 1.15, o.d / 2 + 0.02);
  g.add(door);
  const stoop = new THREE2.Mesh(new THREE2.BoxGeometry(1.6, 0.18, 0.8), lam(4868686));
  stoop.position.set(door.position.x, 0.09, o.d / 2 + 0.4);
  g.add(stoop);
}
function makeFireEscape(rng, width, height) {
  const g = new THREE2.Group();
  const metal = lam(3027510);
  const levels = Math.floor(height / 3);
  for (let l = 0; l < levels; l++) {
    const y = 2.5 + l * 3;
    const plat = new THREE2.Mesh(new THREE2.BoxGeometry(width, 0.08, 1), metal);
    plat.position.set(0, y, 0.55);
    g.add(plat);
    const rail = new THREE2.Mesh(new THREE2.BoxGeometry(width, 0.7, 0.05), metal);
    rail.position.set(0, y + 0.4, 1.02);
    g.add(rail);
    if (l < levels - 1) {
      const lad = new THREE2.Mesh(new THREE2.BoxGeometry(0.4, 3, 0.05), metal);
      lad.position.set(width / 2 - 0.3, y + 1.5, 0.9);
      g.add(lad);
    }
  }
  g.position.z = 0.1;
  return g;
}
function makeWaterTower(rng) {
  const g = new THREE2.Group();
  const wood = lam(7031348);
  const tank = new THREE2.Mesh(new THREE2.CylinderGeometry(1.1, 1.3, 2, 10), wood);
  tank.position.y = 3.4;
  const cone = new THREE2.Mesh(new THREE2.ConeGeometry(1.35, 0.9, 10), lam(4863016));
  cone.position.y = 4.85;
  g.add(tank, cone);
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) {
    const leg = new THREE2.Mesh(new THREE2.BoxGeometry(0.14, 2.6, 0.14), lam(3812386));
    leg.position.set(x, 1.3, z);
    g.add(leg);
  }
  g.position.set(rng.range(-2, 2), 0, rng.range(-2, 2));
  return g;
}
function makeNeonSign(rng, o) {
  const g = new THREE2.Group();
  const words = o.district.id === "strip" ? ["BAR", "EAT", "INK", "CASH", "CLUB", "PAWN", "24H"] : ["ASHES", "WARD", "OPEN", "BEER"];
  const color = rng.pick(["#ff2e88", "#00e5ff", "#f0b429", "#9d4edd"]);
  const sign = new THREE2.Mesh(
    new THREE2.PlaneGeometry(1.8, 0.7),
    new THREE2.MeshBasicMaterial({ map: neonSignTexture(rng, rng.pick(words), color) })
  );
  const arm = new THREE2.Mesh(new THREE2.BoxGeometry(0.06, 0.06, 1), lam(2236966));
  arm.position.set(0, 0, -0.5);
  sign.rotation.y = Math.PI / 2;
  sign.position.set(0, 0, -1);
  const glow = new THREE2.PointLight(new THREE2.Color(color), 6, 9);
  glow.position.set(0, 0, -1);
  g.add(arm, sign, glow);
  g.position.set(rng.range(-o.w / 3, o.w / 3), rng.range(3.5, 6), o.d / 2 + 0.05);
  return g;
}

// src/game3d/worldgen-streets.ts
import * as THREE3 from "three";
function lam2(color, map) {
  return new THREE3.MeshLambertMaterial({ color, map: map ?? null });
}
function generateStreetBlock(o) {
  const { district, rng, w, d } = o;
  const g = new THREE3.Group();
  const sw = district.streetWidth;
  const ground = new THREE3.Mesh(
    new THREE3.PlaneGeometry(w, d),
    lam2(district.ground, asphaltTexture(rng, "#26262a"))
  );
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);
  const roadMat = lam2(district.road, asphaltTexture(rng));
  const roadNS = new THREE3.Mesh(new THREE3.PlaneGeometry(sw, d), roadMat);
  roadNS.rotation.x = -Math.PI / 2;
  roadNS.position.y = 0.01;
  const roadEW = new THREE3.Mesh(new THREE3.PlaneGeometry(w, sw), roadMat);
  roadEW.rotation.x = -Math.PI / 2;
  roadEW.position.y = 0.011;
  g.add(roadNS, roadEW);
  const lineMat = new THREE3.MeshBasicMaterial({ color: 12101690, transparent: true, opacity: 0.55 });
  if (sw >= 8) {
    for (let z = -d / 2 + 4; z < d / 2 - 2; z += 4) {
      if (Math.abs(z) < sw / 2 + 1) continue;
      const dash = new THREE3.Mesh(new THREE3.PlaneGeometry(0.18, 1.6), lineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, z);
      g.add(dash);
    }
  }
  const walkMat = lam2(4868686, asphaltTexture(rng, "#3a3a3e"));
  const walkW = 2.2;
  for (const sx of [-1, 1]) {
    const walk = new THREE3.Mesh(new THREE3.BoxGeometry(walkW, 0.14, d), walkMat);
    walk.position.set(sx * (sw / 2 + walkW / 2), 0.07, 0);
    g.add(walk);
  }
  for (const sz of [-1, 1]) {
    const walk = new THREE3.Mesh(new THREE3.BoxGeometry(w, 0.14, walkW), walkMat);
    walk.position.set(0, 0.07, sz * (sw / 2 + walkW / 2));
    g.add(walk);
  }
  if (district.id === "strip" || district.id === "warehouses") {
    const cw = new THREE3.MeshBasicMaterial({ color: 14540253, transparent: true, opacity: 0.5 });
    for (let i = -3; i <= 3; i++) {
      const s = new THREE3.Mesh(new THREE3.PlaneGeometry(0.5, 2.4), cw);
      s.rotation.x = -Math.PI / 2;
      s.position.set(i * 0.9, 0.02, sw / 2 + 1.6);
      g.add(s);
    }
  }
  const mh = new THREE3.Mesh(
    new THREE3.CircleGeometry(0.45, 12),
    lam2(3027510)
  );
  mh.rotation.x = -Math.PI / 2;
  mh.position.set(rng.range(-sw / 4, sw / 4), 0.02, rng.range(-d / 4, d / 4));
  g.add(mh);
  return g;
}
function makeLamp(rng, color) {
  const g = new THREE3.Group();
  const metal = lam2(2764856);
  const pole = new THREE3.Mesh(new THREE3.CylinderGeometry(0.07, 0.1, 4.6, 8), metal);
  pole.position.y = 2.3;
  const arm = new THREE3.Mesh(new THREE3.BoxGeometry(1, 0.08, 0.08), metal);
  arm.position.set(0.45, 4.55, 0);
  const head = new THREE3.Mesh(
    new THREE3.BoxGeometry(0.5, 0.18, 0.3),
    new THREE3.MeshBasicMaterial({ color })
  );
  head.position.set(0.9, 4.42, 0);
  const light = new THREE3.PointLight(color, 14, 16, 1.6);
  light.position.set(0.9, 4.2, 0);
  g.add(pole, arm, head, light);
  return g;
}
function makeHydrant() {
  const g = new THREE3.Group();
  const red = lam2(12729134);
  const body = new THREE3.Mesh(new THREE3.CylinderGeometry(0.14, 0.17, 0.6, 10), red);
  body.position.y = 0.38;
  const top = new THREE3.Mesh(new THREE3.SphereGeometry(0.14, 10, 8), red);
  top.position.y = 0.72;
  const cap = new THREE3.Mesh(new THREE3.CylinderGeometry(0.06, 0.06, 0.3, 8), lam2(14209220));
  cap.rotation.z = Math.PI / 2;
  cap.position.y = 0.45;
  g.add(body, top, cap);
  return g;
}
function makeDumpster(rng) {
  const g = new THREE3.Group();
  const green = lam2(rng.pick([4025157, 4872811, 7031354]));
  const body = new THREE3.Mesh(new THREE3.BoxGeometry(1.8, 1.1, 1), green);
  body.position.y = 0.65;
  const lid = new THREE3.Mesh(new THREE3.BoxGeometry(1.84, 0.08, 1.02), lam2(2894896));
  lid.position.set(0, 1.28, -0.1);
  lid.rotation.x = -0.35;
  g.add(body, lid);
  for (let i = 0; i < rng.int(1, 3); i++) {
    const bag = new THREE3.Mesh(
      new THREE3.SphereGeometry(rng.range(0.2, 0.32), 8, 6),
      lam2(1842208)
    );
    bag.scale.y = 0.8;
    bag.position.set(rng.range(-1.4, 1.4), 0.2, rng.range(0.8, 1.4));
    g.add(bag);
  }
  return g;
}
function makeCrate(rng) {
  const g = new THREE3.Group();
  const s = rng.range(0.5, 0.9);
  const box = new THREE3.Mesh(new THREE3.BoxGeometry(s, s, s), lam2(10122312));
  box.position.y = s / 2;
  box.rotation.y = rng.range(0, Math.PI);
  const edge = new THREE3.Mesh(new THREE3.BoxGeometry(s * 1.02, s * 0.12, s * 1.02), lam2(7230003));
  edge.position.y = s * 0.85;
  edge.rotation.y = box.rotation.y;
  g.add(box, edge);
  return g;
}
function makeBench() {
  const g = new THREE3.Group();
  const wood = lam2(8019008);
  const seat = new THREE3.Mesh(new THREE3.BoxGeometry(1.8, 0.08, 0.5), wood);
  seat.position.y = 0.45;
  const back = new THREE3.Mesh(new THREE3.BoxGeometry(1.8, 0.5, 0.07), wood);
  back.position.set(0, 0.75, -0.24);
  back.rotation.x = -0.12;
  for (const x of [-0.75, 0.75]) {
    const leg = new THREE3.Mesh(new THREE3.BoxGeometry(0.08, 0.45, 0.45), lam2(2895926));
    leg.position.set(x, 0.22, 0);
    g.add(leg);
  }
  g.add(seat, back);
  return g;
}
function makeBollard() {
  const g = new THREE3.Group();
  const post = new THREE3.Mesh(new THREE3.CylinderGeometry(0.11, 0.13, 0.85, 10), lam2(12099616));
  post.position.y = 0.42;
  const band = new THREE3.Mesh(
    new THREE3.CylinderGeometry(0.115, 0.115, 0.12, 10),
    new THREE3.MeshBasicMaterial({ color: 14540253 })
  );
  band.position.y = 0.62;
  g.add(post, band);
  return g;
}
function makeTrashcan(rng) {
  const g = new THREE3.Group();
  const can = new THREE3.Mesh(
    new THREE3.CylinderGeometry(0.3, 0.26, 0.85, 10),
    lam2(rng.pick([3824250, 4868686, 5925690]))
  );
  can.position.y = 0.42;
  can.rotation.z = rng.chance(0.15) ? 0.5 : 0;
  if (can.rotation.z !== 0) can.position.y = 0.3;
  g.add(can);
  return g;
}
function makeBarrier() {
  const g = new THREE3.Group();
  const board = new THREE3.Mesh(
    new THREE3.BoxGeometry(2, 0.25, 0.06),
    new THREE3.MeshBasicMaterial({ color: 15231520 })
  );
  board.position.y = 0.85;
  for (let i = 0; i < 4; i++) {
    const s = new THREE3.Mesh(
      new THREE3.PlaneGeometry(0.3, 0.26),
      new THREE3.MeshBasicMaterial({ color: 16777215 })
    );
    s.position.set(-0.75 + i * 0.5, 0.85, 0.035);
    g.add(s);
  }
  for (const x of [-0.85, 0.85]) {
    const leg = new THREE3.Mesh(new THREE3.BoxGeometry(0.08, 0.85, 0.4), lam2(3817028));
    leg.position.set(x, 0.42, 0);
    g.add(leg);
  }
  g.add(board);
  return g;
}
function makePallet(rng) {
  const g = new THREE3.Group();
  for (let i = 0; i < 5; i++) {
    const slat = new THREE3.Mesh(new THREE3.BoxGeometry(1.2, 0.03, 0.14), lam2(10122312));
    slat.position.set(0, 0.12, -0.4 + i * 0.2);
    g.add(slat);
  }
  for (const x of [-0.5, 0.5]) {
    const beam = new THREE3.Mesh(new THREE3.BoxGeometry(0.1, 0.1, 1), lam2(7230003));
    beam.position.set(x, 0.05, 0);
    g.add(beam);
  }
  g.rotation.y = rng.range(0, Math.PI);
  return g;
}
function makeFence(len) {
  const g = new THREE3.Group();
  const metal = lam2(8028812);
  const mesh = new THREE3.Mesh(
    new THREE3.PlaneGeometry(len, 1.8),
    new THREE3.MeshLambertMaterial({
      color: 9081500,
      transparent: true,
      opacity: 0.35,
      side: THREE3.DoubleSide
    })
  );
  mesh.position.y = 1;
  g.add(mesh);
  const lineMat = new THREE3.MeshBasicMaterial({ color: 6976124 });
  for (let x = -len / 2; x < len / 2; x += 0.5) {
    const d = new THREE3.Mesh(new THREE3.PlaneGeometry(0.02, 2.4), lineMat);
    d.position.set(x, 1, 0.01);
    d.rotation.z = 0.6;
    g.add(d);
  }
  for (let x = -len / 2; x <= len / 2; x += 2) {
    const post = new THREE3.Mesh(new THREE3.CylinderGeometry(0.05, 0.05, 2, 6), metal);
    post.position.set(x, 1, 0);
    g.add(post);
  }
  const rail = new THREE3.Mesh(new THREE3.BoxGeometry(len, 0.06, 0.06), metal);
  rail.position.y = 1.95;
  g.add(rail);
  const barb = new THREE3.Mesh(new THREE3.BoxGeometry(len, 0.25, 0.04), lam2(4869716));
  barb.position.y = 2.1;
  g.add(barb);
  return g;
}
function makeTree(rng) {
  const g = new THREE3.Group();
  const trunkH = rng.range(2, 3.2);
  const trunk = new THREE3.Mesh(
    new THREE3.CylinderGeometry(0.14, 0.22, trunkH, 8),
    lam2(4864556)
  );
  trunk.position.y = trunkH / 2;
  g.add(trunk);
  const blobs = rng.int(3, 5);
  for (let i = 0; i < blobs; i++) {
    const r = rng.range(0.8, 1.5);
    const leaf = new THREE3.Mesh(
      new THREE3.IcosahedronGeometry(r, 1),
      lam2(
        new THREE3.Color(3828527).offsetHSL(rng.range(-0.03, 0.03), 0, rng.range(-0.06, 0.06)).getHex(),
        void 0
      )
    );
    leaf.material.flatShading = true;
    leaf.position.set(
      rng.range(-0.8, 0.8),
      trunkH + rng.range(-0.3, 1),
      rng.range(-0.8, 0.8)
    );
    g.add(leaf);
  }
  return g;
}
function makePlanter(rng) {
  const g = new THREE3.Group();
  const box = new THREE3.Mesh(new THREE3.BoxGeometry(1.4, 0.6, 1.4), lam2(5921374));
  box.position.y = 0.3;
  g.add(box);
  for (let i = 0; i < 3; i++) {
    const bush = new THREE3.Mesh(
      new THREE3.IcosahedronGeometry(rng.range(0.3, 0.5), 1),
      lam2(3828527)
    );
    bush.material.flatShading = true;
    bush.position.set(rng.range(-0.4, 0.4), rng.range(0.7, 1), rng.range(-0.4, 0.4));
    g.add(bush);
  }
  return g;
}
function makeACUnit(rng) {
  const g = new THREE3.Group();
  const box = new THREE3.Mesh(new THREE3.BoxGeometry(0.9, 0.7, 0.7), lam2(10133672));
  box.position.y = 0.35;
  const fan = new THREE3.Mesh(new THREE3.CylinderGeometry(0.22, 0.22, 0.06, 12), lam2(4869716));
  fan.position.set(0, 0.72, 0);
  for (let i = 0; i < 4; i++) {
    const slat = new THREE3.Mesh(new THREE3.BoxGeometry(0.8, 0.03, 0.02), lam2(6975606));
    slat.position.set(0, 0.2 + i * 0.12, 0.36);
    g.add(slat);
  }
  g.add(box, fan);
  g.rotation.y = rng.range(0, Math.PI * 2);
  return g;
}
function makeSecurityCamera() {
  const g = new THREE3.Group();
  const pole = new THREE3.Mesh(new THREE3.CylinderGeometry(0.04, 0.05, 1.2, 6), lam2(3817028));
  pole.position.y = 0.6;
  const cam = new THREE3.Mesh(new THREE3.BoxGeometry(0.3, 0.16, 0.16), lam2(2237996));
  cam.position.set(0.1, 1.25, 0);
  cam.rotation.y = 0.5;
  const eye = new THREE3.Mesh(
    new THREE3.CircleGeometry(0.045, 8),
    new THREE3.MeshBasicMaterial({ color: 16720418 })
  );
  eye.position.set(0.26, 1.25, 0);
  eye.rotation.y = Math.PI / 2 + 0.5;
  g.add(pole, cam, eye);
  return g;
}
var BUILDERS = {
  lamp: (rng, d) => makeLamp(rng, d.lampColor),
  hydrant: () => makeHydrant(),
  dumpster: (rng) => makeDumpster(rng),
  crate: (rng) => makeCrate(rng),
  bench: () => makeBench(),
  bollard: () => makeBollard(),
  trashcan: (rng) => makeTrashcan(rng),
  barrier: () => makeBarrier(),
  pallet: (rng) => makePallet(rng),
  fence: () => makeFence(6),
  tree: (rng) => makeTree(rng),
  planter: (rng) => makePlanter(rng),
  newspaper: (rng) => makeTrashcan(rng),
  // placeholder — box stack
  phonebooth: () => makeBarrier(),
  // placeholder
  ac_unit: (rng) => makeACUnit(rng),
  camera: () => makeSecurityCamera()
};
var DISTRICT_PROPS = {
  alleys: [
    ["dumpster", 3],
    ["trashcan", 3],
    ["lamp", 2],
    ["crate", 2],
    ["bollard", 1],
    ["pallet", 1],
    ["fireescape", 0]
    // handled in buildings
  ],
  strip: [
    ["lamp", 3],
    ["bench", 2],
    ["planter", 2],
    ["trashcan", 2],
    ["bollard", 2],
    ["newspaper", 1]
  ],
  warehouses: [
    ["crate", 4],
    ["pallet", 4],
    ["fence", 3],
    ["barrier", 2],
    ["lamp", 2],
    ["camera", 2],
    ["bollard", 1]
  ],
  subway: [
    ["bench", 2],
    ["trashcan", 3],
    ["lamp", 2],
    ["barrier", 1],
    ["bollard", 1]
  ],
  rooftops: [
    ["ac_unit", 4],
    ["pallet", 1],
    ["crate", 1],
    ["fence", 2],
    ["lamp", 1]
  ],
  park: [
    ["tree", 5],
    ["bench", 3],
    ["lamp", 2],
    ["trashcan", 2],
    ["planter", 1]
  ]
};
function pickWeighted(rng, table) {
  const total = table.reduce((s, [, w]) => s + w, 0);
  let r = rng.next() * total;
  for (const [kind, w] of table) {
    r -= w;
    if (r <= 0) return kind;
  }
  return table[0][0];
}
function scatterProps(district, rng, areaW, areaD, count) {
  const g = new THREE3.Group();
  const table = DISTRICT_PROPS[district.id];
  const sw = district.streetWidth;
  for (let i = 0; i < count; i++) {
    const kind = pickWeighted(rng, table);
    const builder = BUILDERS[kind];
    if (!builder) continue;
    const prop = builder(rng, district);
    const side = rng.chance(0.5) ? -1 : 1;
    let x, z;
    if (rng.chance(0.7)) {
      x = side * rng.range(sw / 2 + 0.8, sw / 2 + 3.5);
      z = rng.range(-areaD / 2, areaD / 2);
    } else {
      x = side * rng.range(sw / 2 + 4, areaW / 2 - 1);
      z = rng.range(-areaD / 2 + 2, areaD / 2 - 2);
    }
    prop.position.set(x, 0, z);
    prop.rotation.y = rng.range(0, Math.PI * 2);
    if (rng.chance(0.1)) prop.rotation.z = rng.range(-0.08, 0.08);
    g.add(prop);
  }
  return g;
}
var FACTION_COLORS = {
  ashes: 14964526,
  combine: 3054591,
  hollows: 10309341,
  painted: 16723592,
  unaffiliated: 10132122,
  authority: 3042303
};
function addTerritoryMarkings(group, district, rng, blockW, blockD) {
  const faction = district.faction;
  const color = FACTION_COLORS[faction];
  const tags = 2 + Math.floor(rng.next() * 3 * district.graffiti + 1);
  for (let i = 0; i < tags; i++) {
    const w = rng.range(2, 4.5), h = w * 0.5;
    const tag = new THREE3.Mesh(
      new THREE3.PlaneGeometry(w, h),
      new THREE3.MeshBasicMaterial({
        map: graffitiTexture(rng, faction),
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
    );
    const edge = rng.int(0, 3);
    const inset = 0.05;
    if (edge === 0) {
      tag.position.set(rng.range(-blockW / 2, blockW / 2), rng.range(1.2, 3), -blockD / 2 + inset);
    } else if (edge === 1) {
      tag.position.set(rng.range(-blockW / 2, blockW / 2), rng.range(1.2, 3), blockD / 2 - inset);
      tag.rotation.y = Math.PI;
    } else if (edge === 2) {
      tag.position.set(-blockW / 2 + inset, rng.range(1.2, 3), rng.range(-blockD / 2, blockD / 2));
      tag.rotation.y = Math.PI / 2;
    } else {
      tag.position.set(blockW / 2 - inset, rng.range(1.2, 3), rng.range(-blockD / 2, blockD / 2));
      tag.rotation.y = -Math.PI / 2;
    }
    group.add(tag);
  }
  if (faction !== "unaffiliated") {
    const wash = new THREE3.PointLight(color, 5, 14, 1.8);
    wash.position.set(
      rng.range(-blockW / 4, blockW / 4),
      rng.range(2, 4),
      rng.range(-blockD / 4, blockD / 4)
    );
    group.add(wash);
  }
  if (district.id === "warehouses") {
    for (let i = 0; i < 2; i++) {
      const cam = makeSecurityCamera();
      cam.position.set(rng.range(-blockW / 3, blockW / 3), 3.5, rng.range(-blockD / 3, blockD / 3));
      group.add(cam);
    }
    const banner = new THREE3.Mesh(
      new THREE3.PlaneGeometry(6, 1.2),
      new THREE3.MeshBasicMaterial({
        map: plateSignTexture("KENNEDY CORP", "BUILDING TOMORROW TODAY", "#16283f", "#cfe0f5")
      })
    );
    banner.position.set(0, 5, -blockD / 2 + 0.1);
    group.add(banner);
  }
  if (district.id === "subway") {
    const flicker = new THREE3.PointLight(12124062, 8, 12, 1.5);
    flicker.position.set(0, 3, 0);
    flicker.userData.flicker = true;
    group.add(flicker);
  }
  if (district.id === "alleys") {
    const barrel = new THREE3.Mesh(
      new THREE3.CylinderGeometry(0.3, 0.3, 0.9, 10),
      lam2(3817028)
    );
    barrel.position.set(rng.range(-6, 6), 0.45, rng.range(-6, 6));
    const fire = new THREE3.PointLight(16743214, 12, 10, 1.7);
    fire.position.copy(barrel.position).y += 1;
    fire.userData.flicker = true;
    const flame = new THREE3.Mesh(
      new THREE3.ConeGeometry(0.22, 0.6, 8),
      new THREE3.MeshBasicMaterial({ color: 16751165, transparent: true, opacity: 0.9 })
    );
    flame.position.copy(barrel.position).y += 1.1;
    flame.userData.flame = true;
    group.add(barrel, fire, flame);
  }
}

// src/game3d/sky.ts
import * as THREE4 from "three";
var SKIES = {
  // -- The Alleys: hazy orange sodium glow, perpetual late evening --
  alleys: {
    top: 1708568,
    bottom: 4860440,
    horizon: 16743214,
    horizonIntensity: 0.85,
    orb: 16757575,
    orbSize: 1.4,
    orbPos: [-30, 22, -60],
    orbIsMoon: false,
    stars: 0.15,
    starCount: 60,
    cloudColor: 5913130,
    cloudOpacity: 0.35,
    hemiSky: 9071194,
    hemiGround: 2760216,
    hemiIntensity: 0.9,
    keyColor: 16757575,
    keyIntensity: 0.55,
    keyPos: [-20, 30, 12],
    rimColor: 14964526,
    rimIntensity: 0.35,
    fogColor: 1709080,
    fogNear: 14,
    fogFar: 65,
    malakorPurple: 0,
    malakorGreen: 0,
    groundBounce: 3811872
  },
  // -- The Strip: deep blue night, neon bleed on the horizon --
  strip: {
    top: 328976,
    bottom: 924218,
    horizon: 58879,
    horizonIntensity: 0.5,
    orb: 15267071,
    orbSize: 1,
    orbPos: [25, 35, -55],
    orbIsMoon: true,
    stars: 0.8,
    starCount: 220,
    cloudColor: 1714762,
    cloudOpacity: 0.25,
    hemiSky: 3820138,
    hemiGround: 1315868,
    hemiIntensity: 0.7,
    keyColor: 9090303,
    keyIntensity: 0.45,
    keyPos: [25, 35, -20],
    rimColor: 58879,
    rimIntensity: 0.4,
    fogColor: 1315868,
    fogNear: 20,
    fogFar: 90,
    malakorPurple: 6957823,
    malakorGreen: 0,
    groundBounce: 1710634
  },
  // -- The Yards: cold grey industrial, overcast noon --
  warehouses: {
    top: 3817544,
    bottom: 6975608,
    horizon: 10134188,
    horizonIntensity: 0.3,
    orb: 14213352,
    orbSize: 1.8,
    orbPos: [0, 45, -40],
    orbIsMoon: false,
    stars: 0,
    starCount: 0,
    cloudColor: 5922920,
    cloudOpacity: 0.55,
    hemiSky: 9082016,
    hemiGround: 3817028,
    hemiIntensity: 1.1,
    keyColor: 13623536,
    keyIntensity: 0.8,
    keyPos: [0, 45, -20],
    rimColor: 3054591,
    rimIntensity: 0.2,
    fogColor: 1448480,
    fogNear: 18,
    fogFar: 85,
    malakorPurple: 0,
    malakorGreen: 0,
    groundBounce: 4869716
  },
  // -- The Tunnels: pitch black, Malakor purple + toxic green --
  subway: {
    top: 0,
    bottom: 657940,
    horizon: 10309341,
    horizonIntensity: 0.6,
    orb: 0,
    orbSize: 0,
    orbPos: [0, 50, 0],
    orbIsMoon: true,
    stars: 0.3,
    starCount: 40,
    cloudColor: 657930,
    cloudOpacity: 0.1,
    hemiSky: 2759226,
    hemiGround: 657932,
    hemiIntensity: 0.5,
    keyColor: 10309341,
    keyIntensity: 0.35,
    keyPos: [-15, 25, 10],
    rimColor: 12124062,
    rimIntensity: 0.3,
    fogColor: 789522,
    fogNear: 8,
    fogFar: 45,
    malakorPurple: 10309341,
    malakorGreen: 12124062,
    groundBounce: 1706522
  },
  // -- The High Line: open sky, dawn/dusk gold --
  rooftops: {
    top: 2767454,
    bottom: 13924922,
    horizon: 16757575,
    horizonIntensity: 0.9,
    orb: 16767392,
    orbSize: 2.2,
    orbPos: [-45, 14, -50],
    orbIsMoon: false,
    stars: 0.25,
    starCount: 80,
    cloudColor: 16765088,
    cloudOpacity: 0.4,
    hemiSky: 10128048,
    hemiGround: 4864560,
    hemiIntensity: 1,
    keyColor: 16767392,
    keyIntensity: 1,
    keyPos: [-30, 18, -25],
    rimColor: 16747066,
    rimIntensity: 0.45,
    fogColor: 1841700,
    fogNear: 25,
    fogFar: 120,
    malakorPurple: 0,
    malakorGreen: 0,
    groundBounce: 5917242
  },
  // -- Ember Park: natural daylight, clear --
  park: {
    top: 4881080,
    bottom: 12113130,
    horizon: 16771264,
    horizonIntensity: 0.4,
    orb: 16774352,
    orbSize: 1.6,
    orbPos: [20, 50, -30],
    orbIsMoon: false,
    stars: 0,
    starCount: 0,
    cloudColor: 16777215,
    cloudOpacity: 0.5,
    hemiSky: 12113136,
    hemiGround: 4872762,
    hemiIntensity: 1.2,
    keyColor: 16774368,
    keyIntensity: 1.1,
    keyPos: [20, 50, -15],
    rimColor: 8112495,
    rimIntensity: 0.25,
    fogColor: 1317396,
    fogNear: 20,
    fogFar: 80,
    malakorPurple: 0,
    malakorGreen: 0,
    groundBounce: 5925450
  }
};
var SKY_VERT = `
varying vec3 vP;
void main() {
  vP = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
var SKY_FRAG = `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uHorizon;
uniform float uHorizonIntensity;
uniform float uDay;
varying vec3 vP;
void main() {
  vec3 d = normalize(vP);
  float h = d.y;
  // base gradient: bottom -> top
  vec3 col = mix(uBottom, uTop, smoothstep(-0.1, 0.7, h));
  // horizon glow band
  float band = (1.0 - smoothstep(0.0, 0.35, abs(h - 0.05))) * uHorizonIntensity;
  col = mix(col, uHorizon, band * 0.7);
  // below-horizon fade to fog color (passed as bottom)
  col = mix(uBottom * 0.4, col, smoothstep(-0.4, 0.0, h));
  // subtle day/night modulation (for weather system compatibility)
  float day = smoothstep(0.08, 0.62, uDay);
  col *= mix(0.35, 1.0, max(day, 0.25));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
function buildSky(id) {
  const def = SKIES[id];
  const group = new THREE4.Group();
  group.name = `sky-${id}`;
  const c = (hex3) => new THREE4.Color(hex3);
  const skyMat = new THREE4.ShaderMaterial({
    side: THREE4.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: c(def.top) },
      uBottom: { value: c(def.bottom) },
      uHorizon: { value: c(def.horizon) },
      uHorizonIntensity: { value: def.horizonIntensity },
      uDay: { value: 0.65 }
    },
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG
  });
  const dome = new THREE4.Mesh(new THREE4.SphereGeometry(140, 24, 16), skyMat);
  dome.frustumCulled = false;
  dome.renderOrder = -10;
  group.add(dome);
  let starMat = null;
  if (def.starCount > 0) {
    const pos = new Float32Array(def.starCount * 3);
    for (let i = 0; i < def.starCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * 1.1 + 0.1;
      const r = 120;
      pos[i * 3] = Math.cos(th) * Math.sin(ph) * r;
      pos[i * 3 + 1] = Math.cos(ph) * r;
      pos[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * r;
    }
    const g = new THREE4.BufferGeometry();
    g.setAttribute("position", new THREE4.BufferAttribute(pos, 3));
    starMat = new THREE4.PointsMaterial({
      color: 16249309,
      size: 0.6,
      sizeAttenuation: false,
      transparent: true,
      opacity: def.stars,
      fog: false,
      depthWrite: false
    });
    const stars = new THREE4.Points(g, starMat);
    stars.frustumCulled = false;
    stars.renderOrder = -9;
    group.add(stars);
  }
  let orb = null;
  if (def.orb !== 0) {
    orb = new THREE4.Mesh(
      new THREE4.SphereGeometry(2.2 * def.orbSize, 16, 12),
      new THREE4.MeshBasicMaterial({ color: def.orb, fog: false, transparent: true, opacity: 0.95 })
    );
    orb.position.set(...def.orbPos);
    orb.renderOrder = -8;
    group.add(orb);
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 128;
    const gg = glowCanvas.getContext("2d");
    const grad = gg.createRadialGradient(64, 64, 4, 64, 64, 64);
    const orbCss = "#" + def.orb.toString(16).padStart(6, "0");
    grad.addColorStop(0, orbCss);
    grad.addColorStop(0.4, orbCss + "55");
    grad.addColorStop(1, orbCss + "00");
    gg.fillStyle = grad;
    gg.fillRect(0, 0, 128, 128);
    const glowTex = new THREE4.CanvasTexture(glowCanvas);
    const glowMat = new THREE4.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.6,
      fog: false,
      depthWrite: false,
      blending: THREE4.AdditiveBlending
    });
    const glow = new THREE4.Sprite(glowMat);
    glow.scale.setScalar(14 * def.orbSize);
    glow.position.copy(orb.position);
    group.add(glow);
  }
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    const cloud = new THREE4.Mesh(
      new THREE4.PlaneGeometry(30 + i * 8, 9),
      new THREE4.MeshBasicMaterial({
        color: def.cloudColor,
        transparent: true,
        opacity: def.cloudOpacity,
        depthWrite: false,
        fog: false
      })
    );
    cloud.rotation.x = -Math.PI / 2;
    cloud.position.set((i - 2) * 22, 52 + i % 3 * 4, i % 2 === 0 ? -18 : 20);
    cloud.renderOrder = -7;
    group.add(cloud);
    clouds.push(cloud);
  }
  const washes = [];
  if (def.malakorPurple !== 0) {
    const p = new THREE4.PointLight(def.malakorPurple, 12, 60, 1.6);
    p.position.set(-15, 18, -10);
    group.add(p);
    washes.push(p);
  }
  if (def.malakorGreen !== 0) {
    const g2 = new THREE4.PointLight(def.malakorGreen, 8, 50, 1.6);
    g2.position.set(15, 14, 12);
    group.add(g2);
    washes.push(g2);
  }
  const tick = (t) => {
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].position.x += Math.sin(t * 0.02 + i) * 8e-3;
    }
    for (let i = 0; i < washes.length; i++) {
      const base = washes[i].userData.base ?? washes[i].intensity;
      if (washes[i].userData.base === void 0) washes[i].userData.base = base;
      washes[i].intensity = base * (0.85 + 0.15 * Math.sin(t * 0.7 + i * 2.1));
    }
  };
  return {
    group,
    tick,
    setDay: (v) => {
      skyMat.uniforms.uDay.value = v;
    },
    dispose: () => {
      group.traverse((o) => {
        const m = o;
        if (m.isMesh) {
          m.geometry.dispose();
          const mat = m.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        }
        const pts = o;
        if (pts.isPoints) {
          pts.geometry.dispose();
          pts.material?.dispose();
        }
      });
    }
  };
}
function attachSkyToDistrict(group, district) {
  const sky = buildSky(district.id);
  group.add(sky.group);
  group.userData.sky = sky;
  group.userData.skyId = district.id;
  return sky;
}

// src/game3d/worldgen.ts
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function createRng(seed) {
  const next = mulberry32(seed);
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    range: (min, max) => min + next() * (max - min),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p
  };
}
var DISTRICTS = {
  alleys: {
    id: "alleys",
    name: "The Alleys",
    faction: "ashes",
    tagline: "Ashes turf. Narrow brick canyons, fire escapes, tags on every wall.",
    streetWidth: 6,
    blockSize: 28,
    buildingHeight: [9, 22],
    ground: 2763310,
    road: 1973794,
    buildingTones: [7031354, 5914420, 7624778, 5192240, 6508874],
    accent: 14964526,
    lampColor: 16757575,
    fogColor: 1709080,
    fogNear: 14,
    fogFar: 65,
    ambient: 9071194,
    graffiti: 0.9,
    neon: 0.15,
    propDensity: 0.8
  },
  strip: {
    id: "strip",
    name: "The Strip",
    faction: "unaffiliated",
    tagline: "Commercial heart. Wide boulevards, neon, storefronts fighting for your eye.",
    streetWidth: 14,
    blockSize: 40,
    buildingHeight: [8, 30],
    ground: 3355448,
    road: 2236966,
    buildingTones: [4868690, 4013380, 5592414, 4342346, 6184550],
    accent: 58879,
    lampColor: 16777215,
    fogColor: 1315868,
    fogNear: 20,
    fogFar: 90,
    ambient: 8026778,
    graffiti: 0.3,
    neon: 0.95,
    propDensity: 0.6
  },
  warehouses: {
    id: "warehouses",
    name: "The Yards",
    faction: "combine",
    tagline: "Combine territory. Industrial sprawl, corporate signage, cameras everywhere.",
    streetWidth: 12,
    blockSize: 50,
    buildingHeight: [6, 14],
    ground: 3027510,
    road: 2500652,
    buildingTones: [5922920, 5001816, 6712436, 5528162, 6317680],
    accent: 3054591,
    lampColor: 13625599,
    fogColor: 1448480,
    fogNear: 18,
    fogFar: 85,
    ambient: 6978186,
    graffiti: 0.1,
    neon: 0.05,
    propDensity: 0.9
  },
  subway: {
    id: "subway",
    name: "The Tunnels",
    faction: "hollows",
    tagline: "Hollows domain. Underground platforms, flickering tubes, something wrong.",
    streetWidth: 8,
    blockSize: 30,
    buildingHeight: [4, 8],
    ground: 1842208,
    road: 1579036,
    buildingTones: [3815998, 3289654, 4210756, 3552826],
    accent: 10309341,
    lampColor: 12124062,
    fogColor: 789522,
    fogNear: 8,
    fogFar: 45,
    ambient: 4868698,
    graffiti: 0.7,
    neon: 0.1,
    propDensity: 0.5
  },
  rooftops: {
    id: "rooftops",
    name: "The High Line",
    faction: "unaffiliated",
    tagline: "Above it all. Rooftop runs, AC units, water towers, the city below.",
    streetWidth: 10,
    blockSize: 24,
    buildingHeight: [12, 28],
    ground: 3815998,
    road: 3026482,
    buildingTones: [5131860, 4605516, 5395032, 4868688],
    accent: 16757575,
    lampColor: 16767392,
    fogColor: 1841700,
    fogNear: 25,
    fogFar: 120,
    ambient: 10127994,
    graffiti: 0.4,
    neon: 0.3,
    propDensity: 0.7
  },
  park: {
    id: "park",
    name: "Ember Park",
    faction: "unaffiliated",
    tagline: "The green lung. Trees, paths, benches \u2014 and people who don't want to be seen.",
    streetWidth: 8,
    blockSize: 36,
    buildingHeight: [6, 16],
    ground: 2964010,
    road: 3815988,
    buildingTones: [5919048, 5129792, 6445648, 5525578],
    accent: 8112495,
    lampColor: 16771264,
    fogColor: 1317396,
    fogNear: 20,
    fogFar: 80,
    ambient: 8034922,
    graffiti: 0.2,
    neon: 0.05,
    propDensity: 0.7
  }
};
var DISTRICT_IDS = Object.keys(DISTRICTS);
var DEFAULT_SEEDS = {
  alleys: 1101,
  strip: 2202,
  warehouses: 3303,
  subway: 4404,
  rooftops: 5505,
  park: 6606
};
function generateDistrict(id, seed = DEFAULT_SEEDS[id], opts = {}) {
  const def = DISTRICTS[id];
  const rng = createRng(seed);
  const blocks = opts.blocks ?? 2;
  const storytelling = opts.storytelling ?? true;
  const group = new THREE5.Group();
  group.name = `district-${id}`;
  const blockSize = def.blockSize;
  const worldW = blockSize * blocks;
  const worldD = blockSize * blocks;
  const bounds = {
    minX: -worldW / 2,
    maxX: worldW / 2,
    minZ: -worldD / 2,
    maxZ: worldD / 2
  };
  const colliders = [];
  const spawnPoints = [];
  const flickers = [];
  const flames = [];
  const hemi = new THREE5.HemisphereLight(def.ambient, 1710622, 0.9);
  group.add(hemi);
  const moon = new THREE5.DirectionalLight(def.lampColor, 0.55);
  moon.position.set(-20, 30, 12);
  group.add(moon);
  group.userData.fog = { color: def.fogColor, near: def.fogNear, far: def.fogFar };
  const sky = opts.sky === false ? null : attachSkyToDistrict(group, def);
  for (let bx = 0; bx < blocks; bx++) {
    for (let bz = 0; bz < blocks; bz++) {
      const cx = -worldW / 2 + blockSize * (bx + 0.5);
      const cz = -worldD / 2 + blockSize * (bz + 0.5);
      const streets = generateStreetBlock({ district: def, rng, w: blockSize, d: blockSize });
      streets.position.set(cx, 0, cz);
      group.add(streets);
    }
  }
  const perSide = Math.max(2, Math.floor(worldW / 18));
  for (let i = 0; i < perSide; i++) {
    for (const side of [0, 1, 2, 3]) {
      const t = (i + 0.5) / perSide;
      const bw = rng.range(10, 18);
      const bd = rng.range(8, 14);
      const bh = rng.range(def.buildingHeight[0], def.buildingHeight[1]);
      const b = generateBuilding({
        w: bw,
        d: bd,
        h: bh,
        tone: rng.pick(def.buildingTones),
        district: def,
        rng
      });
      const m = worldW / 2 + bd / 2 + rng.range(1, 4);
      const along = -worldW / 2 + t * worldW;
      let x = 0, z = 0, yaw = 0;
      if (side === 0) {
        x = along;
        z = -m;
        yaw = 0;
      } else if (side === 1) {
        x = along;
        z = m;
        yaw = Math.PI;
      } else if (side === 2) {
        x = -m;
        z = along;
        yaw = Math.PI / 2;
      } else {
        x = m;
        z = along;
        yaw = -Math.PI / 2;
      }
      b.position.set(x, 0, z);
      b.rotation.y = yaw;
      group.add(b);
      colliders.push({ x, z, hw: bw / 2, hd: bd / 2 });
    }
  }
  if (id === "warehouses" || id === "park") {
    const lots = id === "warehouses" ? 4 : 2;
    for (let i = 0; i < lots; i++) {
      const bw = rng.range(12, 20), bd = rng.range(10, 16);
      const bh = rng.range(def.buildingHeight[0], def.buildingHeight[1]);
      const b = generateBuilding({
        w: bw,
        d: bd,
        h: bh,
        tone: rng.pick(def.buildingTones),
        district: def,
        rng,
        industrial: id === "warehouses"
      });
      const qx = (i % 2 === 0 ? -1 : 1) * worldW / 4;
      const qz = (i < 2 ? -1 : 1) * worldD / 4;
      const bx = qx + rng.range(-4, 4), bz = qz + rng.range(-4, 4);
      b.position.set(bx, 0, bz);
      b.rotation.y = rng.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
      group.add(b);
      colliders.push({ x: bx, z: bz, hw: Math.max(bw, bd) / 2, hd: Math.max(bw, bd) / 2 });
    }
  }
  const propCount = Math.floor(28 * def.propDensity * blocks);
  const props = scatterProps(def, rng, worldW, worldD, propCount);
  group.add(props);
  props.traverse((o) => {
    if (o.userData.solid) colliders.push({ x: o.position.x, z: o.position.z, hw: 0.4, hd: 0.4 });
  });
  if (storytelling) {
    addTerritoryMarkings(group, def, rng, worldW, worldD);
  }
  group.traverse((o) => {
    if (o.isPointLight && o.userData.flicker) {
      flickers.push(o);
    }
    if (o.userData.flame) flames.push(o);
  });
  spawnPoints.push(
    { x: 0, z: worldD / 2 - 6, yaw: Math.PI, kind: "player" },
    { x: -worldW / 4, z: -worldD / 4, yaw: 0, kind: "enemy" },
    { x: worldW / 4, z: -worldD / 4, yaw: 0, kind: "enemy" },
    { x: 0, z: -worldD / 2 + 8, yaw: 0, kind: "enemy" },
    { x: -worldW / 4, z: worldD / 4, yaw: Math.PI / 2, kind: "npc" },
    { x: worldW / 4, z: worldD / 4, yaw: -Math.PI / 2, kind: "npc" }
  );
  const tick = (t, _dt) => {
    sky?.tick(t);
    for (const f of flickers) {
      const base = f.userData.baseIntensity ?? f.intensity;
      if (f.userData.baseIntensity === void 0) f.userData.baseIntensity = f.intensity;
      f.intensity = base * (0.82 + 0.18 * Math.abs(Math.sin(t * 13 + f.position.x)));
    }
    for (const fl of flames) {
      fl.scale.y = 0.85 + 0.3 * Math.abs(Math.sin(t * 11 + fl.position.z));
      fl.scale.x = fl.scale.z = 0.9 + 0.2 * Math.abs(Math.cos(t * 9));
    }
  };
  const dispose = () => {
    sky?.dispose();
    group.traverse((o) => {
      const mesh = o;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => disposeMat(m));
        else if (mat) disposeMat(mat);
      }
    });
  };
  return { id, seed, group, bounds, spawnPoints, colliders, tick, dispose };
}
function disposeMat(m) {
  const mm = m;
  if (mm.map) mm.map.dispose();
  m.dispose();
}
function hitsCollider(d, x, z, r = 0.4) {
  for (const c of d.colliders) {
    if (Math.abs(x - c.x) < c.hw + r && Math.abs(z - c.z) < c.hd + r) return true;
  }
  return false;
}
function clampToDistrict(d, x, z, margin = 1) {
  return [
    Math.max(d.bounds.minX + margin, Math.min(d.bounds.maxX - margin, x)),
    Math.max(d.bounds.minZ + margin, Math.min(d.bounds.maxZ - margin, z))
  ];
}

// src/game3d/city/territory.ts
var BLEND_TIME = 5;
function createTurfMap() {
  const districts = {};
  for (const id of Object.keys(CITY_DISTRICTS)) {
    districts[id] = {
      district: id,
      owner: CITY_DISTRICTS[id].homeFaction,
      challenger: null,
      control: 0,
      blend: 1,
      prevOwner: null,
      lastAttack: -999,
      pressure: 0
    };
  }
  return { districts, timeOfDay: 20 };
}
function neighbors(id) {
  const g = CITY_DISTRICTS[id].grid;
  const out = [];
  for (const oid of Object.keys(CITY_DISTRICTS)) {
    if (oid === id || oid === "underground") continue;
    const og = CITY_DISTRICTS[oid].grid;
    if (Math.abs(og[0] - g[0]) + Math.abs(og[1] - g[1]) === 1) out.push(oid);
  }
  return out;
}
function factionActivity(faction, timeOfDay) {
  const h = timeOfDay;
  const night = h >= 21 || h < 5 ? 1 : h >= 18 || h < 8 ? 0.7 : 0.35;
  const day = h >= 8 && h < 18 ? 1 : h >= 6 && h < 20 ? 0.7 : 0.4;
  switch (faction) {
    case "hollows":
      return 0.5 + 0.9 * night;
    // own the night
    case "authority":
      return 0.5 + 0.9 * day;
    // own the day
    case "ashes":
      return h >= 16 && h < 22 ? 1.5 : 0.9;
    // dusk raiders
    case "combine":
      return 1;
    // money never sleeps
    case "player":
      return 1.2;
    // the player is always dangerous
    default:
      return 0.6;
  }
}
function tickTurf(map, dt, now) {
  const events = { flipped: [], contested: [] };
  map.timeOfDay = (map.timeOfDay + dt / 240) % 24;
  for (const id of Object.keys(map.districts)) {
    const t = map.districts[id];
    const wasContested = t.challenger !== null;
    if (!t.challenger && now - t.lastAttack > 45) {
      for (const n of neighbors(id)) {
        const nt = map.districts[n];
        if (nt.owner === t.owner || nt.owner === "player") continue;
        t.pressure += dt * factionActivity(nt.owner, map.timeOfDay) * 0.02;
        if (t.pressure > 1) {
          t.challenger = nt.owner;
          t.control = 0.15;
          t.lastAttack = now;
          t.pressure = 0;
          events.contested.push(id);
        }
        break;
      }
    }
    if (t.challenger) {
      const atk = factionActivity(t.challenger, map.timeOfDay);
      const def = factionActivity(t.owner, map.timeOfDay);
      t.control += dt * 0.03 * atk;
      t.control -= dt * 0.015 * def * (t.owner === "player" ? 1.5 : 1);
      t.control = Math.max(0, Math.min(1.2, t.control));
      t.lastAttack = now;
      if (t.control >= 1) {
        t.prevOwner = t.owner;
        t.owner = t.challenger;
        t.challenger = null;
        t.control = 0;
        t.blend = 0;
        events.flipped.push(id);
      } else if (t.control <= 0) {
        t.challenger = null;
        t.control = 0;
      }
    } else {
      t.pressure = Math.max(0, t.pressure - dt * 0.01);
    }
    if (t.blend < 1) {
      t.blend = Math.min(1, t.blend + dt / BLEND_TIME);
    }
    if (!wasContested && t.challenger) events.contested.push(id);
  }
  return events;
}
function playerAttack(map, id, now) {
  const t = map.districts[id];
  if (t.owner === "player") return;
  if (t.challenger !== "player") {
    t.challenger = "player";
    t.control = Math.max(t.control, 0.15);
  }
  t.control = Math.min(1.2, t.control + 0.12);
  t.lastAttack = now;
}
function ownerColor(owner) {
  if (owner === "player") return 3800942;
  return FACTION_VISUALS[owner].colors[0];
}
function turfVisualTargets(map, id, base) {
  const t = map.districts[id];
  const owner = t.owner;
  const visual = owner === "player" ? { colors: [3800942], tagDensity: 0.7, cleanliness: 0.6 } : FACTION_VISUALS[owner];
  const fog = new THREE6.Color(base.palette.fogColor).lerp(new THREE6.Color(visual.colors[0]), 0.25 * t.blend);
  const ambient = new THREE6.Color(base.palette.ambient).lerp(new THREE6.Color(visual.colors[0]), 0.15 * t.blend);
  const wash = new THREE6.Color(ownerColor(owner));
  let graffitiFaction = owner === "player" ? base.homeFaction : owner;
  if (t.challenger) {
    const c = t.challenger === "player" ? base.homeFaction : t.challenger;
    fog.lerp(new THREE6.Color(ownerColor(t.challenger)), 0.2 * t.control);
    wash.lerp(new THREE6.Color(ownerColor(t.challenger)), 0.5 * t.control);
    graffitiFaction = t.control > 0.5 ? c : graffitiFaction;
  }
  const tagDensity = visual.tagDensity * base.graffiti;
  const cleanliness = visual.cleanliness;
  return {
    fogColor: fog,
    ambientColor: ambient,
    washColor: wash,
    graffitiFaction,
    graffitiOpacity: Math.min(1, tagDensity * 2) * (cleanliness < 0.9 ? 1 : 0.15),
    grimeOpacity: (1 - cleanliness) * 0.55
  };
}
function buildMarkingLayer(base, faction, seed, worldW, worldD) {
  const rng = createRng(seed);
  const group = new THREE6.Group();
  group.name = `markings-${faction}`;
  const mats = [];
  const lights = [];
  const tmp = new THREE6.Group();
  const def = {
    id: base.base,
    name: base.name,
    faction: faction === "player" ? base.homeFaction : faction,
    tagline: base.tagline,
    streetWidth: 10,
    blockSize: 34,
    buildingHeight: [8, 24],
    ground: base.palette.ground,
    road: base.palette.road,
    buildingTones: base.palette.buildingTones,
    accent: ownerColor(faction),
    lampColor: base.palette.lampColor,
    fogColor: base.palette.fogColor,
    fogNear: base.fogNear,
    fogFar: base.fogFar,
    ambient: base.palette.ambient,
    graffiti: Math.max(0.15, base.graffiti),
    neon: base.neon,
    propDensity: base.propDensity
  };
  addTerritoryMarkings(tmp, def, rng, worldW, worldD);
  tmp.traverse((o) => {
    const mesh = o;
    if (mesh.isMesh) {
      const m = mesh.material;
      if (m) {
        m.transparent = true;
        mats.push(m);
      }
    }
    const l = o;
    if (l.isLight) lights.push(l);
  });
  group.add(tmp);
  const visual = faction === "player" ? { cleanliness: 0.6 } : FACTION_VISUALS[faction];
  const grime2 = (1 - visual.cleanliness) * 0.5;
  if (grime2 > 0.05) {
    const gc = document.createElement("canvas");
    gc.width = gc.height = 128;
    const g = gc.getContext("2d");
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(8,6,5,${(rng.next() * grime2 * 0.5).toFixed(2)})`;
      g.beginPath();
      g.ellipse(rng.next() * 128, rng.next() * 128, rng.range(8, 40), rng.range(6, 26), rng.next() * 3, 0, 7);
      g.fill();
    }
    const grimeTex = new THREE6.CanvasTexture(gc);
    grimeTex.wrapS = grimeTex.wrapT = THREE6.RepeatWrapping;
    grimeTex.repeat.set(3, 3);
    const grimeMesh = new THREE6.Mesh(
      new THREE6.PlaneGeometry(worldW, worldD),
      new THREE6.MeshBasicMaterial({ map: grimeTex, transparent: true, depthWrite: false })
    );
    grimeMesh.rotation.x = -Math.PI / 2;
    grimeMesh.position.y = 0.03;
    const gm = grimeMesh.material;
    mats.push(gm);
    group.add(grimeMesh);
  }
  group.userData.mats = mats;
  return { group, faction, mats, lights };
}
function buildConflictLayer(seed, worldW, worldD) {
  const rng = createRng(seed ^ 40503);
  const group = new THREE6.Group();
  group.name = "conflict";
  for (let i = 0; i < 5; i++) {
    const h = rng.range(8, 14);
    const smoke = new THREE6.Mesh(
      new THREE6.PlaneGeometry(rng.range(3, 5), h),
      new THREE6.MeshBasicMaterial({
        color: 1710618,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        side: THREE6.DoubleSide
      })
    );
    smoke.position.set(rng.range(-10, 10), h / 2, rng.range(-10, 10));
    smoke.userData.smoke = true;
    smoke.userData.phase = rng.next() * 10;
    group.add(smoke);
  }
  for (let i = 0; i < 6; i++) {
    const scorch = new THREE6.Mesh(
      new THREE6.CircleGeometry(rng.range(1, 2.5), 12),
      new THREE6.MeshBasicMaterial({ color: 657930, transparent: true, opacity: 0.6, depthWrite: false })
    );
    scorch.rotation.x = -Math.PI / 2;
    scorch.position.set(rng.range(-worldW / 3, worldW / 3), 0.02, rng.range(-worldD / 3, worldD / 3));
    group.add(scorch);
  }
  const flick = new THREE6.PointLight(16757575, 10, 18, 1.6);
  flick.position.set(rng.range(-8, 8), 4, rng.range(-8, 8));
  flick.userData.conflictFlicker = true;
  flick.userData.baseIntensity = 10;
  group.add(flick);
  group.visible = false;
  return group;
}
function tickTurfVisuals(turf, contested, t, dt) {
  for (const m of turf.markings) {
    const target = m.group.userData.targetOpacity ?? 1;
    const cur = m.group.userData.opacity ?? 1;
    const next = cur + Math.sign(target - cur) * (dt / BLEND_TIME);
    const clamped = Math.max(0, Math.min(1, next));
    m.group.userData.opacity = clamped;
    for (const mat of m.mats) mat.opacity = clamped * (mat.userData.baseOpacity ?? 1);
    for (const l of m.lights) l.intensity = (l.userData.baseIntensity ?? l.intensity) * clamped;
  }
  const kept = turf.markings.filter((m) => {
    if (m.group.userData.targetOpacity === 0 && (m.group.userData.opacity ?? 1) <= 0.01) {
      m.group.parent?.remove(m.group);
      return false;
    }
    return true;
  });
  turf.markings.length = 0;
  turf.markings.push(...kept);
  turf.conflict.visible = contested;
  if (contested) {
    turf.conflict.traverse((o) => {
      if (o.userData.smoke) {
        o.position.y += dt * 0.6;
        o.rotation.y += dt * 0.3;
        if (o.position.y > 14) o.position.y = 3;
      }
      if (o.userData.conflictFlicker) {
        const l = o;
        const base = l.userData.baseIntensity;
        l.intensity = base * (0.25 + 0.75 * Math.abs(Math.sin(t * 17 + l.position.x * 3)));
      }
    });
  }
}
function swapMarkingLayer(turf, next, parent) {
  for (const m of turf.markings) m.group.userData.targetOpacity = 0;
  next.group.userData.opacity = 0;
  next.group.userData.targetOpacity = 1;
  for (const mat of next.mats) {
    mat.userData.baseOpacity = mat.opacity;
    mat.opacity = 0;
  }
  parent.add(next.group);
  turf.markings.push(next);
}

// src/game3d/city/underground.ts
import * as THREE7 from "three";
var DEPTH = -9;
function lam3(color) {
  return new THREE7.MeshLambertMaterial({ color });
}
function buildUnderground(seed = 777) {
  const rng = createRng(seed);
  const group = new THREE7.Group();
  group.name = "underground";
  const stationDefs = [
    { id: "st-projects", above: "projects", kind: "station" },
    { id: "st-marquee", above: "marquee-mile", kind: "station" },
    { id: "st-neon", above: "neon-district", kind: "station" },
    { id: "st-civic", above: "civic", kind: "station" },
    { id: "sw-waterfront", above: "waterfront", kind: "sewer-access" },
    { id: "sw-industrial", above: "industrial", kind: "sewer-access" }
  ];
  const nodes = stationDefs.map((s) => {
    const d = CITY_DISTRICTS[s.above];
    const x = d.grid[0] * DISTRICT_SPACING + rng.range(-20, 20);
    const z = d.grid[1] * DISTRICT_SPACING + rng.range(-20, 20);
    return { id: s.id, x, z, kind: s.kind, above: s.above };
  });
  const segments = [
    seg(nodes, "st-projects", "st-marquee", 7, "subway"),
    seg(nodes, "st-marquee", "st-neon", 7, "subway"),
    seg(nodes, "st-neon", "st-civic", 7, "subway"),
    seg(nodes, "st-neon", "sw-waterfront", 3.5, "sewer"),
    seg(nodes, "st-civic", "sw-industrial", 3.5, "sewer")
  ];
  const colliders = [];
  const flickers = [];
  group.add(new THREE7.HemisphereLight(4870728, 658442, 0.5));
  for (const s of segments) buildTunnel(group, s, rng, colliders, flickers);
  for (const n of nodes) buildStation(group, n, rng, colliders, flickers);
  const entrances = nodes.map((n) => ({ x: n.x + 6, z: n.z + 6, nodeId: n.id }));
  const tick = (t) => {
    for (const f of flickers) {
      const base = f.userData.baseIntensity ?? f.intensity;
      if (f.userData.baseIntensity === void 0) f.userData.baseIntensity = f.intensity;
      const stutter = Math.sin(t * 23 + f.position.x * 7) > 0.92 ? 0.25 : 1;
      f.intensity = base * stutter * (0.85 + 0.15 * Math.sin(t * 7 + f.position.z));
    }
  };
  const dispose = () => {
    group.traverse((o) => {
      const mesh = o;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const m = mesh.material;
        if (m) m.dispose();
      }
    });
  };
  return { group, nodes, segments, entrances, colliders, tick, dispose };
}
function seg(nodes, from, to, width, kind) {
  const a = nodes.find((n) => n.id === from);
  const b = nodes.find((n) => n.id === to);
  return { from, to, ax: a.x, az: a.z, bx: b.x, bz: b.z, width, kind };
}
function buildTunnel(group, s, rng, colliders, flickers) {
  const dx = s.bx - s.ax, dz = s.bz - s.az;
  const len = Math.hypot(dx, dz);
  const yaw = Math.atan2(dx, dz);
  const cx = (s.ax + s.bx) / 2, cz = (s.az + s.bz) / 2;
  const w = s.width, h = s.kind === "subway" ? 4.5 : 3;
  const concrete = lam3(s.kind === "subway" ? 3816504 : 3027504);
  const floor = new THREE7.Mesh(new THREE7.PlaneGeometry(w, len), lam3(2369060));
  floor.rotation.x = -Math.PI / 2;
  floor.rotation.z = yaw;
  floor.position.set(cx, DEPTH, cz);
  group.add(floor);
  for (const side of [-1, 1]) {
    const wall = new THREE7.Mesh(new THREE7.BoxGeometry(0.6, h, len), concrete);
    wall.position.set(
      cx + Math.cos(yaw) * side * (w / 2),
      DEPTH + h / 2,
      cz - Math.sin(yaw) * side * (w / 2)
    );
    wall.rotation.y = yaw;
    group.add(wall);
  }
  const ceil = new THREE7.Mesh(new THREE7.BoxGeometry(w + 1.2, 0.6, len), lam3(2237471));
  ceil.position.set(cx, DEPTH + h + 0.3, cz);
  ceil.rotation.y = yaw;
  group.add(ceil);
  const steps = Math.max(2, Math.floor(len / 14));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lx = s.ax + dx * t, lz = s.az + dz * t;
    const tube = new THREE7.Mesh(
      new THREE7.BoxGeometry(w * 0.5, 0.12, 0.5),
      new THREE7.MeshBasicMaterial({ color: 14090208 })
    );
    tube.position.set(lx, DEPTH + h - 0.2, lz);
    tube.rotation.y = yaw;
    group.add(tube);
    if (i % 2 === 0) {
      const pl = new THREE7.PointLight(14090208, 6, w * 2.4, 1.6);
      pl.position.set(lx, DEPTH + h - 0.6, lz);
      pl.userData.baseIntensity = 6;
      flickers.push(pl);
      group.add(pl);
    }
  }
  if (s.kind === "subway") {
    for (const side of [-1, 1]) {
      const rail = new THREE7.Mesh(new THREE7.BoxGeometry(0.18, 0.12, len), lam3(5593696));
      rail.position.set(
        cx + Math.cos(yaw) * side * 1.1,
        DEPTH + 0.1,
        cz - Math.sin(yaw) * side * 1.1
      );
      rail.rotation.y = yaw;
      group.add(rail);
    }
  } else {
    const water = new THREE7.Mesh(
      new THREE7.PlaneGeometry(w * 0.5, len),
      new THREE7.MeshBasicMaterial({ color: 1718826, transparent: true, opacity: 0.8 })
    );
    water.rotation.x = -Math.PI / 2;
    water.rotation.z = yaw;
    water.position.set(cx, DEPTH + 0.05, cz);
    group.add(water);
  }
}
function buildStation(group, n, rng, colliders, flickers) {
  const w = n.kind === "station" ? 22 : 10;
  const d = n.kind === "station" ? 14 : 10;
  const h = 5;
  const floor = new THREE7.Mesh(new THREE7.PlaneGeometry(w, d), lam3(2895402));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(n.x, DEPTH, n.z);
  group.add(floor);
  const wallMat = lam3(3816504);
  const back = new THREE7.Mesh(new THREE7.BoxGeometry(w, h, 0.6), wallMat);
  back.position.set(n.x, DEPTH + h / 2, n.z - d / 2);
  group.add(back);
  for (const side of [-1, 1]) {
    const wall = new THREE7.Mesh(new THREE7.BoxGeometry(0.6, h, d), wallMat);
    wall.position.set(n.x + side * w / 2, DEPTH + h / 2, n.z);
    group.add(wall);
  }
  const ceil = new THREE7.Mesh(new THREE7.BoxGeometry(w, 0.6, d), lam3(2237471));
  ceil.position.set(n.x, DEPTH + h + 0.3, n.z);
  group.add(ceil);
  for (let i = -1; i <= 1; i++) {
    const p = new THREE7.Mesh(new THREE7.BoxGeometry(0.8, h, 0.8), lam3(4474431));
    p.position.set(n.x + i * w / 4, DEPTH + h / 2, n.z);
    group.add(p);
    colliders.push({ x: n.x + i * w / 4, z: n.z, hw: 0.4, hd: 0.4 });
  }
  const sym = new THREE7.Mesh(
    new THREE7.PlaneGeometry(3, 3),
    new THREE7.MeshBasicMaterial({ color: 13396506, transparent: true, opacity: 0.7 })
  );
  sym.position.set(n.x, DEPTH + 2.5, n.z - d / 2 + 0.35);
  group.add(sym);
  const strip = new THREE7.Mesh(
    new THREE7.BoxGeometry(w * 0.9, 0.04, 0.3),
    new THREE7.MeshBasicMaterial({ color: 13378082 })
  );
  strip.position.set(n.x, DEPTH + 0.03, n.z + d / 2 - 1);
  group.add(strip);
  const pl = new THREE7.PointLight(14090208, 14, 20, 1.5);
  pl.position.set(n.x, DEPTH + h - 0.8, n.z);
  pl.userData.baseIntensity = 14;
  flickers.push(pl);
  group.add(pl);
  const bench = new THREE7.Mesh(new THREE7.BoxGeometry(2.4, 0.5, 0.6), lam3(4867128));
  bench.position.set(n.x - 4, DEPTH + 0.45, n.z - 2);
  group.add(bench);
  colliders.push({ x: n.x - 4, z: n.z - 2, hw: 1.2, hd: 0.3 });
  void rng;
}

// src/game3d/city/world.ts
import * as THREE9 from "three";

// src/game3d/city/city-sky.ts
import * as THREE8 from "three";
function nearestDistrict(x, z) {
  let best = "neon-district";
  let bestD = Infinity;
  for (const id of Object.keys(CITY_DISTRICTS)) {
    if (id === "underground") continue;
    const [cx, cz] = districtWorldPos(id);
    const d = (x - cx) * (x - cx) + (z - cz) * (z - cz);
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}
function buildCitySky() {
  const sky = buildSky("strip");
  const group = sky.group;
  group.scale.setScalar(3);
  let domeUniforms = null;
  group.traverse((o) => {
    const mesh = o;
    if (mesh.isMesh && mesh.material?.uniforms?.uTop && !domeUniforms) {
      domeUniforms = mesh.material.uniforms;
    }
  });
  const tmpA = new THREE8.Color();
  const dayFor = (t) => t === "day" ? 0.95 : t === "dawn" ? 0.6 : t === "dusk" ? 0.45 : 0.12;
  const update = (x, z, t, dt) => {
    sky.tick(t);
    group.position.set(x, 0, z);
    const id = nearestDistrict(x, z);
    const cityDef = CITY_DISTRICTS[id];
    const def = SKIES[cityDef.skyBase];
    const day = dayFor(cityDef.timeOfDay);
    const k = Math.min(1, dt * 2.5);
    if (domeUniforms) {
      const u = domeUniforms;
      u.uTop.value.lerp(tmpA.setHex(def.top), k);
      u.uBottom.value.lerp(tmpA.setHex(def.bottom), k);
      u.uHorizon.value.lerp(tmpA.setHex(def.horizon), k);
      u.uHorizonIntensity.value = THREE8.MathUtils.lerp(u.uHorizonIntensity.value, def.horizonIntensity, k);
      u.uDay.value = THREE8.MathUtils.lerp(u.uDay.value, day, k);
    }
  };
  return { sky, group, update, dispose: () => sky.dispose() };
}

// src/game3d/city/world.ts
var DISTRICT_SEEDS = {
  "neon-district": 5505,
  "marquee-mile": 2202,
  "civic": 6607,
  "projects": 1101,
  "industrial": 3303,
  "waterfront": 7708,
  "underground": 4404,
  "outskirts": 8809,
  "suburbs": 9900
};
async function buildCityAsync(opts = {}, onDistrict) {
  const yieldFrame = () => new Promise((r) => setTimeout(r, 0));
  const parts = createCityParts(opts.blocks ?? 2);
  const ids = CITY_DISTRICT_IDS.filter((id) => id !== "underground");
  let done = 0;
  for (const id of ids) {
    buildDistrictInto(parts, id);
    done++;
    onDistrict?.(id, done, ids.length);
    await yieldFrame();
  }
  return finishCity(parts);
}
function createCityParts(blocks) {
  return {
    blocks,
    group: new THREE9.Group(),
    turf: createTurfMap(),
    districts: {},
    colliders: [],
    spawnPoints: []
  };
}
function buildDistrictInto(parts, id) {
  const def = CITY_DISTRICTS[id];
  const wdef = toWorldgenDef(def);
  const gen = generateDistrict(wdef.id, DISTRICT_SEEDS[id], { blocks: parts.blocks, storytelling: false, sky: false });
  const [wx, wz] = districtWorldPos(id);
  gen.group.position.set(wx, 0, wz);
  applyDistrictPalette(gen.group, def);
  parts.group.add(gen.group);
  const worldW = gen.bounds.maxX - gen.bounds.minX;
  const worldD = gen.bounds.maxZ - gen.bounds.minZ;
  const markings = buildMarkingLayer(def, parts.turf.districts[id].owner, DISTRICT_SEEDS[id] ^ 20907, worldW, worldD);
  gen.group.add(markings.group);
  const conflict = buildConflictLayer(DISTRICT_SEEDS[id] ^ 49393, worldW, worldD);
  gen.group.add(conflict);
  for (const c of gen.colliders) parts.colliders.push({ x: c.x + wx, z: c.z + wz, hw: c.hw, hd: c.hd });
  for (const s of gen.spawnPoints) parts.spawnPoints.push({ ...s, x: s.x + wx, z: s.z + wz });
  parts.districts[id] = {
    id,
    district: gen,
    turf: { markings: [markings], conflict },
    contested: false,
    lastOwner: String(parts.turf.districts[id].owner)
  };
}
function finishCity(parts) {
  const { group, turf, districts, colliders, spawnPoints } = parts;
  const citySky = buildCitySky();
  group.add(citySky.group);
  const focus = { x: 0, z: 0 };
  const underground = buildUnderground(777);
  group.add(underground.group);
  for (const c of underground.colliders) colliders.push(c);
  buildConnectors(group, colliders);
  const tick = (t, dt, now) => {
    tickTurf(turf, dt, now);
    underground.tick(t);
    citySky.update(focus.x, focus.z, t, dt);
    for (const id of CITY_DISTRICT_IDS) {
      if (id === "underground") continue;
      const inst = districts[id];
      const td = turf.districts[id];
      inst.district.tick(t, dt);
      const ownerKey = String(td.owner);
      if (ownerKey !== inst.lastOwner) {
        const worldW = inst.district.bounds.maxX - inst.district.bounds.minX;
        const worldD = inst.district.bounds.maxZ - inst.district.bounds.minZ;
        const next = buildMarkingLayer(
          CITY_DISTRICTS[id],
          td.owner,
          (DISTRICT_SEEDS[id] ^ (now | 0)) >>> 0,
          worldW,
          worldD
        );
        swapMarkingLayer(inst.turf, next, inst.district.group);
        inst.lastOwner = ownerKey;
      }
      inst.contested = td.challenger !== null;
      inst.turf.conflict.visible = inst.contested;
      const targets = turfVisualTargets(turf, id, CITY_DISTRICTS[id]);
      driftDistrictMood(inst.district.group, targets, dt);
      tickTurfVisuals(inst.turf, inst.contested, t, dt);
    }
  };
  const dispose = () => {
    for (const id of CITY_DISTRICT_IDS) {
      if (id === "underground") continue;
      districts[id].district.dispose();
    }
    underground.dispose();
    citySky.dispose();
  };
  const hits = (x, z, r = 0.4) => {
    for (const c of colliders) {
      if (Math.abs(x - c.x) < c.hw + r && Math.abs(z - c.z) < c.hd + r) return true;
    }
    return false;
  };
  group.name = "ashlane-city";
  return { group, districts, turf, underground, colliders, spawnPoints, tick, dispose, hits, focus, citySky };
}
function applyDistrictPalette(group, def) {
  const p = def.palette;
  group.traverse((o) => {
    if (o.isHemisphereLight) {
      const h = o;
      h.color.setHex(p.ambient);
      h.groundColor.setHex(p.hemiGround);
    }
    if (o.isDirectionalLight) {
      o.color.setHex(p.lampColor);
    }
  });
  group.userData.fog = { color: p.fogColor, near: def.fogNear, far: def.fogFar };
  group.userData.districtPalette = p;
}
function driftDistrictMood(group, targets, dt) {
  const k = Math.min(1, dt * 1.5);
  const fog = group.userData.fog;
  if (fog) {
    const c = new THREE9.Color(fog.color).lerp(targets.fogColor, k);
    fog.color = c.getHex();
  }
  group.traverse((o) => {
    if (o.isHemisphereLight) {
      const h = o;
      h.color.lerp(targets.ambientColor, k);
    }
  });
  const wash = group.getObjectByName("turf-wash");
  if (wash) wash.color.lerp(targets.washColor, k);
}
function buildConnectors(group, colliders) {
  const roadMat = new THREE9.MeshLambertMaterial({ color: 2302758 });
  const pairs = [
    ["projects", "neon-district"],
    ["neon-district", "marquee-mile"],
    ["neon-district", "industrial"],
    ["neon-district", "waterfront"],
    ["industrial", "civic"],
    ["marquee-mile", "civic"],
    ["projects", "outskirts"],
    ["waterfront", "outskirts"],
    ["marquee-mile", "suburbs"]
  ];
  for (const [a, b] of pairs) {
    const [ax, az] = districtWorldPos(a);
    const [bx, bz] = districtWorldPos(b);
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 1) continue;
    const road = new THREE9.Mesh(new THREE9.PlaneGeometry(10, len), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = Math.atan2(dx, dz);
    road.position.set((ax + bx) / 2, 0.02, (az + bz) / 2);
    group.add(road);
    const lampMat = new THREE9.MeshLambertMaterial({ color: 3815998 });
    const steps = Math.floor(len / 26);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const lx = ax + dx * t + 6, lz = az + dz * t;
      const pole = new THREE9.Mesh(new THREE9.CylinderGeometry(0.12, 0.12, 7, 6), lampMat);
      pole.position.set(lx, 3.5, lz);
      group.add(pole);
      const head = new THREE9.Mesh(
        new THREE9.SphereGeometry(0.3, 8, 6),
        new THREE9.MeshBasicMaterial({ color: 16767392 })
      );
      head.position.set(lx, 7, lz);
      group.add(head);
      colliders.push({ x: lx, z: lz, hw: 0.2, hd: 0.2 });
    }
  }
  void clampToDistrict;
  void hitsCollider;
}

// tools/city/shots/entry.ts
var renderer = new THREE10.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);
var scene = new THREE10.Scene();
scene.background = new THREE10.Color(657936);
var camera = new THREE10.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 600);
var city;
var simT = 0;
async function boot() {
  const w = window;
  try {
    city = await buildCityAsync({ blocks: 1 }, (_id, done, total) => {
      w.__bootProgress = `${done}/${total}`;
    });
    scene.add(city.group);
    for (let i = 0; i < 10; i++) tickFrame(1 / 30);
    w.__city = api;
    w.__cityReady = true;
  } catch (e) {
    w.__bootError = String(e?.stack || e).slice(0, 2e3);
  }
}
function applyFog(id) {
  const inst = city.districts[id];
  const fog = inst.district.group.userData.fog;
  if (fog) scene.fog = new THREE10.Fog(fog.color, fog.near, fog.far);
}
function tickFrame(dt) {
  simT += dt;
  city.tick(simT, dt, simT);
}
function render() {
  renderer.render(scene, camera);
}
function lookAtDistrict(id, angle) {
  const [x, z] = districtWorldPos(id);
  applyFog(id);
  city.focus.x = x;
  city.focus.z = z;
  if (angle === "aerial") {
    camera.position.set(x + 55, 70, z + 55);
    camera.lookAt(x, 6, z);
  } else if (angle === "street") {
    camera.position.set(x, 3.2, z + 16);
    camera.lookAt(x, 5, z - 16);
  } else {
    camera.position.set(x + 90, 26, z + 90);
    camera.lookAt(x, 6, z);
  }
  for (let i = 0; i < 40; i++) tickFrame(1 / 30);
  render();
}
function lookUnderground() {
  const n = city.underground.nodes[2];
  scene.fog = new THREE10.Fog(658442, 4, 40);
  camera.position.set(n.x - 7, -9 + 2.6, n.z + 2);
  camera.lookAt(n.x + 8, -9 + 1.6, n.z - 2);
  for (let i = 0; i < 10; i++) tickFrame(1 / 30);
  render();
}
function forceTurfFlip(id) {
  const t = city.turf.districts[id];
  for (let i = 0; i < 40 && t.owner !== "player"; i++) {
    playerAttack(city.turf, id, simT + i);
    for (let j = 0; j < 30; j++) tickFrame(1 / 30);
  }
  for (let i = 0; i < 200; i++) tickFrame(1 / 30);
}
function forceContest(id) {
  const t = city.turf.districts[id];
  t.challenger = "hollows";
  t.control = 0.55;
  for (let i = 0; i < 60; i++) tickFrame(1 / 30);
}
var api = {
  lookAtDistrict,
  lookUnderground,
  forceTurfFlip,
  forceContest,
  tickFrame,
  districts: CITY_DISTRICT_IDS,
  debugSky: () => {
    const out = { focus: { x: city.focus.x, z: city.focus.z } };
    city.citySky.group.traverse((o) => {
      const m = o;
      if (m.isMesh && m.material?.uniforms?.uTop) {
        const u = m.material.uniforms;
        out.dome = {
          top: u.uTop.value.getHexString(),
          bottom: u.uBottom.value.getHexString(),
          uDay: u.uDay.value.toFixed(2)
        };
      }
      if (m.isMesh && m.renderOrder === -8) {
        const mat = m.material;
        out.orb = { color: mat.color.getHexString(), opacity: mat.opacity.toFixed(2) };
      }
    });
    return out;
  }
};
boot();
