import type { LevelData } from '../../main/game/model';
import { GameWorld } from '../../main/game/World';
export function level(rows: string[], options: Record<string, number[]> = {}): LevelData {
  if (rows.some(r => r.length !== rows[0].length)) throw Error('Invalid fixture dimensions');
  return { number: 1, width: rows[0].length, height: rows.length, rows, options, colour: '#608050', author: 'Test', notes: '', offset: '' };
}
export function world(rows: string[], options: Record<string, number[]> = {}, random: () => number = () => 0.5): GameWorld { return new GameWorld(level(rows, options), random); }
export function steps(w: GameWorld, count: number): void { for (let i = 0; i < count; i++) { w.step(); w.assertConsistent(); } }
