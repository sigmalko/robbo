import type { GameEvent, SoundName } from './model';
export const soundFiles: Record<SoundName, string> = {
  'exit-open': 'screw.ogg', walk: 'walk_01.ogg', shoot: 'shoot_default.ogg', gun: 'gun_default.ogg', ammo: 'ammo_02.ogg',
  screw: 'screw2.ogg', key: 'key2.ogg', door: 'door_02.ogg', box: 'box.ogg', bomb: 'bomb.ogg',
  kill: 'kill.ogg', teleport: 'teleport.ogg', end: 'end_default.ogg', capsule: 'capsule.ogg',
  magnet: 'magnet.ogg', bird: 'found/bird_01.ogg', worm: 'found/ripping_head_of.ogg'
};
export class GameAudio {
  active = false;
  muted = false;
  volume = 0.6;
  readonly played: SoundName[] = [];
  readonly failures = new Set<string>();
  private voices = new Map<SoundName, HTMLAudioElement[]>();
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
    for (const type of distinct) this.play(type);
  }
  play(name: SoundName): void {
    if (!this.active || this.muted) return;
    const pool = this.voices.get(name);
    if (!pool) return;
    let audio = pool.find(a => a.paused || a.ended);
    if (!audio && pool.length < 4) { audio = pool[0].cloneNode(true) as HTMLAudioElement; pool.push(audio); }
    if (!audio) return;
    audio.volume = this.volume; audio.currentTime = 0;
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
  stop(): void { for (const pool of this.voices.values()) for (const audio of pool) { audio.pause(); audio.currentTime = 0; } }
  setMuted(value: boolean): void { this.muted = value; if (value) this.stop(); }
  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value));
    for (const pool of this.voices.values()) for (const audio of pool) audio.volume = this.volume;
  }
}
