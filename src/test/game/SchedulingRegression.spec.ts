import { describe, expect, it } from 'vitest';
import { inverse } from '../../main/game/model';
import type { Direction } from '../../main/game/model';
import { steps, world } from './helpers';

describe('Identity snapshot scheduling (#12)', () => {
  it.each([0, 1, 2, 3] as Direction[])('moves a shooter once and defers its newborn projectile in direction %s', direction => {
    const w = world(['R........', '.........', '.........', '.........', '....}....', '.........', '.........', '.........', '.........']);
    const shooter = w.at(4, 4)!;
    shooter.direction = direction; shooter.fireDirection = direction; shooter.moving = true; shooter.countdown = 0;
    const [x, y] = w.next(shooter, direction);
    steps(w, 1);
    // Firing precedes movement: the newborn shot blocks the first move.
    expect([shooter.x, shooter.y]).toEqual([4, 4]);
    const shot = w.at(x, y)!;
    expect(shot.kind).toBe('shot'); expect(shot.age).toBe(0);
    expect(w.events.filter(e => e.type === 'gun')).toHaveLength(1);
    steps(w, 1);
    expect([shooter.x, shooter.y]).toEqual(w.next({ x: 4, y: 4 }, inverse(direction)));
    expect([shot.x, shot.y]).toEqual(w.next({ x, y }, direction));
    expect(shooter.countdown).toBe(24);
  });

  it('does not update a shooter destroyed before its actor phase', () => {
    const w = world(['R.......', '........', '..?}....', '........']);
    const question = w.at(2, 2)!; const cannon = w.at(3, 2)!;
    // Cannons are intentionally blast-immune, so use a shooting bird instead.
    w.remove(cannon); const bird = w.spawn('bird', 3, 2, undefined, [0, 0, 1]); bird.countdown = 0;
    w.remove(question); const bomb = w.spawn('bomb', 2, 2); w.damage(bomb, 'shot');
    steps(w, 1);
    expect(bird.alive).toBe(false);
    expect(w.events.filter(e => e.type === 'gun')).toHaveLength(0);
    expect([...w.entities.values()].filter(e => e.kind === 'shot')).toHaveLength(0);
  });

  it('does not animate or move a question outcome on its materialization tick', () => {
    const w = world(['R.......', '........', '..?.....', '........'], {}, () => 0);
    w.damage(w.at(2, 2)!, 'shot'); steps(w, 3);
    const river = w.at(2, 2)!;
    expect(river.kind).toBe('river'); expect(river.age).toBe(0);
    steps(w, 1); expect([river.x, river.y, river.age]).toEqual([2, 2, 1]);
    steps(w, 1); expect([river.x, river.y, river.age]).toEqual([1, 2, 2]);
  });

  it('defers a chained bomb until the next tick and detonates each identity once', () => {
    const w = world(['R.......', '........', '........', '........']);
    w.spawn('bomb', 2, 2); const second = w.spawn('bomb', 3, 2);
    w.damage(w.at(2, 2)!, 'shot'); steps(w, 1);
    expect(second.alive).toBe(false);
    expect(w.blasts).toHaveLength(2);
    expect(w.blasts.find(b => b.x === 3)?.phase).toBe(0);
    expect(w.events.filter(e => e.type === 'bomb')).toHaveLength(2);
    steps(w, 8); expect(w.blasts).toHaveLength(0);
    expect(w.events.filter(e => e.type === 'bomb')).toHaveLength(2);
  });
});
