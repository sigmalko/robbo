import { describe, expect, it } from 'vitest';
import type { Direction, Kind } from '../../main/game/model';
import { steps, world } from './helpers';

describe('Synchronized river boundary regression (#22)', () => {
  it.each([0, 1, 2, 3] as Direction[])('wraps an open edge symmetrically in direction %s', direction => {
    const w = world(['R....', '.....', '.....', '.....', '.....']);
    const starts = [[4, 2], [2, 4], [0, 2], [2, 0]];
    const ends = [[0, 2], [2, 0], [4, 2], [2, 4]];
    const river = w.spawn('river', ...starts[direction] as [number, number], undefined, [direction]);
    steps(w, 2); expect([river.x, river.y]).toEqual(ends[direction]);
    steps(w, 10); expect(river.alive).toBe(true);
  });

  it.each([0, 1, 2, 3] as Direction[])('removes a dying segment at its wrap boundary in direction %s', direction => {
    const w = world(['R....', '.....', '.....', '.....', '.....']);
    const starts = [[4, 2], [2, 4], [0, 2], [2, 0]];
    const river = w.spawn('river', ...starts[direction] as [number, number], undefined, [direction]);
    river.dying = 2; steps(w, 2);
    expect(river.alive).toBe(false); expect(w.entities.has(river.id)).toBe(false);
    expect([...w.entities.values()].filter(e => e.kind === 'river')).toHaveLength(0);
  });

  it('swaps opposed segments without overwriting either identity', () => {
    const w = world(['R.....', '......', '......', '......']);
    const a = w.spawn('river', 2, 2, undefined, [0]); const b = w.spawn('river', 3, 2, undefined, [2]);
    steps(w, 2); expect(w.at(3, 2)).toBe(a); expect(w.at(2, 2)).toBe(b);
    steps(w, 20); expect(a.alive && b.alive).toBe(true);
  });

  it('resolves crossing destinations once and does not overwrite a staying segment', () => {
    const w = world(['R.....', '......', '......', '......', '......', '......']);
    const horizontal = w.spawn('river', 1, 2, undefined, [0]); const vertical = w.spawn('river', 2, 1, undefined, [1]);
    steps(w, 2); expect(w.at(2, 2)).toBe(horizontal); expect(w.at(2, 1)).toBe(vertical);
    // Block the first segment's next step with an immune mirror; the trailing river must wait.
    w.spawn('mirror', 3, 2); vertical.direction = 1;
    steps(w, 2); expect(w.at(2, 2)).toBe(horizontal); expect(w.at(2, 1)).toBe(vertical);
    expect([...w.entities.values()].filter(e => e.kind === 'river')).toHaveLength(2);
  });

  it('recomputes the wrapping interval when a wall is removed or replaced', () => {
    const w = world(['R.......', '........', '..s.=s..', '........']);
    const river = w.at(4, 2)!; const wall = w.at(5, 2)!;
    steps(w, 2); expect(river.x).toBe(3);
    w.remove(wall); steps(w, 4); expect(river.x).toBe(5);
    w.spawn('wall', 6, 2); steps(w, 2); expect(river.x).toBe(3);
  });

  it.each(['bomb', 'question', 'cannon'] as Kind[])('absorbs %s without detonation, outcome or inventory', kind => {
    const w = world(['R......', '.......', '.......', '.......']);
    const target = w.spawn(kind, 3, 2); target.countdown = 100;
    const river = w.spawn('river', 2, 2, undefined, [0]);
    steps(w, 2);
    expect(target.alive).toBe(false); expect(w.at(3, 2)).toBe(river);
    expect(w.blasts).toHaveLength(0); expect(w.events.filter(event => event.tick > 0)).toHaveLength(0);
    expect([w.keys, w.ammo, w.collected]).toEqual([0, 0, 0]);
    expect([...w.entities.values()].some(e => e.kind === 'smoke' || e.kind === 'blast')).toBe(false);
  });

  it('stops actor actions and future river motion after the robot dies', () => {
    const w = world(['.......', '.......', '..R....', '.......']);
    const killer = w.spawn('river', 1, 2, undefined, [0]);
    const source = w.spawn('cannon', 5, 1); source.countdown = 1;
    steps(w, 2); expect(w.status).toBe('dead');
    expect(killer.alive).toBe(true);
    expect(w.events.filter(e => e.type === 'gun')).toHaveLength(0);
    steps(w, 8); expect(killer.alive).toBe(false);
    expect(w.events.filter(e => e.type === 'gun')).toHaveLength(0);
  });
});
