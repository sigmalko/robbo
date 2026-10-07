import type { GameWorld } from '../../engine/game-world';

/** Shared materials for the ten expeditions; detail is subordinate to the hero. */
export const materials = [
  { stone: '#886346', light: '#c19965', soil: '#342a23', accent: '#f0bc70' },
  { stone: '#746153', light: '#af9677', soil: '#292622', accent: '#e5b66a' },
  { stone: '#638da0', light: '#b5d5da', soil: '#223943', accent: '#a6e9ee' },
  { stone: '#435b3f', light: '#82916a', soil: '#202c25', accent: '#d6c380' },
  { stone: '#985f49', light: '#ce9975', soil: '#3a2825', accent: '#ecc69b' },
  { stone: '#416d70', light: '#7badaa', soil: '#183439', accent: '#e4ca83' },
  { stone: '#52464a', light: '#887372', soil: '#292125', accent: '#eca16d' },
  { stone: '#6b6578', light: '#afa4b6', soil: '#2b2936', accent: '#dfcc99' },
  { stone: '#4c6467', light: '#899a9b', soil: '#202c30', accent: '#d5bd84' },
  { stone: '#645265', light: '#aa879d', soil: '#302836', accent: '#e1bbad' }
];
const surfaces = new Map<number, CanvasPattern>();
const wallTiles = new Map<string, HTMLCanvasElement>();
let wallTheme = -1;

export function prepareJourneySurface(image: HTMLImageElement, index: number): void {
  if (surfaces.has(index)) return;
  const tile = document.createElement('canvas'); tile.width = tile.height = 384;
  const ctx = tile.getContext('2d', { willReadFrequently: true })!;
  const width = image.naturalWidth / 5, height = image.naturalHeight / 2;
  ctx.drawImage(image, index % 5 * width + 2, Math.floor(index / 5) * height + 2, width - 4, height - 4, 0, 0, 384, 384);
  surfaces.set(index, ctx.createPattern(tile, 'repeat')!);
}

export function wallMask(world: GameWorld, x: number, y: number): number {
  return (world.at(x, y - 1)?.kind === 'wall' ? 1 : 0)
    | (world.at(x + 1, y)?.kind === 'wall' ? 2 : 0)
    | (world.at(x, y + 1)?.kind === 'wall' ? 4 : 0)
    | (world.at(x - 1, y)?.kind === 'wall' ? 8 : 0);
}

