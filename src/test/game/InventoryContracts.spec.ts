import { describe, expect, it } from 'vitest';
import { steps, world } from './helpers';
import type { Direction } from '../../main/game/model';

describe('Java inventory contracts reviewed against C (#36)', () => {
  it.each([0, 1, 2, 3] as Direction[])('consumes one border shot in direction %s without a projectile or movement', direction => {
    const w = world(['R']); w.ammo = 1;
    w.command(direction, true); steps(w, 1);
    expect(w.ammo).toBe(0); expect(w.robot.direction).toBe(direction);
    expect([w.robot.x, w.robot.y]).toEqual([0, 0]);
    expect(w.events.filter(e => e.type === 'shoot')).toHaveLength(1);
    expect(w.entities.size).toBe(1);
    w.command(direction, true); steps(w, 1);
    expect(w.events.filter(e => e.type === 'shoot')).toHaveLength(1);
  });
  it('suppresses fire throughout materialization without charging ammo or queuing a delayed shot', () => {
    const w = world(['R&...&..', '........'], { '1,0': [1, 0], '5,0': [1, 1] }); w.ammo = 9;
    w.command(0); steps(w, 1); const arrival = [w.robot.x, w.robot.y];
    for (let i = 0; i < 4; i++) { w.command(0, true); steps(w, 1); }
    expect(w.ammo).toBe(9); expect([w.robot.x, w.robot.y]).toEqual(arrival);
    steps(w, 1); expect(w.events.some(e => e.type === 'shoot')).toBe(false);
    w.command(0, true); steps(w, 1); expect(w.ammo).toBe(8);
  });
  it('initializes a zero-screw exit as active and leaves a destroyed target screw missing', () => {
    const empty = world(['R!']); expect(empty.remaining).toBe(0);
    empty.command(0); steps(empty, 1); expect(empty.status).toBe('won');
    const missing = world(['R.T!']); missing.damage(missing.at(2, 0)!, 'blast');
    expect(missing.remaining).toBe(1); expect(missing.collected).toBe(0);
    steps(missing, 4); missing.command(0); steps(missing, 1); missing.command(0); steps(missing, 1);
    missing.command(0); steps(missing, 1); expect(missing.status).toBe('playing');
  });
  it('counts more than two digits of authored screws independently of capped consumables', () => {
    const w = world(['R' + 'T'.repeat(123)]); expect(w.remaining).toBe(123);
    for (let i = 0; i < 123; i++) { w.command(0); steps(w, 1); }
    expect(w.remaining).toBe(0); expect(w.collected).toBe(123);
  });
});
