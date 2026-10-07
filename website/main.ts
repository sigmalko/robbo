import { replayControls } from './replay-controls';
import type { ReplayAction } from '../src/main/game/Replay';
import { PreferenceStore } from '../src/main/game/Preferences';
import { CampaignStore } from '../src/main/game/Progress';
import { attachTouch } from '../src/main/game/Touch';
import { ActionInput, attachInput } from '../src/main/game/Input';
import { javaTheme, loadTheme, neonTheme, themeBackground, themes, validateTheme } from '../src/main/game/Theme';
import { createModernAtlas, validateModernAtlas } from './modern-art';
import { createJourneyAtlas } from './journey-art';
import { drawJourneyFloor, drawJourneyWall } from './journey-terrain';
import { text, english } from '../src/main/game/Text';
import type { TextKey } from '../src/main/game/Text';
import { packs } from '../src/main/game/packs';
import { GameSession } from '../src/main/game/Session';
import { GameWorld } from '../src/main/game/World';
import { GameAudio } from '../src/main/game/Audio';
import { Camera, frameFor } from '../src/main/game/Art';
import { viewportSize } from '../src/main/game/Viewport';
import { seededRandom } from '../src/main/game/model';
import type { Direction, LevelData } from '../src/main/game/model';

const element = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const progress = new CampaignStore(packs);
let session = new GameSession(packs.find(p => p.id === progress.active)!);
session.selectPlanet(progress.get(session.pack.id).selected); session.started = false;
for (const node of document.querySelectorAll<HTMLElement>('[data-text]')) {
  const key = node.dataset.text as TextKey;
  if (key in english) node.textContent = text(key);
}
for (const node of document.querySelectorAll<HTMLElement>('[data-label]')) {
  const key = node.dataset.label as TextKey;
  if (key in english) node.setAttribute('aria-label', text(key));
}
const packSelector = element<HTMLSelectElement>('pack');
packSelector.replaceChildren(...packs.map(pack => {
  const option = document.createElement('option'); option.value = pack.id;
  option.textContent = pack.id === '02' ? text('ui.robbo.i.edited.legacy') : pack.id === '01' ? text('ui.robbo.i.original.legacy') : `Campaign ${pack.id}`;
  return option;
}));
const themeSelector = element<HTMLSelectElement>('theme');
themeSelector.replaceChildren(...themes.map(theme => {
  const option = document.createElement('option'); option.value = theme.id; option.textContent = theme.name; option.title = theme.about;
  return option;
}));
const objectHelp = element('object-help');
for (const topic of ['weapons', 'screws', 'doors', 'teleports', 'magnets', 'hazards']) {
  const section = document.createElement('details');
  const summary = document.createElement('summary'); summary.textContent = text(`help.${topic}.title` as TextKey);
  const body = document.createElement('p'); body.textContent = text(`help.${topic}.body` as TextKey);
  section.append(summary, body); objectHelp.append(section);
}
const canvas = element<HTMLCanvasElement>('board');
function canvasContext(): CanvasRenderingContext2D {
  // Software-backed drawing keeps theme swaps and large source-atlas uploads
  // deterministic across browsers, including offscreen screenshot rendering.
  const result = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!result) throw Error(text('canvas.unsupported'));
  return result;
}
const context = canvasContext();
let atlas: CanvasImageSource | undefined;
let displayAtlas: CanvasImageSource | undefined;
let displayAtlasScale = 1;
let artworkUnavailable = false;
let activeTheme = javaTheme;
let themeRequest = 0;
type ThemeAtlasLoader = (themeId: string) => Promise<CanvasImageSource>;
let testThemeAtlasLoader: ThemeAtlasLoader | undefined;
function savedTheme(): string | null { try { return localStorage.getItem('robbo.artwork'); } catch { return null; } }
async function activateTheme(id: string): Promise<void> {
  const next = themes.find(theme => theme.id === id) ?? javaTheme;
  const request = ++themeRequest;
  themeSelector.value = next.id;
  try {
    // Generated themes still use the exact validated 11×8 atlas contract.
    let candidate: CanvasImageSource;
    if (testThemeAtlasLoader) candidate = await testThemeAtlasLoader(next.id);
    else if (next.id.startsWith('planet-journey-')) {
      const generated = await createJourneyAtlas(Number(next.id.split('-').at(-1)) - 1);
      validateTheme(next, generated, { width: next.digits.width, height: next.digits.height }); candidate = generated;
    } else if (next.id === neonTheme.id) {
      const generated = createModernAtlas(); validateModernAtlas(generated);
      validateTheme(next, generated, { width: next.digits.width, height: next.digits.height }); candidate = generated;
    } else candidate = (await loadTheme(next)).atlas;
    if (request !== themeRequest) return;
    atlas = candidate;
    // Resample the 128px source artwork once to the 64px backing size used for
    // a 32 CSS-pixel cell. Per-frame high-quality atlas downscaling stalls input.
    displayAtlasScale = next.id.startsWith('planet-journey-') ? .5 : 1;
    if (displayAtlasScale === .5) {
      const display = document.createElement('canvas');
      display.width = next.atlas.width / 2; display.height = next.atlas.height / 2;
      const painter = display.getContext('2d', { willReadFrequently: true })!;
      painter.imageSmoothingEnabled = true; painter.imageSmoothingQuality = 'high';
      painter.drawImage(candidate, 0, 0, display.width, display.height);
      displayAtlas = display;
    } else displayAtlas = candidate;
    activeTheme = next; artworkUnavailable = false;
    canvas.setAttribute('aria-label', text('label.game.board.use.arrow.keys.to.move.and.control'));
    document.documentElement.dataset.theme = next.id;
    document.documentElement.dataset.artwork = next.id === javaTheme.id ? 'classic' : 'modern';
    document.documentElement.style.setProperty('--planet-colour', next.palette.background ?? '#111710');
    updateInventoryArtwork();
    try { localStorage.setItem('robbo.artwork', next.id); } catch { /* Storage is optional. */ }
  } catch (error) {
    if (request !== themeRequest) return;
    themeSelector.value = activeTheme.id;
    artworkUnavailable = true; canvas.setAttribute('aria-label', 'Game artwork unavailable'); console.error(error);
  }
  render();
}
const camera = new Camera();
const audio = new GameAudio(message => { element('audio-status').textContent = message; });
const preferences = new PreferenceStore();
audio.setMuted(preferences.current.muted); audio.setVolume(preferences.current.volume);
element<HTMLInputElement>('mute').checked = preferences.current.muted;
element<HTMLInputElement>('volume').value = String(preferences.current.volume * 100);
const resetPreferences = document.createElement('button'); resetPreferences.textContent = text('preferences.reset');
resetPreferences.addEventListener('click', () => { const value = preferences.reset(); audio.setMuted(value.muted); audio.setVolume(value.volume); element<HTMLInputElement>('mute').checked = value.muted; element<HTMLInputElement>('volume').value = String(value.volume * 100); });
element('enable-sound').parentElement!.append(resetPreferences);
const input = new ActionInput();
let touchControls: ReturnType<typeof attachTouch> | undefined;
let generation = -1;
let previousStatus = 'playing';
let manualTicks = false;

