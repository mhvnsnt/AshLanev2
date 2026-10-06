/**
 * Dialogue runtime — Round 6 wiring (narrative category).
 *
 * Two paths:
 *  1. `runBeats()` — our own simple beat format (speaker + line + choices).
 *     This is what the dialogue team authors today; zero tooling needed.
 *  2. `runInk()` — real compiled ink JSON via inkjs (MIT, inkle).
 *     Author in Inky / Dialogue Tree Editor, export ink JSON, play it here.
 *
 * Both feed the same consumer: the game pulls { speaker, line, choices[] }
 * and renders them in the dialogue UI, then calls advance(choiceIndex).
 */

import { Story } from "inkjs";

export interface BeatChoice {
  label: string;
  next: string;
}

export interface Beat {
  id: string;
  speaker: string;
  line: string;
  /** variables this beat sets, e.g. { met_static: true } */
  set?: Record<string, string | number | boolean>;
  choices?: BeatChoice[];
}

export interface DialogueLine {
  speaker: string;
  line: string;
  choices: { label: string; index: number }[];
  done: boolean;
}

function fmtLine(line: string, vars: Record<string, string | number | boolean>): string {
  return line.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** Simple beats runtime — no compiler needed.
 *
 * Two-phase protocol (matches ink): next() emits the current beat; if the
 * previous beat offered choices, the choiceIndex argument resolves them
 * FIRST, then the new current beat is emitted. done means nothing was
 * produced AND nothing remains.
 */
export class BeatsRunner {
  private beats = new Map<string, Beat>();
  private vars: Record<string, string | number | boolean> = {};
  private current: string | null = null;
  private awaitingChoice: BeatChoice[] | null = null;

  constructor(beats: Beat[], startId: string, vars: Record<string, string | number | boolean> = {}) {
    for (const b of beats) this.beats.set(b.id, b);
    this.vars = { ...vars };
    this.current = startId;
  }

  get variables(): Record<string, string | number | boolean> {
    return { ...this.vars };
  }

  next(choiceIndex = 0): DialogueLine {
    // Resolve a pending choice from the previous beat first.
    if (this.awaitingChoice) {
      const pick = this.awaitingChoice[Math.min(choiceIndex, this.awaitingChoice.length - 1)];
      this.current = pick.next;
      this.awaitingChoice = null;
    }
    const beat = this.current ? this.beats.get(this.current) : undefined;
    if (!beat) return { speaker: "", line: "", choices: [], done: true };
    if (beat.set) Object.assign(this.vars, beat.set);
    const choices = (beat.choices ?? []).map((c, i) => ({ label: fmtLine(c.label, this.vars), index: i }));
    if (choices.length > 0) {
      this.awaitingChoice = beat.choices!;
    } else {
      this.current = null; // terminal beat: nothing remains after this line
    }
    return {
      speaker: beat.speaker,
      line: fmtLine(beat.line, this.vars),
      choices,
      done: false,
    };
  }
}

/** Real ink runtime via inkjs. Pass compiled ink JSON (from Inky). */
export class InkRunner {
  private story: Story;

  constructor(compiledJson: string | object) {
    const json = typeof compiledJson === "string" ? compiledJson : JSON.stringify(compiledJson);
    this.story = new Story(json);
  }

  next(choiceIndex = 0): DialogueLine {
    // At a choice point (or the very end): resolve it, don't emit content.
    if (!this.story.canContinue) {
      const choices = this.story.currentChoices.map((c, i) => ({ label: c.text, index: i }));
      if (choices.length > 0) {
        this.story.ChooseChoiceIndex(Math.min(choiceIndex, choices.length - 1));
        return this.next();
      }
      // done means: nothing produced AND nothing remains.
      return { speaker: "", line: "", choices: [], done: true };
    }
    const raw = this.story.Continue() ?? "";
    const text = raw.trim();
    // ink tags like "# speaker:STATIC" carry the speaker.
    const tags = this.story.currentTags ?? [];
    let speaker = "";
    for (const t of tags) {
      const m = /^speaker\s*:\s*(.+)$/i.exec(t.trim());
      if (m) speaker = m[1].trim();
    }
    const choices = this.story.currentChoices.map((c, i) => ({ label: c.text, index: i }));
    if (!text) return this.next(); // blank glue/divert line — skip it
    return { speaker, line: text, choices, done: false };
  }

  /** Read a declared ink variable by name (direct access is the reliable API in inkjs 2.4). */
  getVariable(name: string): unknown {
    try {
      return this.story.variablesState[name];
    } catch {
      return undefined;
    }
  }

  /** Best-effort dump of variables (may be empty on inkjs builds without enumeration). */
  get variables(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    try {
      const names = this.story.variablesState?.variableNames;
      const list: string[] = typeof names === "function" ? names() : Array.isArray(names) ? names : [];
      for (const k of list) out[k] = this.story.variablesState[k];
    } catch {
      /* best-effort */
    }
    return out;
  }
}

/** Sample: Static backstage beat sequence (beats format). */
export const STATIC_BACKSTAGE_BEATS: Beat[] = [
  {
    id: "start",
    speaker: "STATIC",
    line: "Yo, {player}. You heard what happened on the bus with Brian Cage's boy?",
    choices: [
      { label: "Nah, what happened?", next: "bus" },
      { label: "Don't care. We fightin' or what?", next: "fight" },
    ],
  },
  {
    id: "bus",
    speaker: "STATIC",
    line: "Man took my kindness for weakness. I don't start it, but I FINISH it. That's the JCPW way — what happens in that locker room stays there.",
    set: { heard_bus_story: true },
    choices: [
      { label: "F*ck AWE and their leaking.", next: "awe" },
      { label: "Let's just fight.", next: "fight" },
    ],
  },
  {
    id: "awe",
    speaker: "STATIC",
    line: "EXACTLY. All that p*ssy-ass fighting over there and they let it leak. Over here? You never heard about my fights 'cause I WON 'em.",
    set: { static_respect: 1 },
  },
  {
    id: "fight",
    speaker: "STATIC",
    line: "That's what I like to hear. Lace up. And keep your hands up — I throw 'em fast.",
  },
];
