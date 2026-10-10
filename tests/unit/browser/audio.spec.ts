import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameAudio, soundFiles } from '../../../src/browser/audio/game-audio';
import { world, steps } from '../../fixtures/world';

class AudioFake {
  static calls: string[] = [];
  static rejection?: DOMException;
  paused = true; ended = false; volume = 1; currentTime = 0; preload = '';
  constructor(readonly src: string) {}
  addEventListener() {}
  cloneNode() { return new AudioFake(this.src); }
  pause() { this.paused = true; }
  play() { AudioFake.calls.push(this.src); this.paused = false; return AudioFake.rejection ? Promise.reject(AudioFake.rejection) : Promise.resolve(); }
}
afterEach(() => { vi.unstubAllGlobals(); AudioFake.calls = []; AudioFake.rejection = undefined; });
describe('Audio activation and lifecycle', () => {
  it('maps all 17 events to assets, waits for activation and bounds overlapping voices', async () => {
    vi.stubGlobal('Audio', AudioFake); const audio = new GameAudio();
    audio.consume([{ type: 'ammo', tick: 1 }]); expect(AudioFake.calls).toHaveLength(0);
    audio.unlock(); audio.stop();
    for (const type of Object.keys(soundFiles) as (keyof typeof soundFiles)[]) audio.consume([{ type, tick: 1 }]);
    expect(new Set(AudioFake.calls)).toHaveLength(17);
    audio.stop(); AudioFake.calls = [];
    for (let i = 0; i < 20; i++) audio.play('bomb');
    expect(AudioFake.calls.filter(c => c.endsWith('/bomb.ogg'))).toHaveLength(4);
    audio.stop(); audio.setMuted(true); const count = AudioFake.calls.length; audio.play('kill'); expect(AudioFake.calls).toHaveLength(count);
    audio.setMuted(false); audio.setVolume(0.2); audio.play('kill'); expect(AudioFake.calls).toHaveLength(count + 1);
    await Promise.resolve(); expect(audio.failures.size).toBe(0);
  });
  it('prioritizes the final screw over overlapping footsteps and enemy calls', () => {
    vi.stubGlobal('Audio', AudioFake); const audio = new GameAudio();
    audio.unlock(); AudioFake.calls = [];
    audio.consume([{ type: 'walk', tick: 1 }, { type: 'exit-open', tick: 1 }, { type: 'bird', tick: 1 }]);
    expect(AudioFake.calls).toEqual(['sounds/ship-ready.wav']);
    audio.setMuted(true); audio.consume([{ type: 'end', tick: 2 }]);
    expect(AudioFake.calls).toHaveLength(1);
  });
  it('resumes an interrupted flight from its current audio position', () => {
    vi.stubGlobal('Audio', AudioFake); const audio = new GameAudio();
    audio.unlock(); audio.consume([{ type: 'end', tick: 1 }]);
    const voices = (audio as unknown as { voices: Map<string, AudioFake[]> }).voices;
    const flight = voices.get('end')![0]; flight.currentTime = 0.8;
    audio.pause(); expect(flight.paused).toBe(true);
    audio.resume(); expect(flight.paused).toBe(false); expect(flight.currentTime).toBe(0.8);
    audio.pause(); audio.stop(); const count = AudioFake.calls.length;
    audio.resume(); expect(AudioFake.calls).toHaveLength(count);
  });
  it('handles rejected playback and allows a later activation to recover', async () => {
    vi.stubGlobal('Audio', AudioFake); const messages: string[] = []; const audio = new GameAudio(m => messages.push(m));
    AudioFake.rejection = new DOMException('Blocked', 'NotAllowedError'); audio.unlock(); await new Promise(resolve => setTimeout(resolve, 0));
    expect(audio.failures.has('capsule')).toBe(true); expect(messages[0]).toContain('Enable sound');
    audio.stop(); AudioFake.rejection = undefined; audio.unlock(); await new Promise(resolve => setTimeout(resolve, 0)); expect(audio.failures.size).toBe(0);
  });
  it('does not report intentional pause cancellation as autoplay failure', async () => {
    vi.stubGlobal('Audio', AudioFake); AudioFake.rejection = new DOMException('Paused', 'AbortError');
    const audio = new GameAudio(); audio.unlock(); audio.stop(); await new Promise(resolve => setTimeout(resolve, 0)); expect(audio.failures.size).toBe(0);
  });
  it('retains pickups after entity removal and emits periodic creature calls as world events', () => {
    const w = world(['sssssssss', "sR'.....s", 's.......s', 's....^..s', 's......*s', 'sssssssss'], { '5,3': [0, 1, 0], '7,4': [2] }, () => 0);
    w.command(0); steps(w, 1); const events = w.drainEvents().map(e => e.type);
    expect(events).toContain('ammo'); expect(events).toContain('bird'); expect(events).toContain('worm'); expect(w.at(2, 1)).toBe(w.robot);
    steps(w, 1); expect(w.drainEvents().filter(e => e.type === 'ammo')).toHaveLength(0);
  });
});