function refreshPlanets(): void {
  const selector = element<HTMLSelectElement>('planet');
  if (selector.options.length === session.pack.levels.length) return;
  selector.replaceChildren();
  for (let i = 1; i <= session.pack.levels.length; i++) {
    const option = document.createElement('option'); option.value = String(i); option.textContent = String(i).padStart(2, '0'); selector.append(option);
  }
}
refreshPlanets();
function clearInput(): void { input.release(); touchControls?.reset(); session.world.clearInput(); }
function activateAudio(): void { element('audio-status').textContent = ''; audio.unlock(session.world.drainEvents()); }
function focusWorld(): void {
  clearInput(); audio.stop(); camera.reset();
  camera.focus(session.world);
  refreshPlanets();
  element<HTMLSelectElement>('planet').value = String(session.planet);
  element<HTMLSelectElement>('pack').value = session.pack.id;
  if (location.hash !== '#test' && !replay.viewing) progress.select(session.pack.id, session.planet);
}
function digits(id: string, value: number): void {
  const node = element(id);
  if (node.dataset.value === String(value)) return;
  node.dataset.value = String(value); node.setAttribute('aria-label', String(value)); node.replaceChildren();
  for (const digit of String(value).padStart(2, '0')) {
    const span = document.createElement('span'); span.className = 'digit'; span.textContent = digit; span.style.setProperty('--digit', digit); span.setAttribute('aria-hidden', 'true'); node.append(span);
  }
}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function updateInventoryArtwork(): void {
  const journey = activeTheme.id.startsWith('planet-journey-');
  const cells = [[4, 0], [7, 0], [5, 0], [6, 1]];
  document.querySelectorAll<HTMLElement>('.hud .icon').forEach((icon, index) => {
    icon.replaceChildren(); icon.style.removeProperty('background');
    if (!journey || !atlas) return;
    const preview = document.createElement('canvas'); preview.width = preview.height = 128;
    preview.setAttribute('aria-hidden', 'true');
    const p = preview.getContext('2d')!, a = activeTheme.atlas, [x, y] = cells[index];
    p.imageSmoothingEnabled = true; p.imageSmoothingQuality = 'high';
    p.drawImage(atlas, x * a.stride + a.inset, y * a.stride + a.inset, a.cell, a.cell, 0, 0, 128, 128);
    icon.style.background = 'none'; icon.append(preview);
  });
}
function resizeCanvas() {
  const bounds = canvas.parentElement!.getBoundingClientRect();
  const view = viewportSize(bounds.width, bounds.height, Math.max(activeTheme.id.startsWith('planet-journey-') ? 2 : 1, devicePixelRatio));
  if (canvas.width !== view.backingWidth) canvas.width = view.backingWidth;
  if (canvas.height !== view.backingHeight) canvas.height = view.backingHeight;
  camera.resize(view.columns, view.rows, session.world);
  context.setTransform(canvas.width / view.width, 0, 0, canvas.height / view.height, 0, 0);
  canvas.dataset.viewport = `${view.columns},${view.rows}`;
  return view;
}
let terrainKey = '';
let terrainWorld: GameWorld | undefined;
let terrainCanvas: HTMLCanvasElement | undefined;
function journeyTerrain(world: GameWorld, view: ReturnType<typeof viewportSize>, index: number): HTMLCanvasElement {
  const walls = [...world.entities.values()].filter(e => e.kind === 'wall');
  const width = Math.min(view.width, world.level.width * 32), height = Math.min(view.height, world.level.height * 32);
  const key = `${index}:${width},${height}:${camera.x},${camera.y}:` + walls.map(e => `${e.x},${e.y},${e.symbol}`).join(';');
  if (terrainCanvas && terrainWorld === world && terrainKey === key) return terrainCanvas;
  const layer = document.createElement('canvas');
  layer.width = Math.round(width * 2); layer.height = Math.round(height * 2);
  const painter = layer.getContext('2d', { alpha: false, willReadFrequently: true })!;
  painter.scale(2, 2); painter.imageSmoothingEnabled = true; painter.imageSmoothingQuality = 'high';
  drawJourneyFloor(painter, index, camera.x, camera.y, width, height);
  for (const e of walls) {
    const x = (e.x - camera.x) * 32, y = (e.y - camera.y) * 32;
    if (x + 32 <= 0 || y + 32 <= 0 || x >= width || y >= height) continue;
    drawJourneyWall(painter, world, e.x, e.y, x, y, index);
  }
  terrainWorld = world; terrainKey = key; terrainCanvas = layer;
  return layer;
}
function render(): void {
  const view = resizeCanvas();
  const world = session.world;
  document.title = `Robbo — ${session.pack.levels.length} planets`;
  element('campaign-total').textContent = `of ${session.pack.levels.length}`;
  element('campaign-intro').textContent = `A journey through ${session.pack.levels.length} planets`;
  if (generation !== session.generation) { generation = session.generation; focusWorld(); }
  const journey = activeTheme.id.startsWith('planet-journey-');
  context.imageSmoothingEnabled = journey;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = themeBackground(activeTheme, session.pack.id, session.planet, world.level.colour); context.fillRect(0, 0, view.width, view.height);
  const offsetX = Math.max(0, (view.width - world.level.width * view.tileSize) / 2);
  const offsetY = Math.max(0, (view.height - world.level.height * view.tileSize) / 2);
  const journeyIndex = Number(activeTheme.id.split('-').at(-1)) - 1;
  // Static terrain only changes with the camera, layout, theme or wall geometry.
  if (journey) {
    const terrain = journeyTerrain(world, view, journeyIndex);
    context.drawImage(terrain, offsetX, offsetY, terrain.width / 2, terrain.height / 2);
  }
  if (atlas) for (const e of world.entities.values()) {
    const x = offsetX + (e.x - camera.x) * view.tileSize, y = offsetY + (e.y - camera.y) * view.tileSize;
    if (x + view.tileSize <= 0 || y + view.tileSize <= 0 || x >= view.width || y >= view.height) continue;
    if (journey && e.kind === 'wall') {
      continue;
    }
    if (journey && !['river', 'beam', 'shot', 'flame', 'smoke', 'impact', 'blast'].includes(e.kind)) {
      context.save(); context.fillStyle = '#080d1255'; context.beginPath();
      context.ellipse(x + view.tileSize / 2, y + view.tileSize * 28 / 32, (e.kind === 'robot' ? 8 : 10) * view.tileSize / 32, view.tileSize / 16, 0, 0, Math.PI * 2); context.fill(); context.restore();
    }
    const [sx, sy] = frameFor(e, world), a = activeTheme.atlas;
    context.drawImage(displayAtlas!, (sx * a.stride + a.inset) * displayAtlasScale, (sy * a.stride + a.inset) * displayAtlasScale, a.cell * displayAtlasScale, a.cell * displayAtlasScale, x, y, view.tileSize, view.tileSize);
  }
  canvas.dataset.camera = `${camera.x},${camera.y}`;
  canvas.dataset.tick = String(world.tick);
  canvas.dataset.state = session.completed ? 'completed' : world.status;
  canvas.dataset.robot = `${world.robot.x},${world.robot.y}`;
  digits('remaining', world.remaining); digits('keys', world.keys); digits('ammo', world.ammo); digits('planet-number', session.planet);
  element('exit-status').textContent = session.started && world.remaining === 0 ? text('exit.ready') : '';
  element('collected').textContent = String(world.collected);
  element('level-info').textContent = artworkUnavailable ? text('artwork.unavailable') : text('planet.info', { planet: session.planet, total: session.pack.levels.length, author: world.level.author, notes: world.level.notes ? ' · ' + world.level.notes : '' });
  element<HTMLButtonElement>('pause').textContent = session.paused ? text('action.resume') : text('action.pause');
  element<HTMLButtonElement>('start').textContent = session.started ? text('action.new') : text('action.start');
  element<HTMLButtonElement>('pause').disabled = !session.started || session.completed;
  let title = '', description = '', action = '';
  if (!session.started) { title = text('state.ready'); description = text('state.readyHelp'); action = text('action.start'); }
  else if (session.completed) { title = text('state.complete'); description = text('state.completeHelp', { total: session.pack.levels.length }); action = text('action.again'); }
  else if (session.paused) { title = text('state.paused'); description = text('state.pausedHelp'); action = text('action.resume'); }
  else if (world.status === 'dead' && world.statusTicks >= 4) { title = text('state.dead'); description = text('state.deadHelp'); action = text('action.retry'); }
  else if (world.status === 'won') { title = text('state.won'); description = session.planet === session.pack.levels.length ? text('state.final') : text('state.next'); }
  element('overlay').hidden = !title;
  element('state-title').textContent = title; element('state-description').textContent = description;
  element<HTMLButtonElement>('continue').hidden = !action; element('continue').textContent = action;
}
const replay = replayControls(packs, () => session, value => { session = value; generation = -1; clearInput(); audio.stop(); render(); });
function replayAction(action: ReplayAction): void {
  if (replay.recorder) { try { replay.recorder.action(action); } catch (error) { replay.cancel(); element('audio-status').textContent = error instanceof Error ? error.message : 'Recording stopped'; replayAction(action); } }
  else if (action.type === 'command') session.command(action.direction, action.fire);
  else if (action.type === 'pause') session.togglePause();
  else if (action.type === 'restart') session.restart();
  else if (action.type === 'retry') session.retry();
  else session.start();
}
function retryWithPresentation(): void {
  if (replay.viewing) replay.cancel();
  replayAction({ type: 'retry' }); clearInput();
  if (session.world.status === 'dead') camera.returnToStart(session.world, reducedMotion.matches);
}
function advance(): void {
  if (replay.viewing) return;
  pollInput();
  const command = input.command();
  if (command && !session.paused && session.world.status === 'playing') replayAction({ type: 'command', direction: command.direction, fire: command.fire });
  const oldPlanet = session.planet, oldCompleted = session.completed;
  if (replay.recorder) { try { replay.recorder.step(); } catch (error) { replay.cancel(); element('audio-status').textContent = error instanceof Error ? error.message : 'Recording stopped'; } } else session.step();
  if (location.hash !== '#test' && (oldPlanet !== session.planet || oldCompleted !== session.completed)) progress.advance(session.pack.id, session.planet, session.completed);
  if (generation !== session.generation) { generation = session.generation; focusWorld(); }
  if (session.world.status !== previousStatus || session.world.teleportTicks) clearInput();
  if (session.world.status !== previousStatus) {
    audio.stop();
    if (session.world.status === 'dead') camera.returnToStart(session.world, reducedMotion.matches);
  }
  previousStatus = session.world.status;
  if (session.world.teleportTicks === 4) camera.focus(session.world);
  camera.update(session.world, reducedMotion.matches); audio.consume(session.world.drainEvents());
  render();
}
function startOrContinue(): void {
  if (!session.started) session.start();
  else if (session.completed) { replay.cancel(); session.newCampaign(); }
  else if (session.paused) replayAction({ type: 'pause' });
  else if (session.world.status === 'dead') { /* The automatic restart is already pending. */ }
  render(); activateAudio();
  canvas.focus({ preventScroll: true });
}
const resetProgress = document.createElement('button'); resetProgress.textContent = text('progress.reset');
resetProgress.addEventListener('click', () => { replay.cancel(); progress.reset(); session.newCampaign(packs[0]); render(); });
document.querySelector('.campaign-settings')!.append(resetProgress);
element('continue').addEventListener('click', startOrContinue);
element('start').addEventListener('click', () => { if (session.started) { replay.cancel(); session.newCampaign(); } else session.start(); render(); activateAudio(); canvas.focus({ preventScroll: true }); });
element('restart').addEventListener('click', () => { retryWithPresentation(); render(); activateAudio(); canvas.focus({ preventScroll: true }); });
element('pause').addEventListener('click', () => { replayAction({ type: 'pause' }); clearInput(); audio.stop(); render(); canvas.focus({ preventScroll: true }); });
element<HTMLSelectElement>('pack').addEventListener('change', event => { replay.cancel(); session.newCampaign(packs.find(p => p.id === (event.target as HTMLSelectElement).value)); render(); });
element<HTMLSelectElement>('planet').addEventListener('change', event => { replay.cancel(); session.selectPlanet(Number((event.target as HTMLSelectElement).value)); render(); });
themeSelector.addEventListener('change', event => { void activateTheme((event.target as HTMLSelectElement).value); });
element('enable-sound').addEventListener('click', activateAudio);
element<HTMLInputElement>('mute').addEventListener('change', event => { const muted = (event.target as HTMLInputElement).checked; audio.setMuted(muted); preferences.apply({ muted }); });
element<HTMLInputElement>('volume').addEventListener('input', event => { const volume = Number((event.target as HTMLInputElement).value) / 100; audio.setVolume(volume); preferences.apply({ volume }); });
const inputOptions = {
  command: (direction: Direction, fire: boolean) => replayAction({ type: 'command', direction, fire }),
  active: () => !replay.viewing && !session.paused && session.world.status === 'playing',
  start: () => { if (!session.started) { session.start(); activateAudio(); } },
  pause: () => { replayAction({ type: 'pause' }); clearInput(); audio.stop(); render(); },
  retry: () => { retryWithPresentation(); render(); activateAudio(); }
};
const pollInput = attachInput(input, inputOptions);
touchControls = attachTouch(input, inputOptions);
addEventListener('blur', () => { clearInput(); if (session.started && !session.paused && !session.completed) replayAction({ type: 'pause' }); audio.stop(); render(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); if (session.started && !session.paused && !session.completed) replayAction({ type: 'pause' }); audio.stop(); render(); } });
let resizeFrame = 0;
function scheduleResize(): void {
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    // visualViewport also covers browser chrome and keyboards on Android.
    document.documentElement.style.setProperty('--screen-height', `${window.visualViewport?.height ?? innerHeight}px`);
    render();
  });
}
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(scheduleResize).observe(canvas.parentElement!);
addEventListener('resize', scheduleResize);
addEventListener('orientationchange', () => { clearInput(); scheduleResize(); });
window.visualViewport?.addEventListener('resize', scheduleResize);
document.addEventListener('fullscreenchange', () => { clearInput(); scheduleResize(); });
element('settings').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    element('game-settings').scrollIntoView();
  } catch { element('display-status').textContent = text('fullscreen.failed'); }
});
element('back-to-game').addEventListener('click', () => {
  element('play-area').scrollIntoView();
  canvas.focus({ preventScroll: true });
});
canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll: true }));
element('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else element('display-status').textContent = text('fullscreen.unavailable');
  } catch { element('display-status').textContent = text('fullscreen.failed'); }
  scheduleResize();
  canvas.focus({ preventScroll: true });
});
scheduleResize();
render();
void activateTheme(savedTheme() ?? javaTheme.id);
// Real-time rendering never catches up with an unbounded backlog after a suspended tab.
setInterval(() => { if (!manualTicks) advance(); }, 100);

