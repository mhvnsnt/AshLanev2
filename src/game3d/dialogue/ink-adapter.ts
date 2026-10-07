/**
 * ink -> DialogueEvent adapter (Round 6 wiring, narrative category).
 *
 * The game already has a dialogue UI driven by DialogueEvent
 * (federated/dialogue.ts + overlays.ts). This session class lets a compiled
 * ink story (InkRunner) or a beats script (BeatsRunner) play through that
 * exact same UI: line -> options -> line -> end.
 */
import type { DialogueEvent } from "../federated/dialogue";
import type { BeatsRunner, InkRunner } from "./dialogue-runtime";

export type AnyRunner = BeatsRunner | InkRunner;

export class InkDialogueSession {
  private pending: { label: string; index: number }[] | null = null;
  private runner: AnyRunner;

  constructor(runner: AnyRunner) {
    this.runner = runner;
  }

  /** UI "continue" pressed. */
  next(): DialogueEvent {
    if (this.pending) {
      const opts = this.pending;
      this.pending = null;
      return {
        kind: "options",
        options: opts.map((o) => ({ label: o.label, jump: String(o.index) })),
      };
    }
    const line = this.runner.next(0);
    if (line.done) return { kind: "end" };
    if (line.choices.length > 0) this.pending = line.choices;
    return { kind: "line", speaker: line.speaker, text: line.line };
  }

  /** Player picked option idx. */
  choose(idx: number): DialogueEvent {
    this.pending = null;
    const line = this.runner.next(idx);
    if (line.done) return { kind: "end" };
    if (line.choices.length > 0) this.pending = line.choices;
    return { kind: "line", speaker: line.speaker, text: line.line };
  }
}
