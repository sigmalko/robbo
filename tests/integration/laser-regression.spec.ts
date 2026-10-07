import { describe, expect, it } from 'vitest';
import { steps, world } from '../fixtures/world';

function laserWorld() {
  const w = world(['R.........', '..........', '.}........', '..........']);
  const source = w.at(1, 2)!; source.countdown = 100; w.fire(source, 0, 1); steps(w, 4);
  return { w, source };
}

describe('Identity-owned laser cleanup (#17)', () => {
  it('preserves a replacement occupant after removing a middle segment', () => {
    const { w, source } = laserWorld();
    const segment = w.at(3, 2)!; w.remove(segment);
    const replacement = w.spawn('key', 3, 2);
    w.remove(source); steps(w, 1);
    expect(w.lasers).toHaveLength(0); expect(w.at(3, 2)).toBe(replacement);
    expect([...w.entities.values()].some(e => e.kind === 'beam')).toBe(false);
  });

  it('retracts at most one owned segment per tick across a broken path', () => {
    const { w } = laserWorld();
    w.damage(w.at(3, 2)!, 'blast');
    steps(w, 5); // Extension reaches the open map edge and switches to retraction.
    expect(w.lasers[0].returning).toBe(true);
    while (w.lasers.length) {
      const previous = w.lasers[0].parts.length;
      steps(w, 1);
      expect(w.lasers[0]?.parts.length ?? 0).toBe(previous - 1);
    }
    expect([...w.entities.values()].some(e => e.kind === 'beam')).toBe(false);
  });

  it('cleans up after river absorption without deleting the river', () => {
    const { w, source } = laserWorld();
    const river = w.spawn('river', 1, 3, undefined, [3]);
    steps(w, 2); expect(source.alive).toBe(false); expect(w.at(1, 2)).toBe(river);
    steps(w, 1); expect(w.lasers).toHaveLength(0);
    expect(river.alive).toBe(true);
    expect([...w.entities.values()].some(e => e.kind === 'beam')).toBe(false);
  });

  it('keeps an existing beam anchored to its firing coordinates after source relocation', () => {
    const { w, source } = laserWorld();
    expect(w.move(source, 1, 1)).toBe(true);
    steps(w, 1); expect(w.at(6, 2)?.kind).toBe('beam');
    expect(w.at(6, 1)).toBeUndefined();
    steps(w, 20); expect(w.lasers).toHaveLength(0);
  });
});
