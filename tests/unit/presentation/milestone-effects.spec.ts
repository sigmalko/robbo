import { describe, expect, it } from 'vitest';
import { MilestoneEffects, DEPARTURE_MS, ARRIVAL_MS, FLIGHT_END_MS, CURTAIN_CLOSE_START_MS, curtainEdge, flightPosition } from '../../../src/presentation/rendering/milestone-effects';
import { world } from '../../fixtures/world';

describe('Milestone presentation clock', () => {
  it('celebrates a real final pickup once, without celebrating an empty starting planet', () => {
    const effects = new MilestoneEffects();
    const empty = world(['ssss', 'sR!s', 'ssss']);
    effects.consume(empty.drainEvents(), empty); expect(effects.frame).toBeUndefined();
    const w = world(['sssss', 'sRT!s', 'sssss']);
    w.command(0); w.step(); effects.consume(w.drainEvents(), w);
    expect(effects.frame).toMatchObject({ kind: 'unlock', x: 2, y: 1, elapsed: 0 });
    effects.update(500); effects.consume(w.drainEvents(), w);
    expect(effects.frame?.elapsed).toBe(500);
    effects.update(900); expect(effects.frame).toBeUndefined();
  });
  it('uses the entered ship, not an arbitrary ship, and holds only the presentation', () => {
    const w = world(['sssssss', 's!R!..s', 'sssssss']);
    w.drainEvents(); w.command(0); w.step();
    const effects = new MilestoneEffects(); effects.consume(w.drainEvents(), w);
    expect(effects.frame).toMatchObject({ kind: 'departure', x: 3, y: 1 });
    expect(effects.holdingDeparture).toBe(true);
    effects.update(DEPARTURE_MS - 400); expect(effects.holdingDeparture).toBe(false);
    expect(w.statusTicks).toBe(0); expect(w.robot.x).toBe(2);
    effects.arrive(w); expect(effects.frame?.kind).toBe('arrival');
    expect(effects.holdingArrival).toBe(true);
    effects.update(ARRIVAL_MS); expect(effects.frame).toBeUndefined();
  });
  it('clears the capsule and its entire exhaust before closing the curtain at any viewport height', () => {
    for (const y of [16, 240, 900, 1600]) {
      expect(flightPosition(FLIGHT_END_MS, y) + 16 + 135).toBeLessThan(0);
      expect(curtainEdge('departure', FLIGHT_END_MS)).toBe(1);
      expect(curtainEdge('departure', CURTAIN_CLOSE_START_MS)).toBe(1);
    }
    expect(curtainEdge('departure', 3000)).toBe(0.5);
    expect(curtainEdge('departure', DEPARTURE_MS)).toBe(0);
    expect(curtainEdge('arrival', 0)).toBe(0);
    expect(curtainEdge('arrival', 750)).toBe(0.5);
    expect(curtainEdge('arrival', ARRIVAL_MS)).toBe(1);
  });
  it('resets on death/restart and does not mutate the sampled clock', () => {
    const effects = new MilestoneEffects(), w = world(['ssss', 'sR!s', 'ssss']);
    effects.arrive(w); expect(effects.sample(33)?.elapsed).toBe(33); expect(effects.frame?.elapsed).toBe(0);
    w.beginDeathPresentation(); effects.consume(w.drainEvents(), w); expect(effects.frame).toBeUndefined();
    effects.arrive(w); effects.reset(); expect(effects.holdingDeparture).toBe(false);
  });
});
