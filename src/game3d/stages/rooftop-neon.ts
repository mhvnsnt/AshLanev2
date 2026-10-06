/**
 * NEON ROOFTOP — Downtown Rooftop District signature stage.
 *
 * Built from the owner's concept art (stage-rooftop-night.webp):
 * rain-slicked rooftop at night, neon-drenched skyline, water towers,
 * AC units, billboard with neon frame, lightning in the distance.
 *
 * This is ONE district's identity — not the template for the whole game.
 * See docs/DISTRICT_ART_DIRECTION.md for per-district visual identities.
 *
 * Base geometry: Bannon Rooftop.glb (MDickie low-poly rooftop).
 * This config layers the neon-noir atmosphere on top.
 */

export interface NeonRooftopConfig {
  baseModel: string;
  atmosphere: {
    skyColor: number;
    fogColor: number;
    fogNear: number;
    fogFar: number;
    ambientLight: { color: number; intensity: number };
    moonLight: { color: number; intensity: number; position: [number, number, number] };
    neonLights: Array<{
      color: number;
      intensity: number;
      position: [number, number, number];
      label: string;
    }>;
  };
  weather: {
    type: 'rain';
    intensity: number; // 0-1
    splashParticles: boolean;
    lightning: { enabled: boolean; intervalMin: number; intervalMax: number };
  };
  ground: {
    reflective: boolean;
    reflectivity: number;
    puddleNormalScale: number;
  };
  props: Array<{
    model: string;
    position: [number, number, number];
    rotationY: number;
    scale: number;
  }>;
  skyline: {
    // Procedural background buildings with neon edge strips
    buildingCount: number;
    neonColors: number[];
    windowLitRatio: number;
  };
}

export const NEON_ROOFTOP: NeonRooftopConfig = {
  baseModel: 'models/stages/Rooftop.glb',

  atmosphere: {
    skyColor: 0x0a0a18,
    fogColor: 0x0d0d20,
    fogNear: 80,
    fogFar: 600,
    ambientLight: { color: 0x334, intensity: 0.4 },
    moonLight: {
      color: 0x8899ff,
      intensity: 0.5,
      position: [100, 200, -50],
    },
    neonLights: [
      // Purple edge strips (left buildings)
      { color: 0xb537f2, intensity: 3.0, position: [-40, 25, -30], label: 'purple-left' },
      { color: 0xb537f2, intensity: 2.0, position: [-55, 15, 10], label: 'purple-mid' },
      // Green edge strips (center-right buildings)
      { color: 0x39ff6e, intensity: 3.0, position: [30, 30, -40], label: 'green-center' },
      { color: 0x39ff6e, intensity: 2.0, position: [50, 20, -10], label: 'green-right' },
      // Blue billboard frame (right side)
      { color: 0x28c8ff, intensity: 4.0, position: [35, 12, 15], label: 'billboard-blue' },
      // Green billboard fill
      { color: 0x39ff6e, intensity: 2.5, position: [35, 10, 15], label: 'billboard-green' },
      // Warm practicals (wall sconces)
      { color: 0xffb347, intensity: 1.2, position: [-15, 3, -8], label: 'sconce-1' },
      { color: 0xffb347, intensity: 1.2, position: [0, 3, -12], label: 'sconce-2' },
      { color: 0xffb347, intensity: 1.2, position: [15, 3, 20], label: 'sconce-3' },
    ],
  },

  weather: {
    type: 'rain',
    intensity: 0.7,
    splashParticles: true,
    lightning: { enabled: true, intervalMin: 8, intervalMax: 25 },
  },

  ground: {
    reflective: true,
    reflectivity: 0.65,
    puddleNormalScale: 0.3,
  },

  props: [
    // Water towers (twin, center-back like the concept)
    { model: 'models/stages/props/water_tower.glb', position: [-5, 0, -18], rotationY: 0, scale: 1.0 },
    { model: 'models/stages/props/water_tower.glb', position: [5, 0, -18], rotationY: 0, scale: 1.0 },
    // AC units (left side row)
    { model: 'models/stages/props/ac_unit.glb', position: [-18, 0, 5], rotationY: 0, scale: 1.0 },
    { model: 'models/stages/props/ac_unit.glb', position: [-18, 0, 0], rotationY: 0, scale: 1.0 },
    { model: 'models/stages/props/ac_unit.glb', position: [-18, 0, -5], rotationY: 0, scale: 1.0 },
    { model: 'models/stages/props/ac_unit.glb', position: [-14, 0, 8], rotationY: 0.3, scale: 1.0 },
    // Billboard frame (right side)
    { model: 'models/stages/props/billboard_frame.glb', position: [22, 0, 5], rotationY: -0.4, scale: 1.2 },
    // Pipes and vents
    { model: 'models/stages/props/pipe_cluster.glb', position: [-22, 0, -10], rotationY: 0, scale: 1.0 },
    { model: 'models/stages/props/vent.glb', position: [10, 0, 12], rotationY: 1.2, scale: 1.0 },
    // Safety railing (perimeter)
    { model: 'models/stages/props/railing_section.glb', position: [0, 0, -22], rotationY: 0, scale: 3.0 },
  ],

  skyline: {
    buildingCount: 24,
    neonColors: [0xb537f2, 0x39ff6e, 0x28c8ff, 0xffb347],
    windowLitRatio: 0.35,
  },
};

/**
 * Engine integration notes:
 *
 * 1. Load baseModel (Rooftop.glb) as the fight platform.
 * 2. Apply atmosphere: set scene.fog, background color, add all lights.
 *    Neon lights should use emissive materials + PointLights (limit to ~9
 *    for mobile; bake the rest into emissive textures).
 * 3. Weather: rain particle system + occasional lightning flash
 *    (directional light intensity spike + sky flash).
 * 4. Ground: swap the rooftop floor material for a reflective PBR material
 *    (MeshStandardMaterial with envMap or Reflector for hero quality).
 *    Puddle normal maps sell the wet look cheaply.
 * 5. Props: place from the props array. NOTE — water_tower, ac_unit,
 *    billboard_frame, pipe_cluster, vent, and railing_section models
 *    don't exist yet. They're on the prop build list (see below).
 * 6. Skyline: procedurally generate background buildings as simple boxes
 *    with emissive window textures + neon edge strips (LineSegments or
 *    thin emissive boxes). These are OUTSIDE the fight bounds — pure backdrop.
 *
 * PROP BUILD LIST (needed for full concept fidelity):
 * - water_tower.glb — wooden water tower on legs (iconic NYC rooftop)
 * - ac_unit.glb — industrial AC condenser box with fan grill
 * - billboard_frame.glb — steel truss frame (neon tubes added via config)
 * - pipe_cluster.glb — industrial pipes and valves
 * - vent.glb — rooftop exhaust vent
 * - railing_section.glb — safety railing (tileable)
 *
 * These can be modeled procedurally (boxes/cylinders) or pulled from
 * open-source prop packs (see docs/OPEN_SOURCE_TOP30.md).
 */
