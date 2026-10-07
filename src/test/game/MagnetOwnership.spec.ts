import { describe, expect, it } from 'vitest';
import { GameSession } from '../../main/game/Session';
import { level, steps, world } from './helpers';

describe('Magnet ownership and command suppression (#21)', () => {
  it('keeps the first owner while an opposing magnet sees the same robot and held fire is rejected', () => {
    const w = world(['.........', 'M....R..M', '.........'], { '0,1': [0], '8,1': [2] });
    w.ammo = 9;
    const owner = w.at(0, 1)!;
    for (let i = 0; i < 3; i++) {
      w.command(0, true); steps(w, 1);
      expect(w.magnetOwner).toBe(owner.id); expect(w.ammo).toBe(9);
    }
    expect(w.robot.x).toBe(2);
    expect(w.events.filter(e => e.type === 'magnet')).toHaveLength(1);
    expect(w.events.some(e => e.type === 'shoot')).toBe(false);
    expect([...w.entities.values()].some(e => e.kind === 'shot')).toBe(false);
  });
  it('clears removed ownership immediately and lets a surviving magnet acquire on the next tick', () => {
    const w = world(['.........', 'M....R..M', '.........'], { '0,1': [0], '8,1': [2] });
    const old = w.at(0, 1)!, next = w.at(8, 1)!;
    steps(w, 1); w.remove(old); expect(w.magnetOwner).toBeUndefined();
    steps(w, 1); expect(w.magnetOwner).toBe(next.id); expect(w.robot.x).toBe(5);
    expect(w.events.filter(e => e.type === 'magnet')).toHaveLength(2);
  });
  it('releases capture on occlusion instead of adopting C obstruction death', () => {
    const w = world(['........', 'M....R..', '........'], { '0,1': [0] });
    steps(w, 1); w.spawn('bomb', 3, 1); w.command(3); steps(w, 1);
    expect(w.magnetOwner).toBeUndefined(); expect(w.status).toBe('playing');
    expect([w.robot.x, w.robot.y]).toEqual([4, 0]);
    expect(w.at(3, 1)?.kind).toBe('bomb');
  });
  it('bounds outward scans and never attracts an intervening nonrobot object', () => {
    const w = world(['M.R.M', '.....'], { '0,0': [2], '4,0': [0] });
    const bomb = w.spawn('bomb', 1, 0); steps(w, 20);
    expect(w.magnetOwner).toBeUndefined(); expect([bomb.x, bomb.y]).toEqual([1, 0]);
    expect(w.status).toBe('playing');
  });
  it('retry replaces capture and inventory with a fresh uncaptured world', () => {
    const session = new GameSession({ id: 'test', name: 'Test', lastLevel: 1, levels: [level(['M....R..'], { '0,0': [0] })] }, 1);
    session.start(); session.step(); expect(session.world.magnetOwner).toBeDefined();
    const previous = session.world; session.restart();
    expect(session.world).not.toBe(previous); expect(session.world.magnetOwner).toBeUndefined();
    expect(session.world.robot.x).toBe(5);
  });
});