// Opt-in deterministic harness for the packaged browser tests; absent in normal play.
if (location.hash === '#test') {
  type PendingThemeLoad = { id: string; resolve: (atlas: CanvasImageSource) => void; reject: (error: Error) => void };
  const pendingThemeLoads: PendingThemeLoad[] = [];
  const testAtlas = (id: string): HTMLCanvasElement => {
    const theme = themes.find(candidate => candidate.id === id);
    if (!theme) throw Error(`Unknown test theme: ${id}`);
    const result = document.createElement('canvas'); result.width = theme.atlas.width; result.height = theme.atlas.height;
    return result;
  };
  (window as unknown as { robboTest: unknown }).robboTest = {
    load(rows: string[], options: Record<string, number[]> = {}, seed = 1, realtime = false) {
      const data: LevelData = { ...packs[0].levels[0], rows, options, width: rows[0].length, height: rows.length, author: 'Deterministic browser test fixture', notes: 'Not an imported planet' };
      session.world = new GameWorld(data, seededRandom(seed)); session.started = true; session.paused = false; session.completed = false;
      session.generation++; manualTicks = !realtime; render();
    },
    step(count = 1) { for (let i = 0; i < count; i++) advance(); },
    command(direction: Direction, fire = false) { session.command(direction, fire); },
    inventory(ammo: number, keys = 0) { session.world.ammo = ammo; session.world.keys = keys; render(); },
    planet(number: number, packId = '02') { replay.cancel(); session.newCampaign(packs.find(p => p.id === packId)); session.selectPlanet(number); manualTicks = true; render(); },
    snapshot() { const w = session.world; return { planet: session.planet, completed: session.completed, status: w.status, robot: [w.robot.x, w.robot.y], ammo: w.ammo, remaining: w.remaining, entities: [...w.entities.values()].map(e => ({ ...e })), events: [...audio.played], failures: [...audio.failures] }; },
    artworkFrames() {
      if (!(atlas instanceof HTMLCanvasElement)) return [];
      const a = activeTheme.atlas, painter = atlas.getContext('2d')!;
      return activeTheme.frames.map(([x, y]) => {
        const data = painter.getImageData(x * a.stride + a.inset, y * a.stride + a.inset, a.cell, a.cell).data;
        let visible = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 32) visible++;
        return { x, y, visible };
      });
    },
    artwork: {
      activate(id: string) { void activateTheme(id); },
      useControlledLoader() {
        testThemeAtlasLoader = id => new Promise((resolve, reject) => pendingThemeLoads.push({ id, resolve, reject }));
      },
      pending() { return pendingThemeLoads.map(load => load.id); },
      resolve(id: string) {
        const index = pendingThemeLoads.findIndex(load => load.id === id);
        if (index < 0) throw Error(`No pending test theme: ${id}`);
        pendingThemeLoads.splice(index, 1)[0].resolve(testAtlas(id));
      },
      reject(id: string) {
        const index = pendingThemeLoads.findIndex(load => load.id === id);
        if (index < 0) throw Error(`No pending test theme: ${id}`);
        pendingThemeLoads.splice(index, 1)[0].reject(Error(`Controlled test failure: ${id}`));
      },
      state() {
        return {
          active: activeTheme.id,
          theme: document.documentElement.dataset.theme,
          artwork: document.documentElement.dataset.artwork,
          selected: themeSelector.value,
          stored: savedTheme(),
          hudCanvases: document.querySelectorAll('.hud .icon canvas').length,
          hudArtwork: [...document.querySelectorAll<HTMLCanvasElement>('.hud .icon canvas')].map(icon => icon.toDataURL()),
          canvasLabel: canvas.getAttribute('aria-label')
        };
      }
    },
    assert() { session.world.assertConsistent(); }
  };
}
