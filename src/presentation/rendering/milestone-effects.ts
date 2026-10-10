import type { GameEvent } from '../../engine/model';
import type { GameWorld } from '../../engine/game-world';

export const LIFT_OFF_MS = 650;
export const FLIGHT_END_MS = 2400;
export const CURTAIN_CLOSE_START_MS = 2600;
export const CURTAIN_CLOSE_END_MS = 3400;
export const DEPARTURE_MS = 3600;
export const UNLOCK_MS = 1400;
export const ARRIVAL_MS = 1600;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
/** Includes the entire exhaust below the capsule, even on a tall viewport. */
export function flightPosition(elapsed: number, startY: number): number {
  const progress = clamp((elapsed - LIFT_OFF_MS) / (FLIGHT_END_MS - LIFT_OFF_MS));
  return startY - progress * progress * (startY + 220);
}
/** Right-hand space curtain: closing edge travels left, opening edge travels right. */
export function curtainEdge(kind: MilestoneFrame['kind'], elapsed: number): number {
  if (kind === 'departure') return 1 - clamp((elapsed - CURTAIN_CLOSE_START_MS) / (CURTAIN_CLOSE_END_MS - CURTAIN_CLOSE_START_MS));
  if (kind === 'arrival') return clamp((elapsed - 100) / 1300);
  return 1;
}
export interface MilestoneFrame {
  kind: 'unlock' | 'departure' | 'arrival';
  elapsed: number;
  x: number;
  y: number;
}

/** Presentation time is separate from replay/simulation ticks. */
export class MilestoneEffects {
  frame?: MilestoneFrame;
  reset(): void { this.frame = undefined; }
  arrive(world: GameWorld): void {
    this.frame = { kind: 'arrival', elapsed: 0, x: world.robot.x, y: world.robot.y };
  }
  consume(events: GameEvent[], world: GameWorld): void {
    if (world.status === 'dead') { this.reset(); return; }
    if (events.some(event => event.type === 'end')) {
      const [x, y] = world.next(world.robot, world.robot.direction);
      this.frame = { kind: 'departure', elapsed: 0, x, y };
    } else if (events.some(event => event.type === 'exit-open' && event.tick > 0)) {
      this.frame = { kind: 'unlock', elapsed: 0, x: world.robot.x, y: world.robot.y };
    }
  }
  update(ms: number): void {
    if (!this.frame) return;
    this.frame.elapsed += ms;
    const duration = this.frame.kind === 'unlock' ? UNLOCK_MS : this.frame.kind === 'arrival' ? ARRIVAL_MS : Infinity;
    if (this.frame.elapsed >= duration) this.reset();
  }
  /** The existing five win ticks run at the end of the flight. Replay format stays intact. */
  get holdingDeparture(): boolean {
    return this.frame?.kind === 'departure' && this.frame.elapsed < DEPARTURE_MS - 400;
  }
  get holdingArrival(): boolean { return this.frame?.kind === 'arrival'; }
  sample(interpolation = 0): MilestoneFrame | undefined {
    return this.frame && { ...this.frame, elapsed: this.frame.elapsed + interpolation };
  }
}
