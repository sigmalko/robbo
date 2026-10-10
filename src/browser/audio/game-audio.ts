import type { GameEvent, SoundName } from '../../engine/model';
export const soundFiles: Record<SoundName, string> = {
  'exit-open': 'ship-ready.wav', walk: 'walk_01.ogg', shoot: 'shoot_default.ogg', gun: 'gun_default.ogg', ammo: 'ammo_02.ogg',
  screw: 'screw2.ogg', key: 'key2.ogg', door: 'door_02.ogg', box: 'box.ogg', bomb: 'bomb.ogg',
  kill: 'kill.ogg', teleport: 'teleport.ogg', end: 'ship-departure.wav', capsule: 'planet-arrival.wav',
  magnet: 'magnet.ogg', bird: 'found/bird_01.ogg', worm: 'found/ripping_head_of.ogg'
};
export class GameAudio {
  active = false;
  muted = false;
  volume = 0.6;
  readonly played: SoundName[] = [];
  readonly failures = new Set<string>();
  private voices = new Map<SoundName, HTMLAudioElement[]>();
  private emphasisUntil = 0;
  private pausedVoices: HTMLAudioElement[] = [];
  constructor(private report: (message: string) => void = () => {}) {
    for (const name of Object.keys(soundFiles) as SoundName[]) {
      const audio = new Audio(`sounds/${soundFiles[name]}`); audio.preload = 'auto';
      audio.addEventListener('error', () => { this.failures.add(name); this.report('Some sounds are unavailable. Gameplay remains active.'); });
      this.voices.set(name, [audio]);
    }
  }
  unlock(events: GameEvent[] = []): void {
    this.active = true;
    // Play from the user gesture, rather than relying on autoplay from the game timer.
    if (events.length) this.consume(events); else this.play('capsule');
  }
  consume(events: GameEvent[]): void {
    if (!this.active || this.muted) return;
    // Many overlapping blast cells still represent a bounded number of audible events.
    const distinct = new Set(events.map(e => e.type));
    // Give the achievement its own attack; a footstep or creature call must not mask it.
    const milestone = distinct.has('end') ? 'end' : events.some(event => event.type === 'exit-open' && event.tick > 0) ? 'exit-open' : undefined;
    if (milestone) { this.stop(); this.play(milestone); return; }
    for (const type of distinct) this.play(type);
  }
  play(name: SoundName): void {
    if (!this.active || this.muted) return;
    const pool = this.voices.get(name);
    if (!pool) return;
    let audio = pool.find(a => a.paused || a.ended);
    if (!audio && pool.length < 4) { audio = pool[0].cloneNode(true) as HTMLAudioElement; pool.push(audio); }
    if (!audio) return;
    const milestone = name === 'exit-open' || name === 'end';
    if (milestone) this.emphasisUntil = performance.now() + (name === 'end' ? 3600 : 1200);
    audio.volume = this.volume * (!milestone && performance.now() < this.emphasisUntil ? 0.3 : 1); audio.currentTime = 0;
    this.played.push(name); if (this.played.length > 256) this.played.shift();
    try {
      const result = audio.play();
      result?.then(() => this.failures.delete(name)).catch((error: DOMException) => {
        // Pause/restart deliberately cancels pending media playback. It is not an audio failure.
        if (error.name === 'AbortError') return;
        this.failures.add(name); this.report('Click Enable sound to allow audio playback.');
      });
    } catch { this.failures.add(name); this.report('Click Enable sound to allow audio playback.'); }
  }
  pause(): void {
    this.pausedVoices = [...this.voices.values()].flat().filter(audio => !audio.paused && !audio.ended);
    for (const audio of this.pausedVoices) audio.pause();
  }
  resume(): void {
    const voices = this.pausedVoices.splice(0);
    if (!this.active || this.muted) return;
    for (const audio of voices) {
      try { audio.play()?.catch(() => this.report('Click Enable sound to allow audio playback.')); }
      catch { this.report('Click Enable sound to allow audio playback.'); }
    }
  }
  stop(): void {
    this.pausedVoices = []; this.emphasisUntil = 0;
    for (const pool of this.voices.values()) for (const audio of pool) { audio.pause(); audio.currentTime = 0; }
  }
  setMuted(value: boolean): void { this.muted = value; if (value) this.stop(); }
  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value));
    for (const pool of this.voices.values()) for (const audio of pool) audio.volume = this.volume;
  }
}
