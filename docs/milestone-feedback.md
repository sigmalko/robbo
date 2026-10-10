# Last screw and departure feedback

The two milestones have different meanings: the final required screw powers the ship;
entering the ship completes the planet. Feedback is attached to the existing
`exit-open` and `end` events, not inferred from counters on every render.

## Reference research

Inspected on 2026-10-10:

- [GNU Robbo C, board.c](https://github.com/bomblik/GNU_Robbo_PSVITA_PSP/blob/94a915adfcd1cfbee5287492ff4f6a553afe43aa/board.c#L1977):
  `open_exit` enables the exit and starts `DELAY_BLINKSCREEN`. The final screw
  plays `SFX_EXIT_OPEN`; entering an enabled capsule plays `SFX_CAPSULE` and
  advances the level. `screen.c` renders the blinking background white.
- [OlekMazur HTML5, GameScreen.ts](https://github.com/OlekMazur/robbo/blob/c33d0cc23f2efdb07c0a6dee7226413254af23c7/src/GameScreen.ts#L608):
  ship activation plays `LAUNCH`, changes the background colour for three
  VBlanks and enables alternating ship frames. Entering the ship plays `LEAVE`;
  `LEAVE_CAVE` replaces the cave with space column by column, followed by the
  next cave's entrance sequence.

These reimplementations corroborate the flash and distinct sound remembered by
the user. They do not establish a frame-perfect or audio-identical account of
the original Atari release. The new visible lift-off is an interpretation of
the requested departure, not a claim that this exact animation existed in it.

## Implementation

- Final pickup: one 260 ms warm flash, expanding ring and sparks, 1.4 s notice,
  highlighted screw HUD and the powered ship's existing blinking animation. Movement
  continues. Initial zero-screw maps do not produce a false pickup celebration.
- Departure: 220 ms boarding, ignition from 200 ms, lift-off from 650 ms,
  full clearance of the ship and exhaust by 2400 ms. A space curtain closes
  right-to-left from 2600 to 3400 ms; the world changes at 3600 ms, fully covered.
  The success notice is hidden during flight so it cannot obscure the ship.
  Arrival reveals the new planet left-to-right, with a short settling interval,
  over 1600 ms. Simulation and input stay stopped throughout arrival. This also
  applies to Start, retry, a new campaign and planet selection. The existing
  ship artwork is used for every theme; active ships have no extra outline.
- Sound: original generated PCM WAVs, a short noise transient and rising major
  arpeggio for activation; latch, filtered engine noise and ascending tones for
  flight, a closing sweep and a rising three-note entrance. Cue onsets share event dispatch
  with the visuals. Native HTML audio decoding/output can introduce device latency.
- Milestone attacks suppress concurrent footsteps/creature calls. Subsequent
  ordinary sounds are ducked during the achievement cue. Mute and volume still
  apply. Pausing preserves both animation time and audio position; restart and
  planet changes cancel them.
- Reduced-motion mode removes the flash, expanding particles and moving flight;
  text, the ship's existing animation, sound and gentle fades remain.
- Presentation time holds browser stepping before the original five win ticks;
  arrival likewise holds simulation ticks until the curtain is open. Engine
  rules, session timing and deterministic replay format are unchanged.

Regenerate audio with `node scripts/dev/generate-milestone-audio.cjs`. It prints
duration, peak and RMS. The cues have headroom and short boundary fades; no
external audio samples or reference-game code/assets were copied.

## Validation

`npm test`, `npm run package`, then `node tests/browser/milestones.check.cjs`.
Set `ROBBO_CAPTURE_DIR` to an output directory to save flash, ring and flight frames.
The browser test covers three artwork styles, native playback promises, volume,
mute, pause/resume, reduced motion, cancellation, real-time flight, exactly one
planet advance, the final campaign planet, first entry, and the real planet-2
wall layout/exit position with Robbo placed beside the ship as a regression fixture.

For visual inspection in the in-app browser open
`http://127.0.0.1:8080/?feedback-preview=1#test`. The preview buttons use real
pickups and ship entry in a deterministic fixture; they do not save campaign
progress. Advance frame-by-frame with “Advance 100 ms”, or replay the selected
effect with sound using “Play animation”. These controls are absent in normal play.

Technical playback verification and waveform measurements do not substitute for
a human listening test on the user's speakers.
