import { describe, expect, it } from 'vitest';
import { Camera } from '../../../src/presentation/rendering/camera';
import { viewportSize } from '../../../src/presentation/rendering/viewport';
import { world } from '../../fixtures/world';
describe('Presentation-only camera bounds', () => {
  it.each([[1, 1], [8, 31], [80, 8], [256, 256]])('frames %s by %s boards without changing simulation', (width, height) => {
    const rows = Array.from({ length: height }, (_, y) => '.'.repeat(width - 1) + (y === height - 1 ? 'R' : '.'));
    const w = world(rows); const before = JSON.stringify([...w.entities.values()]); const camera = new Camera();
    camera.focus(w); camera.update(w);
    expect(camera.x).toBeGreaterThanOrEqual(0); expect(camera.y).toBeGreaterThanOrEqual(0);
    expect(camera.x).toBeLessThanOrEqual(Math.max(0, width - 16)); expect(camera.y).toBeLessThanOrEqual(Math.max(0, height - 16));
    expect(w.robot.x - camera.x).toBeLessThan(16); expect(w.robot.y - camera.y).toBeLessThan(16);
    expect(JSON.stringify([...w.entities.values()])).toBe(before); expect(w.tick).toBe(0);
  });
  it('immediately frames remote teleport destinations and supports smaller viewports', () => {
    const w = world(['R' + '.'.repeat(79)]); const camera = new Camera(8, 8);
    w.robot.x = 79; camera.update(w); expect(camera.x).toBe(72);
    camera.update(w, true); expect(camera.x).toBe(72);
    expect(() => new Camera(0, 16)).toThrow('Invalid camera');
  });
  it('reframes a running world across portrait, landscape and desktop sizes without advancing it', () => {
    const w = world(Array.from({ length: 80 }, (_, y) => '.'.repeat(79) + (y === 79 ? 'R' : '.')));
    const camera = new Camera();
    const before = JSON.stringify([...w.entities.values()]);
    for (const [width, height] of [[320, 580], [800, 200], [1440, 800], [1, 1]]) {
      const view = viewportSize(width, height, 3);
      expect(view.tileSize).toBe(32);
      camera.resize(view.columns, view.rows, w);
      expect(camera.x).toBeGreaterThanOrEqual(0);
      expect(camera.y).toBeGreaterThanOrEqual(0);
      expect(w.robot.x - camera.x).toBeLessThan(view.columns);
      expect(w.robot.y - camera.y).toBeLessThan(view.rows);
      expect(view.columns * view.tileSize).toBeCloseTo(width);
      expect(view.rows * view.tileSize).toBeCloseTo(height);
      expect(view.backingWidth).toBe(width * 2);
      expect(view.backingHeight).toBe(height * 2);
    }
    expect(JSON.stringify([...w.entities.values()])).toBe(before);
    expect(w.tick).toBe(0);
    expect(() => camera.resize(NaN, 16, w)).toThrow('Invalid camera');
    expect(() => camera.resize(16, Infinity, w)).toThrow('Invalid camera');
  });
  it.each([1, 2, 3])('keeps objects the same size at DPR %s, including narrow and desktop viewports', pixelRatio => {
    for (const [width, height] of [[1, 1], [128, 96], [320, 640], [915, 254], [1920, 1080]]) {
      const view = viewportSize(width, height, pixelRatio);
      expect(view.tileSize).toBe(32);
      expect(view.columns).toBe(width / 32);
      expect(view.rows).toBe(height / 32);
      expect(view.backingWidth).toBe(width * Math.min(2, pixelRatio));
    }
  });
});
