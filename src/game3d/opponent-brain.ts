/**
 * Opponent brain — Yuka-powered fighter AI for AshLane grunts.
 *
 * Round 6 wiring: yuka (MIT, https://github.com/Mugen87/yuka) provides the
 * StateMachine; the decision layer (utility scoring, reaction-delayed
 * perception, difficulty tiers) is our own code in this file.
 *
 * HARD LAW (from the fighter-AI research): the AI plays the same game as the
 * player — same frame data, no input reading. All knowledge of the player's
 * attack passes through a reaction-delay buffer scaled by difficulty, so a
 * "hard" grunt reacts in ~180ms and an "easy" one in ~450ms. No peeking.
 *
 * The brain is a pure decision function: Percept in, Intent out. The sim
 * applies the intent with its existing primitives (requestAttack, velocity
 * steering), so frame data and hit resolution stay identical.
 */

import { State, StateMachine } from "yuka";

export type Difficulty = "easy" | "normal" | "hard" | "boss";

export interface BrainTuning {
  /** ms before the brain perceives a player attack starting */
  reactionMs: number;
  /** 0..1 — how often it takes an opening when one exists */
  aggression: number;
  /** multiplier on windup time (lower = faster, more dangerous) */
  windupScale: number;
  /** max range at which it will whiff-punish an open player */
  punishRange: number;
  /** 0..1 — chance to retreat instead of orbit when threatened */
  caution: number;
}

const TUNINGS: Record<Difficulty, BrainTuning> = {
  easy: { reactionMs: 450, aggression: 0.35, windupScale: 1.25, punishRange: 1.6, caution: 0.5 },
  normal: { reactionMs: 300, aggression: 0.55, windupScale: 1.0, punishRange: 2.0, caution: 0.3 },
  hard: { reactionMs: 180, aggression: 0.75, windupScale: 0.85, punishRange: 2.5, caution: 0.15 },
  boss: { reactionMs: 120, aggression: 0.9, windupScale: 0.7, punishRange: 3.0, caution: 0.05 },
};

/** What the brain is allowed to perceive — all from public sim state. */
export interface Percept {
  /** seconds */
  now: number;
  /** distance to player (xz) */
  dist: number;
  /** normalized direction to player */
  dirX: number;
  dirZ: number;
  /** player is mid-attack RIGHT NOW (raw, unperceived) */
  playerAttackRaw: boolean;
  /** player whiffed and is punishable right now (raw) */
  playerOpenRaw: boolean;
  playerDown: boolean;
  selfHpFrac: number;
  cooldownReady: boolean;
  /** how many allies are closer to the player (0 = I'm the presser) */
  rank: number;
  /** another grunt is mid-swing near the player (don't pile on) */
  allyAttacking: boolean;
  verticalGap: number;
  /** orbit phase for circling (keeps grunts from stacking) */
  orbitSeed: number;
  /**
   * Set by perceive(): reaction-delayed versions of playerAttackRaw /
   * playerOpenRaw. The ONLY player-attack knowledge the brain may use.
   */
  perceivedThreat?: boolean;
  perceivedOpen?: boolean;
}

/** What the brain wants — the sim applies it with existing primitives. */
export interface Intent {
  moveX: number;
  moveZ: number;
  wantAttack: boolean;
  attackKind: "low" | "mid" | "high";
  /** orbit vs direct approach blend already applied into moveX/moveZ */
}

type BrainStateId = "approach" | "orbit" | "retreat" | "hold";

interface BrainContext {
  brain: OpponentBrain;
  percept: Percept | null;
  intent: Intent;
}

class ApproachState extends State<BrainContext> {
  enter(ctx: BrainContext) {
    ctx.brain.stateId = "approach";
  }
  execute(ctx: BrainContext) {
    const p = ctx.percept!;
    const b = ctx.brain;
    // Direct line to the player.
    ctx.intent.moveX = p.dirX;
    ctx.intent.moveZ = p.dirZ;
    // In range and cooled down? Take the shot (utility roll).
    if (b.shouldAttack(p)) {
      ctx.intent.wantAttack = true;
      ctx.intent.attackKind = p.playerDown ? "low" : "mid";
    }
    // Player winding up and we're close and cautious? Back off.
    if (p.perceivedThreat && p.dist < 2.1 && Math.random() < b.tuning.caution) {
      b.machine.changeTo("retreat");
    } else if (p.rank > 0) {
      // Not the presser — orbit instead of stacking.
      b.machine.changeTo("orbit");
    }
  }
}

