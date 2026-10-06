/**
 * AshLane Stage Catalog — Urban Reign-style stage select.
 *
 * Stages pulled from Bannon's MDickie world environments.
 * In quick-fight mode: pick a stage, pick fighters, fight.
 * In story/open-world mode: all stages are connected districts
 * you travel between (see docs/WORLD_CONNECTIONS.md).
 */

export interface StageDefinition {
  id: string;
  name: string;
  description: string;
  modelPath: string;      // GLB in public/models/stages/
  thumbnailPath: string;  // PNG in public/stages/thumbs/
  district: string;       // Connected-world district (see WORLD_CONNECTIONS.md)
  environment: 'indoor' | 'outdoor' | 'underground' | 'rooftop';
  timeOfDay: 'day' | 'night' | 'dusk' | 'any';
  faction?: string;       // Default controlling faction, if any
  skybox?: string;        // Optional skybox dome GLB
  props: string[];        // Suggested props from public/models/stages/props/
  bounds: { x: number; z: number };  // Approximate fight area (meters)
}

export const STAGES: readonly StageDefinition[] = [
  {
    id: 'city',
    name: 'ASHLANE CITY',
    description: 'The open city. Nine districts, turf war live. Procedurally built — no two visits identical.',
    modelPath: '',
    thumbnailPath: 'stages/thumbs/city.png',
    district: 'open-city',
    environment: 'outdoor',
    timeOfDay: 'any',
    props: [],
    bounds: { x: 400, z: 400 },
  },
  {
    id: 'ring-square',
    name: 'RING SQUARE',
    description: 'Regulation wrestling ring. The purest fight.',
    modelPath: 'models/stages/Ring_Square.glb',
    thumbnailPath: 'stages/thumbs/Ring_Square.png',
    district: 'downtown-arena',
    environment: 'indoor',
    timeOfDay: 'any',
    props: ['barrier.glb'],
    bounds: { x: 12, z: 12 },
  },
  {
    id: 'bar',
    name: 'THE BAR',
    description: 'Brick walls, wooden bar, broken bottles. Classic brawl.',
    modelPath: 'models/stages/Bar.glb',
    thumbnailPath: 'stages/thumbs/Bar.png',
    district: 'downtown-strip',
    environment: 'indoor',
    timeOfDay: 'night',
    props: ['table_small.glb', 'table_medium.glb', 'barrel_small.glb', 'torch.glb'],
    bounds: { x: 20, z: 15 },
  },
  {
    id: 'subway',
    name: 'SUBWAY',
    description: 'Underground tunnels. No witnesses.',
    modelPath: 'models/stages/Subway.glb',
    thumbnailPath: 'stages/thumbs/Subway.png',
    district: 'underground-transit',
    environment: 'underground',
    timeOfDay: 'any',
    props: ['pillar.glb', 'torch_mounted.glb'],
    bounds: { x: 30, z: 12 },
  },
  {
    id: 'gym',
    name: 'BOXING GYM',
    description: 'Mats, bags, and bad intentions.',
    modelPath: 'models/stages/Gym.glb',
    thumbnailPath: 'stages/thumbs/Gym.png',
    district: 'downtown-strip',
    environment: 'indoor',
    timeOfDay: 'day',
    props: [],
    bounds: { x: 18, z: 14 },
  },
  {
    id: 'backstage',
    name: 'BACKSTAGE',
    description: 'Behind the curtain. Settle it here.',
    modelPath: 'models/stages/Backstage.glb',
    thumbnailPath: 'stages/thumbs/Backstage.png',
    district: 'downtown-arena',
    environment: 'indoor',
    timeOfDay: 'any',
    props: ['box_large.glb', 'box_small.glb'],
    bounds: { x: 15, z: 15 },
  },
  {
    id: 'basketball-court',
    name: 'STREET COURT',
    description: 'Blacktop. Chain nets. No refs.',
    modelPath: 'models/stages/Basketball_Court.glb',
    thumbnailPath: 'stages/thumbs/Basketball_Court.png',
    district: 'projects',
    environment: 'outdoor',
    timeOfDay: 'dusk',
    props: ['city_bench.glb'],
    bounds: { x: 28, z: 15 },
  },
  {
    id: 'prison-yard',
    name: 'PRISON YARD',
    description: 'Concrete, fences, and lifers watching.',
    modelPath: 'models/stages/Prison_Yard.glb',
    thumbnailPath: 'stages/thumbs/Prison_Yard.png',
    district: 'outskirts-prison',
    environment: 'outdoor',
    timeOfDay: 'day',
    props: ['barrier.glb', 'torch_mounted.glb'],
    bounds: { x: 40, z: 30 },
  },
  {
    id: 'rooftop',
    name: 'ROOFTOP',
    description: 'High above the city. Nowhere to run.',
    modelPath: 'models/stages/Rooftop.glb',
    thumbnailPath: 'stages/thumbs/Rooftop.png',
    district: 'downtown-rooftops',
    environment: 'rooftop',
    timeOfDay: 'night',
    props: ['city_streetlight.glb'],
    bounds: { x: 25, z: 25 },
  },
  {
    id: 'trailer-park',
    name: 'TRAILER PARK',
    description: 'Rust, gravel, and grudges.',
    modelPath: 'models/stages/Trailer_Park.glb',
    thumbnailPath: 'stages/thumbs/Trailer_Park.png',
    district: 'outskirts-trailerpark',
    environment: 'outdoor',
    timeOfDay: 'dusk',
    props: ['barrel_large.glb', 'city_barrels.glb'],
    bounds: { x: 40, z: 30 },
  },
  {
    id: 'arcade',
    name: 'ARCADE',
    description: 'Neon, noise, and knocked-out teeth.',
    modelPath: 'models/stages/Arcade.glb',
    thumbnailPath: 'stages/thumbs/Arcade.png',
    district: 'downtown-strip',
    environment: 'indoor',
    timeOfDay: 'night',
    props: ['torch.glb'],
    bounds: { x: 16, z: 12 },
  },
  {
    id: 'cemetery',
    name: 'CEMETERY',
    description: 'Among the stones. Fitting.',
    modelPath: 'models/stages/Cemetery.glb',
    thumbnailPath: 'stages/thumbs/Cemetery.png',
    district: 'outskirts-cemetery',
    environment: 'outdoor',
    timeOfDay: 'night',
    props: ['pillar.glb', 'torch.glb'],
    bounds: { x: 35, z: 30 },
  },
  {
    id: 'workshop',
    name: 'WORKSHOP',
    description: 'Tools everywhere. Use them.',
    modelPath: 'models/stages/Workshop.glb',
    thumbnailPath: 'stages/thumbs/Workshop.png',
    district: 'industrial',
    environment: 'indoor',
    timeOfDay: 'any',
    props: ['table_medium.glb', 'barrel_small.glb', 'stairs.glb'],
    bounds: { x: 18, z: 14 },
  },
  {
    id: 'bridge',
    name: 'BRIDGE',
    description: 'Over the water. Don\'t fall.',
    modelPath: 'models/stages/Bridge.glb',
    thumbnailPath: 'stages/thumbs/Bridge.png',
    district: 'waterfront-bridge',
    environment: 'outdoor',
    timeOfDay: 'dusk',
    props: ['barrier.glb', 'city_streetlight.glb'],
    bounds: { x: 50, z: 10 },
  },
  {
    id: 'police-yard',
    name: 'POLICE YARD',
    description: 'Impound lot. Cop cars for cover.',
    modelPath: 'models/stages/Police_Yard.glb',
    thumbnailPath: 'stages/thumbs/Police_Yard.png',
    district: 'downtown-civic',
    environment: 'outdoor',
    timeOfDay: 'night',
    faction: 'authority',
    props: ['barrier.glb', 'city_streetlight.glb'],
    bounds: { x: 45, z: 35 },
  },
  {
    id: 'school-yard',
    name: 'SCHOOL YARD',
    description: 'After hours. Playground rules.',
    modelPath: 'models/stages/School_Yard.glb',
    thumbnailPath: 'stages/thumbs/School_Yard.png',
    district: 'suburbs',
    environment: 'outdoor',
    timeOfDay: 'dusk',
    props: ['city_bench.glb'],
    bounds: { x: 45, z: 35 },
  },
  {
    id: 'hotel',
    name: 'HOTEL LOBBY',
    description: 'Five stars. Zero mercy.',
    modelPath: 'models/stages/Hotel.glb',
    thumbnailPath: 'stages/thumbs/Hotel.png',
    district: 'downtown-strip',
    environment: 'indoor',
    timeOfDay: 'night',
    props: ['column.glb', 'pillar.glb'],
    bounds: { x: 20, z: 16 },
  },
  {
    id: 'hospital',
    name: 'HOSPITAL',
    description: 'You\'ll need a room after this.',
    modelPath: 'models/stages/Hospital.glb',
    thumbnailPath: 'stages/thumbs/Hospital.png',
    district: 'downtown-civic',
    environment: 'indoor',
    timeOfDay: 'any',
    props: [],
    bounds: { x: 16, z: 14 },
  },
  {
    id: 'studio',
    name: 'STUDIO',
    description: 'Lights, camera, violence.',
    modelPath: 'models/stages/Studio.glb',
    thumbnailPath: 'stages/thumbs/Studio.png',
    district: 'downtown-strip',
    environment: 'indoor',
    timeOfDay: 'any',
    props: ['torch.glb', 'column.glb'],
    bounds: { x: 16, z: 12 },
  },
  {
    id: 'arena-skybox',
    name: 'ARENA DOME',
    description: 'City panorama skybox dome. Pair with Ring Square.',
    modelPath: 'models/stages/Arena.glb',
    thumbnailPath: 'stages/thumbs/Arena.png',
    district: 'downtown-arena',
    environment: 'outdoor',
    timeOfDay: 'any',
    skybox: 'models/stages/Arena.glb',
    props: [],
    bounds: { x: 0, z: 0 },
  },
];

export function getStage(id: string): StageDefinition | undefined {
  return STAGES.find(s => s.id === id);
}

export function getStagesByDistrict(district: string): StageDefinition[] {
  return STAGES.filter(s => s.district === district);
}

export function getStagesByEnvironment(env: StageDefinition['environment']): StageDefinition[] {
  return STAGES.filter(s => s.environment === env);
}