export function drawJourneyFloor(ctx: CanvasRenderingContext2D, index: number, cameraX: number, cameraY: number, width: number, height: number): void {
  const m = materials[index];
  ctx.fillStyle = m.soil; ctx.fillRect(0, 0, width, height);
  ctx.save(); ctx.fillStyle = m.light; ctx.globalAlpha = .075;
  // Deterministic world-space grain never advances the simulation RNG.
  for (let y = 0; y < Math.ceil(height / 32); y++) for (let x = 0; x < Math.ceil(width / 32); x++) {
    const seed = Math.abs((x + cameraX) * 73856093 ^ (y + cameraY) * 19349663);
    ctx.beginPath(); ctx.ellipse(x * 32 + seed % 27 + 2, y * 32 + (seed >>> 5) % 27 + 2, 1.6, .55, seed % 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Neighbour-aware silhouettes hide the grid without changing occupied cells. */
export function drawJourneyWall(ctx: CanvasRenderingContext2D, world: GameWorld, tx: number, ty: number, x: number, y: number, index: number): void {
  if (wallTheme !== index) { wallTiles.clear(); wallTheme = index; }
  // Texture repeats every three cells and decorations every four. Include the
  // neighbour mask so destroyed walls immediately expose the correct edges.
  const key = `${tx % 12},${ty % 12},${wallMask(world, tx, ty)}`;
  let tile = wallTiles.get(key);
  if (!tile) {
    tile = document.createElement('canvas'); tile.width = tile.height = 64;
    const painter = tile.getContext('2d', { willReadFrequently: true })!;
    painter.scale(2, 2);
    paintJourneyWall(painter, world, tx, ty, index);
    wallTiles.set(key, tile);
  }
  ctx.drawImage(tile, 0, 0, 64, 64, x, y, 32, 32);
}

function paintJourneyWall(ctx: CanvasRenderingContext2D, world: GameWorld, tx: number, ty: number, index: number): void {
  const mask = wallMask(world, tx, ty), m = materials[index];
  const n = !!(mask & 1), e = !!(mask & 2), s = !!(mask & 4), w = !!(mask & 8);
  const left = w ? 0 : 1.4, right = e ? 32 : 30.6, top = n ? 0 : 1.4, bottom = s ? 32 : 30.6;
  ctx.save();
  const path = new Path2D();
  path.roundRect(left, top, right - left, bottom - top, [!n && !w ? 7 : 0, !n && !e ? 7 : 0, !s && !e ? 7 : 0, !s && !w ? 7 : 0]);
  ctx.fillStyle = '#080c1080'; ctx.save(); ctx.translate(0, 1); ctx.fill(path); ctx.restore();
  ctx.fillStyle = m.stone; ctx.fill(path);
  ctx.save(); ctx.clip(path);
  const surface = surfaces.get(index);
  if (surface) {
    // World-aligned texture spans several cells, including camera boundaries.
    surface.setTransform(new DOMMatrix().translate(-tx * 32, -ty * 32).scale(.25));
    ctx.globalAlpha = .8; ctx.fillStyle = surface; ctx.fillRect(0, 0, 32, 32);
  }
  // A few broad material patches replace the repeating full-scene tile.
  const variant = Math.abs(tx * 17 + ty * 31) % 4;
  ctx.fillStyle = m.light; ctx.globalAlpha = .035;
  ctx.beginPath(); ctx.ellipse(8 + variant * 4, 10 + variant, 17, 8, -.35, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = .10; ctx.strokeStyle = '#13191d'; ctx.lineWidth = .65;
  ctx.beginPath(); ctx.moveTo(-2, 20 + variant); ctx.bezierCurveTo(10, 16 + variant, 18, 24, 34, 18 + variant); ctx.stroke();
  if (index === 8 && !surface) {
    ctx.strokeStyle = m.light; ctx.strokeRect(4, 6, 24, 21);
    ctx.fillStyle = m.light; ctx.fillRect(6, 8, 1, 1); ctx.fillRect(25, 24, 1, 1);
  }
  ctx.restore();
  ctx.strokeStyle = m.light; ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.globalAlpha = .7;
  ctx.beginPath();
  if (!n) { ctx.moveTo(w ? 0 : 7, 2.5); ctx.quadraticCurveTo(16, 1.5, e ? 32 : 25, 2.5); }
  if (!w) { ctx.moveTo(2.5, n ? 0 : 8); ctx.quadraticCurveTo(1.5, 16, 2.5, s ? 32 : 25); }
  ctx.stroke(); ctx.strokeStyle = '#101318'; ctx.globalAlpha = .55;
  ctx.beginPath();
  if (!s) { ctx.moveTo(w ? 0 : 7, 29.5); ctx.quadraticCurveTo(16, 30.5, e ? 32 : 25, 29.5); }
  if (!e) { ctx.moveTo(29.5, n ? 0 : 7); ctx.quadraticCurveTo(30.5, 16, 29.5, s ? 32 : 25); }
  ctx.stroke(); ctx.globalAlpha = 1;
  if ((index === 3 || index === 9 || index === 5) && (!n || !s) && variant === 0) {
    const py = !n ? 5 : 27;
    ctx.fillStyle = index === 9 ? '#bd8499' : index === 5 ? '#7ca99a' : '#90a777';
    ctx.beginPath(); ctx.ellipse(14, py, 4, 1.8, -.45, 0, Math.PI * 2); ctx.ellipse(20, py + 2, 3, 1.5, .7, 0, Math.PI * 2); ctx.fill();
    if (index === 9) { ctx.fillStyle = '#dec6b5'; ctx.fillRect(14, py + 1, 1, 4); }
  }
  ctx.restore();
}