class OrbitState extends State<BrainContext> {
  enter(ctx: BrainContext) {
    ctx.brain.stateId = "orbit";
  }
  execute(ctx: BrainContext) {
    const p = ctx.percept!;
    const b = ctx.brain;
    // Circle the player at ~2.5m, each grunt offset by its seed.
    const a = p.orbitSeed + p.now * 0.45;
    ctx.intent.moveX = p.dirX * 0.25 + Math.cos(a) * 0.97;
    ctx.intent.moveZ = p.dirZ * 0.25 + Math.sin(a) * 0.97;
    const m = Math.hypot(ctx.intent.moveX, ctx.intent.moveZ) || 1;
    ctx.intent.moveX /= m;
    ctx.intent.moveZ /= m;
    // Became the presser? Go in.
    if (p.rank === 0) b.machine.changeTo("approach");
    // Player open and we're in punish range? Whiff punish.
    if (p.perceivedOpen && p.dist < b.tuning.punishRange && b.shouldAttack(p)) {
      ctx.intent.wantAttack = true;
      ctx.intent.attackKind = "mid";
    }
  }
}

class RetreatState extends State<BrainContext> {
  private t = 0;
  enter(ctx: BrainContext) {
    ctx.brain.stateId = "retreat";
    this.t = 0.45 + Math.random() * 0.3;
  }
  execute(ctx: BrainContext, delta: number) {
    const p = ctx.percept!;
    const b = ctx.brain;
    this.t -= delta;
    // Back away from the player.
    ctx.intent.moveX = -p.dirX;
    ctx.intent.moveZ = -p.dirZ;
    if (this.t <= 0) b.machine.changeTo(p.rank === 0 ? "approach" : "orbit");
  }
}

class HoldState extends State<BrainContext> {
  private t = 0;
  enter(ctx: BrainContext) {
    ctx.brain.stateId = "hold";
    this.t = 0.3 + Math.random() * 0.5;
  }
  execute(ctx: BrainContext, delta: number) {
    const b = ctx.brain;
    this.t -= delta;
    ctx.intent.moveX = 0;
    ctx.intent.moveZ = 0;
    if (this.t <= 0) b.machine.changeTo("approach");
  }
}

// Perception after the reaction delay — the anti-input-reading core.
interface DelayedEvent {
  at: number;
  attack: boolean;
  open: boolean;
}

export class OpponentBrain {
  readonly difficulty: Difficulty;
  readonly tuning: BrainTuning;
  readonly machine: StateMachine<BrainContext>;
  readonly ctx: BrainContext;
  stateId: BrainStateId = "approach";
  private events: DelayedEvent[] = [];
  private lastAttackSeen = false;

  constructor(difficulty: Difficulty = "normal") {
    this.difficulty = difficulty;
    this.tuning = TUNINGS[difficulty];
    this.ctx = {
      brain: this,
      percept: null,
      intent: { moveX: 0, moveZ: 0, wantAttack: false, attackKind: "mid" },
    };
    this.machine = new StateMachine(this.ctx);
    this.machine.add("approach", new ApproachState());
    this.machine.add("orbit", new OrbitState());
    this.machine.add("retreat", new RetreatState());
    this.machine.add("hold", new HoldState());
    this.machine.changeTo("approach");
  }

