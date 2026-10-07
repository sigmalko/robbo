import { describe, expect, it } from 'vitest';
import { world, steps } from '../fixtures/world';
import { GameSession } from '../../src/application/game-session';
import { level } from '../fixtures/world';
import { soundFiles } from '../../src/browser/audio/game-audio';

describe('Exit activation feedback', () => {
  it('uses an existing distinct cue and activates once on the final required pickup', () => {
    expect(soundFiles['exit-open']).not.toBe(soundFiles.screw);
    const w = world(['ssssssss', 'sRTT!..s', 'ssssssss']);
    w.command(0); steps(w, 1); expect(w.drainEvents().map(e => e.type)).toContain('screw');
    w.command(0); steps(w, 1);
    expect(w.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(1);
    const extra = w.spawn('screw', 5, 1);
    w.damage(extra, 'blast'); steps(w, 6);
    expect(w.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(0);
  });
  it('announces a zero-screw world once at initialization and again on a fresh retry', () => {
    const data = level(['sssss', 'sR!.s', 'sssss']);
    const s = new GameSession({ id: 'test', name: 'Test', lastLevel: 1, levels: [data] }, 1);
    expect(s.world.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(1);
    s.start(); s.step(); expect(s.world.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(0);
    s.restart(); expect(s.world.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(1);
  });
  it('does not award an activation for destroying a required screw', () => {
    const w = world(['sssssss', 'sR.T!.s', 'sssssss']);
    w.damage(w.at(3, 1), 'blast'); steps(w, 6);
    expect(w.remaining).toBe(1); expect(w.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(0);
  });
  it('allows a generated screw to satisfy the authored target without repeated unlocks', () => {
    const w = world(['ssssssss', 'sR...T!s', 'ssssssss']);
    w.spawn('screw', 2, 1); w.command(0); steps(w, 1);
    expect(w.remaining).toBe(0); expect(w.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(1);
    for (let i = 0; i < 3; i++) { w.command(0); steps(w, 1); }
    expect(w.drainEvents().filter(e => e.type === 'exit-open')).toHaveLength(0);
  });
});
