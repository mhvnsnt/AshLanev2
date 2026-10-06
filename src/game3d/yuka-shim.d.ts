/**
 * Minimal type shim for the yuka (MIT) API surface we use.
 * yuka@0.7.8 ships untyped JS; the @types/yuka package targets a newer,
 * stricter API (GameEntity-bound state machines) that the runtime does not
 * require. This shim describes exactly what opponent-brain.ts uses and
 * nothing more — verified against the installed runtime.
 */
declare module "yuka" {
  export class State<Owner = unknown> {
    enter(owner: Owner): void;
    execute(owner: Owner, delta?: number): void;
    exit(owner: Owner): void;
  }

  export class StateMachine<Owner = unknown> {
    constructor(owner?: Owner);
    add(id: string, state: State<Owner>): this;
    remove(id: string): this;
    changeTo(id: string): this;
    update(delta?: number): this;
    readonly currentState: State<Owner> | null;
    readonly owner: Owner;
  }
}
