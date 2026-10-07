import { describe, expect, it } from 'vitest';
import { javaTheme, neonTheme, themeBackground, themes, validateTheme } from '../../main/game/Theme';
import { frameFor } from '../../main/game/Art';
import { packs } from '../../main/game/packs';
import { GameWorld } from '../../main/game/World';
const atlas = { width: 410, height: 274 }, digits = { width: 178, height: 32 };
describe('Validated theme assets', () => {
  it('accepts original dimensions and rejects historical narrower previews', () => {
    expect(() => validateTheme(javaTheme, atlas, digits)).not.toThrow();
    expect(() => validateTheme(neonTheme, atlas, digits)).not.toThrow();
    expect(themes).toHaveLength(12);
    expect(new Set(themes.map(theme => theme.id)).size).toBe(12);
    for (const theme of themes) expect(() => validateTheme(theme, theme.atlas, digits)).not.toThrow();
    expect(() => validateTheme(javaTheme, { width: 376, height: 274 }, digits)).toThrow('dimensions');
    expect(() => validateTheme(javaTheme, atlas, { width: 170, height: 32 })).toThrow('dimensions');
  });
  it('accepts proportional high-resolution frames and rejects incompatible padding', () => {
    const theme = themes.find(theme => theme.id === 'planet-journey-1')!;
    expect(theme.atlas.cell).toBe(128);
    expect(() => validateTheme(theme, theme.atlas, digits)).not.toThrow();
    expect(() => validateTheme({ ...theme, atlas: { ...theme.atlas, inset: 2 } }, theme.atlas, digits)).toThrow('layout');
  });
  it('rejects truncated frames, altered layout and invalid palette', () => {
    expect(() => validateTheme({ ...javaTheme, frames: [[12, 8]] }, atlas, digits)).toThrow('bounds');
    expect(() => validateTheme({ ...javaTheme, frames: [] }, atlas, digits)).toThrow('missing required');
    expect(() => validateTheme({ ...javaTheme, atlas: { ...javaTheme.atlas, stride: 32 } }, atlas, digits)).toThrow('layout');
    expect(() => validateTheme({ ...javaTheme, palette: { background: 'red' } }, atlas, digits)).toThrow('palette');
  });
  it('resolves pack-scoped level palettes without mutating simulation', () => {
    const theme = { ...javaTheme, palette: { background: '#123456', levels: { '01:3': '#abcdef' } } };
    expect(themeBackground(theme, '01', 3, '#000000')).toBe('#abcdef');
    expect(themeBackground(theme, '02', 3, '#000000')).toBe('#123456');
    expect(themeBackground(javaTheme, '01', 3, '#000000')).toBe('#000000');
    for (const pack of packs) for (const level of pack.levels) {
      const world = new GameWorld(level, () => 0.5);
      const before = JSON.stringify([...world.entities.values()]);
      for (const entity of world.entities.values()) expect(javaTheme.frames).toContainEqual(frameFor(entity, world));
      expect(JSON.stringify([...world.entities.values()])).toBe(before);
    }
  });
});
