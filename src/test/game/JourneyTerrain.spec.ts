import { describe, expect, it } from 'vitest';
import { wallMask } from '../../../website/journey-terrain';
import { GameWorld } from '../../main/game/World';
import { packs } from '../../main/game/packs';

describe('Presentation-only connected terrain', () => {
  it('connects every wall-neighbour combination without changing entities', () => {
    for (let mask = 0; mask < 16; mask++) {
      const rows = ['R....', `..${mask & 1 ? 's' : '.'}..`, `.${mask & 8 ? 's' : '.'}s${mask & 2 ? 's' : '.'}.`, `..${mask & 4 ? 's' : '.'}..`, '.....'];
      const world = new GameWorld({ ...packs[0].levels[0], rows, width: 5, height: 5, options: {} }, () => .5);
      const before = JSON.stringify([...world.entities.values()]);
      expect(wallMask(world, 2, 2)).toBe(mask);
      expect(JSON.stringify([...world.entities.values()])).toBe(before);
    }
  });
  it('does not join walls to crates, doors, sand or the edge of the level', () => {
    const world = new GameWorld({ ...packs[0].levels[0], rows: ['sD#', 'HR.', '...'], width: 3, height: 3, options: {} }, () => .5);
    expect(wallMask(world, 0, 0)).toBe(0);
  });
});
