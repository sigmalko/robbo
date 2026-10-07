import { describe, expect, it } from 'vitest';
import { GameSession } from '../../src/application/game-session';
import { level, steps, world } from '../fixtures/world';

describe('Java flame callbacks (#16)', () => {
  it('detonates a bomb once and leaves its neighboring chain scheduled', () => {
    const w = world(['R.........', '..........', '.}.bb.....', '..........']);
    const source = w.at(1, 2)!; source.countdown = 100;
    w.fire(source, 0, 2); steps(w, 2);
    expect(w.events.filter(e => e.type === 'bomb')).toHaveLength(2);
    expect(w.blasts.find(b => b.x === 4)?.phase).toBe(0);
    steps(w, 20);
    expect(w.events.filter(e => e.type === 'bomb')).toHaveLength(2);
    expect([...w.entities.values()].some(e => e.kind === 'flame')).toBe(false);
  });

  it('preserves a question smoke callback instead of erasing its outcome', () => {
    const w = world(['R.........', '..........', '.}.?......', '..........'], {}, () => 0.4);
    const source = w.at(1, 2)!; source.countdown = 100;
    w.fire(source, 0, 2); steps(w, 1);
    expect(w.at(3, 2)).toMatchObject({ kind: 'smoke', after: 'sand' });
    steps(w, 3);
    expect(w.at(3, 2)).toMatchObject({ kind: 'sand', age: 0 });
    expect([...w.entities.values()].some(e => e.kind === 'flame')).toBe(false);
  });

  it('allows the independent seven-part sequence to finish after source loss', () => {
    const w = world(['R..............', '...............', '.}.............', '...............']);
    const source = w.at(1, 2)!; w.fire(source, 0, 2); w.remove(source);
    steps(w, 6);
    expect([...w.entities.values()].filter(e => e.kind === 'flame').map(e => e.index).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    steps(w, 30); expect([...w.entities.values()].some(e => e.kind === 'flame')).toBe(false);
  });

  it('discards the entire old trail on session retry', () => {
    const fixture = level(['R.......', '.}......', '........']);
    const session = new GameSession({ id: 'test', name: 'Test', lastLevel: 1, levels: [fixture] }, 1);
    session.start(); session.world.fire(session.world.at(1, 1)!, 0, 2); session.step();
    session.restart();
    expect([...session.world.entities.values()].some(e => e.kind === 'flame')).toBe(false);
    expect(session.world.tick).toBe(0);
  });
});
