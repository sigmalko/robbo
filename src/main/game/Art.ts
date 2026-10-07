import type { Entity } from './model';
import type { GameWorld } from './World';
export type AtlasCell = [number, number];
const walls: Record<string, AtlasCell> = { s: [5, 2], '-': [7, 1], O: [2, 0], o: [2, 0], S: [5, 2], p: [8, 5], P: [9, 5], Q: [3, 0], q: [9, 1], '+': [10, 1] };
/** Pure lookup of the Java render-enum coordinates. */
export function frameFor(e: Entity, world: GameWorld): AtlasCell {
  switch (e.kind) {
    case 'robot':
      if (world.teleportTicks) return [Math.max(2, 5 - world.teleportTicks), 4];
      return [e.direction * 2 + e.frame, 5];
    case 'wall': return walls[e.symbol];
    case 'ship': return [world.remaining === 0 && world.tick % 4 === 0 ? 5 : 6, 1];
    case 'screw': return [4, 0];
    case 'key': return [7, 0];
    case 'ammo': return [5, 0];
    case 'door': return [9, 0];
    case 'box': return [6, 0];
    case 'momentum': return [8, 1];
    case 'bomb': return [8, 0];
    case 'question': return [0, 1];
    case 'mirror': return [Math.floor(e.age / 4) % 2, 4];
    case 'magnet': return ([[0, 0], [0, 6], [1, 0], [1, 6]] as AtlasCell[])[e.direction];
    case 'river': return e.dying ? [Math.max(2, 4 - Math.floor((world.tick - (e.dying - 6)) / 2)), 4] : [9, 3 + e.id % 2];
    case 'bird': return [3 + e.age % 2, 1];
    case 'bear': return [e.age % 2 ? 1 : 2, 1];
    case 'worm': return [6 + e.age % 2, 2];
    case 'eyes': return [e.age % 4 === 0 ? 8 : 9, 2];
    case 'cannon':
      return (e.moving || e.rotating ? [[8, 7], [9, 6], [9, 7], [8, 6]] : [[5, 4], [6, 4], [7, 4], [8, 4]])[e.fireDirection] as AtlasCell;
    case 'sand': return [5, 6];
    case 'stop': return [4, 6];
    case 'shot': return [(e.direction % 2 ? 2 : 0) + e.age % 2, 3];
    case 'beam': return [e.direction % 2 ? 2 : 0, 3];
    case 'flame': return [10, [3, 4, 5, 5, 5, 4, 3][e.index]];
    case 'smoke': return [Math.max(2, 4 - e.age), 4];
    case 'impact': return [3 + Math.min(1, e.age), 2];
    case 'blast': return [1 + Math.min(3, e.age), 2];
  }
}
/** Presentation-only camera; resizing never changes world coordinates or simulation. */
export class Camera {
  x = 0; y = 0;
  private returnX?: number;
  private returnY?: number;
  constructor(public columns = 16, public rows = 16) {
    this.validate(columns, rows);
  }
  private validate(columns: number, rows: number): void {
    if (!Number.isFinite(columns) || !Number.isFinite(rows) || columns <= 0 || rows <= 0) throw Error('Invalid camera viewport');
  }
  resize(columns: number, rows: number, world: GameWorld): void {
    this.validate(columns, rows);
    if (columns === this.columns && rows === this.rows) return;
    this.columns = columns; this.rows = rows;
    this.focus(world);
  }
  reset(): void { this.x = 0; this.y = 0; this.returnX = undefined; this.returnY = undefined; }
  private clamp(world: GameWorld): void {
    this.x = Math.max(0, Math.min(this.x, Math.max(0, world.level.width - this.columns)));
    this.y = Math.max(0, Math.min(this.y, Math.max(0, world.level.height - this.rows)));
  }
  focus(world: GameWorld): void {
    this.returnX = undefined; this.returnY = undefined;
    this.x = world.robot.x - Math.floor(this.columns / 2);
    this.y = world.robot.y - Math.floor(this.rows / 2);
    this.clamp(world);
  }
  /** Return to the original Robbo position without modifying the world. */
  returnToStart(world: GameWorld, immediate = false): void {
    this.returnX = Math.max(0, Math.min(world.startX - Math.floor(this.columns / 2), Math.max(0, world.level.width - this.columns)));
    this.returnY = Math.max(0, Math.min(world.startY - Math.floor(this.rows / 2), Math.max(0, world.level.height - this.rows)));
    if (immediate) { this.x = this.returnX; this.y = this.returnY; }
  }
  update(world: GameWorld, reducedMotion = false): void {
    if (this.returnX !== undefined && this.returnY !== undefined) {
      if (reducedMotion) { this.x = this.returnX; this.y = this.returnY; }
      else {
        this.x += Math.sign(this.returnX - this.x);
        this.y += Math.sign(this.returnY - this.y);
      }
      return;
    }
    const robot = world.robot;
    if (reducedMotion || robot.x < this.x || robot.x >= this.x + this.columns || robot.y < this.y || robot.y >= this.y + this.rows) {
      this.focus(world); return;
    }
    const mx = Math.max(0, Math.min(5, Math.floor((this.columns - 1) / 2)));
    const my = Math.max(0, Math.min(5, Math.floor((this.rows - 1) / 2)));
    if (robot.x - this.x + mx > this.columns) this.x++;
    if (robot.x - this.x < mx) this.x--;
    if (robot.y - this.y + my > this.rows) this.y++;
    if (robot.y - this.y < my) this.y--;
    this.clamp(world);
  }
}
