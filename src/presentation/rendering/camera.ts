import type { GameWorld } from '../../engine/game-world';
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
