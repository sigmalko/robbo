// Original procedural sounds: no samples copied from the reference games.
// Regenerate with: node scripts/dev/generate-milestone-audio.cjs
const fs = require('node:fs');
const path = require('node:path');
const rate = 44100, tau = Math.PI * 2;
const clamp = n => Math.max(0, Math.min(1, n));
function noise(seed) {
  let state = seed;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2147483648 - 1; };
}
function note(t, start, frequency, duration, amplitude = 0.2) {
  const age = t - start;
  if (age < 0 || age > duration) return 0;
  const envelope = clamp(age / 0.006) * Math.pow(1 - age / duration, 1.7);
  const phase = tau * frequency * age;
  // Soft pulse timbre bridges the original chiptune sounds and the richer artwork.
  return amplitude * envelope * (Math.sin(phase) + 0.25 * Math.sin(phase * 3) + 0.1 * Math.sin(phase * 5));
}
function write(name, duration, sample) {
  const length = Math.ceil(rate * duration), values = new Float32Array(length);
  let peak = 0, energy = 0;
  for (let i = 0; i < length; i++) {
    const fade = Math.min(1, i / (rate * 0.002), (length - 1 - i) / (rate * 0.025));
    values[i] = sample(i / rate) * fade; peak = Math.max(peak, Math.abs(values[i]));
  }
  const gain = Math.min(1, 0.78 / peak), out = Buffer.alloc(44 + length * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(length * 2, 40);
  for (let i = 0; i < length; i++) { const v = values[i] * gain; energy += v * v; out.writeInt16LE(Math.round(v * 32767), 44 + i * 2); }
  fs.writeFileSync(path.resolve('website/sounds', name), out);
  console.log(`${name}: ${duration}s, peak ${(peak * gain).toFixed(3)}, RMS ${Math.sqrt(energy / length).toFixed(3)}`);
}
const unlockNoise = noise(7);
write('ship-ready.wav', 1.2, t => {
  const crack = unlockNoise() * 0.62 * Math.exp(-t * 65);
  const body = Math.sin(tau * (150 * t - 35 * t * t)) * 0.25 * Math.exp(-t * 18);
  return crack + body + note(t, 0.025, 523.25, 0.45) + note(t, 0.105, 659.25, 0.45)
    + note(t, 0.185, 783.99, 0.55) + note(t, 0.27, 1046.5, 0.88, 0.24);
});
const rocketNoise = noise(31); let rumble = 0;
write('ship-departure.wav', 3.6, t => {
  rumble = rumble * 0.84 + rocketNoise() * 0.16;
  const engine = clamp((t - 0.2) / 0.28) * (1 - clamp((t - 1.8) / 0.6));
  const curtain = clamp((t - 2.6) / 0.15) * (1 - clamp((t - 2.9) / 0.5));
  const rising = Math.sin(tau * (55 * t + 135 * t * t)) * 0.12;
  const latch = note(t, 0, 180, 0.11, 0.26) + note(t, 0.12, 260, 0.09, 0.18);
  return latch + engine * (rumble * 0.85 + rising) + rumble * curtain * 0.35
    + note(t, 0.65, 261.63, 0.55, 0.14) + note(t, 0.85, 392, 0.55, 0.14)
    + note(t, 1.05, 523.25, 0.7, 0.14) + note(t, 1.3, 783.99, 0.65, 0.1);
});
const arrivalNoise = noise(59); let air = 0;
write('planet-arrival.wav', 1.6, t => {
  air = air * 0.9 + arrivalNoise() * 0.1;
  const reveal = clamp((t - 0.1) / 0.3) * (1 - clamp((t - 0.9) / 0.5));
  return air * reveal * 0.3 + note(t, 0.12, 392, 0.6, 0.1)
    + note(t, 0.55, 523.25, 0.65, 0.12) + note(t, 1.05, 783.99, 0.55, 0.15);
});
