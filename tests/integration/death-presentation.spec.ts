import { describe, expect, it } from 'vitest';
import { GameSession } from '../../src/application/game-session';
import { level } from '../fixtures/world';

describe('Death presentation lifecycle (#34)', () => {
  it('keeps a retry on the dying board until one delayed automatic reload', () => {
    const session = new GameSession({ id: 'test', name: 'Test', lastLevel: 1, levels: [level(['R.^'])] }, 1);
    session.start(); const old = session.world;
    session.retry(); session.step();
    expect(session.world).toBe(old); expect(old.status).toBe('dead');
    for (let tick = 0; tick < GameSession.deathRestartTicks - 2; tick++) session.step();
    expect(session.world).toBe(old); expect(old.statusTicks).toBe(GameSession.deathRestartTicks - 1);
    session.step();
    expect(session.world).not.toBe(old); expect(session.world.status).toBe('playing'); expect(session.generation).toBe(2);
  });

  it('does not schedule a second reload when retry is pressed during the presentation', () => {
    const session = new GameSession({ id: 'test', name: 'Test', lastLevel: 1, levels: [level(['R.^'])] }, 1);
    session.start(); session.retry(); session.retry(); session.step();
    for (let tick = 0; tick < GameSession.deathRestartTicks - 1; tick++) session.step();
    expect(session.generation).toBe(2);
  });
});