  /** Feed raw perception; call once per sim tick before decide(). */
  perceive(p: Percept): void {
    // Edge-detect the player's attack start and delay it.
    if (p.playerAttackRaw && !this.lastAttackSeen) {
      this.events.push({ at: p.now + this.tuning.reactionMs / 1000, attack: true, open: false });
    }
    if (p.playerOpenRaw) {
      // Whiff punish window is also delayed — no free punishes.
      this.events.push({ at: p.now + this.tuning.reactionMs / 1000, attack: false, open: true });
    }
    this.lastAttackSeen = p.playerAttackRaw;
    // Attach perceived (delayed) flags for this tick.
    let perceivedThreat = false;
    let perceivedOpen = false;
    this.events = this.events.filter((e) => {
      if (e.at <= p.now) {
        if (e.attack) perceivedThreat = true;
        if (e.open) perceivedOpen = true;
        return false;
      }
      return true;
    });
    this.ctx.percept = { ...p, perceivedThreat, perceivedOpen };
  }

  /** Utility roll: should I attack this tick? */
  shouldAttack(p: Percept): boolean {
    if (!p.cooldownReady) return false;
    if (p.allyAttacking) return false;
    if (Math.abs(p.verticalGap) > 1.1) return false;
    const inRange = p.dist < (p.perceivedOpen ? this.tuning.punishRange : 1.35);
    if (!inRange) return false;
    // Aggression roll, boosted when the player is punishable.
    const boost = p.perceivedOpen ? 0.35 : 0;
    return Math.random() < this.tuning.aggression + boost;
  }

  /** Run one tick. Returns the intent for the sim to apply. */
  decide(dt: number): Intent {
    const intent = this.ctx.intent;
    intent.wantAttack = false;
    intent.moveX = 0;
    intent.moveZ = 0;
    if (!this.ctx.percept) return intent;
    this.machine.update(dt);
    return intent;
  }

  /** For tests: how many delayed events are queued. */
  pendingEvents(): number {
    return this.events.length;
  }
}

/** Map a grunt's body/arch to a difficulty tier. */
export function difficultyFor(arch: string, missionIndex: number): Difficulty {
  if (arch === "brute") return missionIndex > 6 ? "boss" : "hard";
  if (arch === "hex") return "hard";
  if (arch === "hood" || arch === "runner") return "normal";
  return missionIndex > 4 ? "normal" : "easy";
}

/** Minimal structural view of a combatant — avoids sim.ts import cycles. */
export interface CombatantView {
  id: number;
  kind: string;
  x: number;
  y: number;
  z: number;
  hp: number;
  maxHp: number;
  state: string;
  stateT: number;
  swung: boolean;
  cd: number;
  arch: string;
  alive: boolean;
}

/**
 * Build a Percept from public sim state. All fields are things any player
 * could see — no hidden sim internals, no input reading.
 */
export function buildPercept(
  self: CombatantView,
  foe: CombatantView | null,
  others: CombatantView[],
  now: number,
): Percept {
  const dx = foe ? foe.x - self.x : 0;
  const dz = foe ? foe.z - self.z : 0;
  const dist = Math.hypot(dx, dz) || 0.0001;
  let rank = 0;
  let allyAttacking = false;
  for (const o of others) {
    if (o === self || o.kind !== "grunt" || !o.alive) continue;
    if (foe && Math.hypot(o.x - foe.x, o.z - foe.z) < dist - 0.05) rank += 1;
    if ((o.state === "windup" || o.state === "atk") && foe && Math.hypot(o.x - foe.x, o.z - foe.z) < 2.2) {
      allyAttacking = true;
    }
  }
  return {
    now,
    dist,
    dirX: dx / dist,
    dirZ: dz / dist,
    playerAttackRaw: !!foe && foe.alive && (foe.state === "windup" || (foe.state === "atk" && !foe.swung)),
    playerOpenRaw: !!foe && foe.alive && foe.state === "atk" && foe.swung && foe.stateT < 0.16,
    playerDown: !!foe && foe.alive && foe.state === "down",
    selfHpFrac: self.maxHp > 0 ? self.hp / self.maxHp : 1,
    cooldownReady: self.cd <= 0,
    rank,
    allyAttacking,
    verticalGap: foe ? Math.abs(self.y - foe.y) : 0,
    orbitSeed: self.id * 0.9,
  };
}
