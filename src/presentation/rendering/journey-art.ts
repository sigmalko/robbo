/// <reference types="vite/client" />
import { materials, prepareJourneySurface } from './journey-terrain';
import firstSheet from '../../../website/artwork/planet-journeys-01-05.png?inline';
import secondSheet from '../../../website/artwork/planet-journeys-06-10.png?inline';
import objectSheet from '../../../website/artwork/expedition-objects.png?inline';
import materialSheet from '../../../website/artwork/planet-materials.png?inline';

// Data URLs keep pixel extraction origin-clean when the release runs from disk.
const sheets = [firstSheet, secondSheet];
const loads = new Map<string, Promise<HTMLImageElement>>();
const atlases = new Map<number, Promise<HTMLCanvasElement>>();
function load(path: string): Promise<HTMLImageElement> {
  let pending = loads.get(path);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(Error('Unable to load planet artwork')); image.src = path;
    });
    loads.set(path, pending); pending.catch(() => loads.delete(path));
  }
  return pending;
}

/** Extract source art, remove connected paper and discard thin table-line debris. */
function cutout(image: HTMLImageElement, x: number, y: number, width: number, height: number, paper: boolean): HTMLCanvasElement {
  const tile = document.createElement('canvas'); tile.width = width; tile.height = height;
  const ctx = tile.getContext('2d')!; ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height), data = pixels.data;
  const visited = new Uint8Array(width * height), queue: number[] = [];
  const add = (index: number): void => { if (index >= 0 && index < visited.length && !visited[index]) { visited[index] = 1; queue.push(index); } };
  if (paper) {
    for (let col = 0; col < width; col++) { add(col); add((height - 1) * width + col); }
    for (let row = 0; row < height; row++) { add(row * width); add(row * width + width - 1); }
    for (let head = 0; head < queue.length; head++) {
      const index = queue[head], offset = index * 4;
      const r = data[offset], g = data[offset + 1], b = data[offset + 2];
      if (r < 160 || g < 145 || b < 115 || Math.max(r, g, b) - Math.min(r, g, b) > 85) continue;
      data[offset + 3] = 0;
      if (index % width) add(index - 1); if (index % width < width - 1) add(index + 1);
      add(index - width); add(index + width);
    }
  }
  visited.fill(0);
  const components: { pixels: number[]; minX: number; minY: number; maxX: number; maxY: number }[] = [];
  for (let start = 0; start < visited.length; start++) {
    if (visited[start] || data[start * 4 + 3] < 32) continue;
    queue.length = 0; add(start);
    const component = { pixels: [] as number[], minX: width, minY: height, maxX: 0, maxY: 0 };
    for (let head = 0; head < queue.length; head++) {
      const index = queue[head]; if (data[index * 4 + 3] < 32) continue;
      const px = index % width, py = Math.floor(index / width);
      component.pixels.push(index); component.minX = Math.min(component.minX, px); component.maxX = Math.max(component.maxX, px);
      component.minY = Math.min(component.minY, py); component.maxY = Math.max(component.maxY, py);
      if (px) add(index - 1); if (px < width - 1) add(index + 1);
      add(index - width); add(index + width);
    }
    components.push(component);
  }
  const largest = Math.max(1, ...components.map(c => c.pixels.length));
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (const c of components) {
    const keep = c.pixels.length >= largest * .006 && c.maxY - c.minY >= 3 && c.maxX - c.minX >= 2
      && c.maxX - c.minX < (c.maxY - c.minY) * 6;
    if (!keep) { for (const pixel of c.pixels) data[pixel * 4 + 3] = 0; continue; }
    minX = Math.min(minX, c.minX); minY = Math.min(minY, c.minY); maxX = Math.max(maxX, c.maxX); maxY = Math.max(maxY, c.maxY);
  }
  if (minX > maxX || minY > maxY) throw Error('Artwork crop contains no visible object');
  ctx.putImageData(pixels, 0, 0);
  const result = document.createElement('canvas'); result.width = maxX - minX + 3; result.height = maxY - minY + 3;
  result.getContext('2d')!.drawImage(tile, minX, minY, maxX - minX + 1, maxY - minY + 1, 1, 1, maxX - minX + 1, maxY - minY + 1);
  return result;
}

export function createJourneyAtlas(index: number): Promise<HTMLCanvasElement> {
  if (!Number.isInteger(index) || index < 0 || index >= 10) return Promise.reject(Error('Invalid planet artwork'));
  let pending = atlases.get(index);
  if (!pending) { pending = buildAtlas(index); atlases.set(index, pending); pending.catch(() => atlases.delete(index)); }
  return pending;
}

async function buildAtlas(index: number): Promise<HTMLCanvasElement> {
  const [image, companions, surface] = await Promise.all([load(sheets[Math.floor(index / 5)]), load(objectSheet), load(materialSheet)]);
  prepareJourneySurface(surface, index);
  const atlas = document.createElement('canvas'); atlas.width = 1640; atlas.height = 1096;
  // Keep generated atlases in CPU memory so rapid theme changes do not depend
  // on deferred GPU source uploads. Each atlas is rendered once and cached.
  const ctx = atlas.getContext('2d', { willReadFrequently: true })!; ctx.scale(4, 4);
  const second = index >= 5, row = index % 5, top = (second ? 108 : 105) + row * (second ? 179 : 178);
  const columns = second ? [246, 468, 687, 898, 1120] : [242, 468, 690, 882, 1116];
  const widths = [180, 165, 170, 207, 180];
  const art = columns.map((left, col) => cutout(image, left, top + 5, widths[col], 151, true));
  const objects = Array.from({ length: 12 }, (_, i) => {
    const left = i % 4 * 384, row = Math.floor(i / 4), y = Math.round(row * companions.height / 3);
    return cutout(companions, left, y, 384, Math.round((row + 1) * companions.height / 3) - y, false);
  });
  const m = materials[index];
  function paint(x: number, y: number, draw: () => void): void {
    ctx.save(); ctx.translate(x * 34 + 2, y * 34 + 2);
    ctx.beginPath(); ctx.rect(0, 0, 32, 32); ctx.clip();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; draw(); ctx.restore();
  }
  function sprite(x: number, y: number, image: HTMLCanvasElement, angle = 0, flip = false, bounce = 0, extent = 29): void {
    paint(x, y, () => {
      ctx.translate(16, 16 + bounce); ctx.rotate(angle); if (flip) ctx.scale(-1, 1);
      const scale = Math.min(extent / image.width, extent / image.height);
      ctx.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
    });
  }
  function ellipse(x: number, y: number, rx: number, ry: number, colour: string): void {
    ctx.fillStyle = colour; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Character silhouettes fill the tile consistently; two poses express a small step.
  for (let x = 0; x < 8; x++) sprite(x, 5, art[0], 0, Math.floor(x / 2) === 2, x % 2 ? -.55 : .25, 30);
  sprite(4, 0, art[1], .20, false, 0, 26);
  for (const [x, y, dir] of [[0, 0, 0], [0, 6, 1], [1, 0, 2], [1, 6, 3]]) sprite(x, y, art[2], (dir - 1) * Math.PI / 2, false, 0, 27);
  sprite(8, 2, art[3], 0, false, 0, 29); sprite(9, 2, art[3], 0, true, -.5, 29);
  sprite(5, 1, art[4], 0, false, -.5, 30); sprite(6, 1, art[4], 0, false, .5, 30);
  paint(5, 1, () => { ellipse(16, 17, 3, 4, '#b5f3ce70'); });
  // Fully illustrated companions replace every placeholder symbol.
  for (const [x, y, object] of [[7, 0, 0], [5, 0, 1], [9, 0, 2], [6, 0, 3], [8, 1, 4], [8, 0, 5], [0, 1, 6], [0, 4, 7], [1, 4, 7]]) sprite(x, y, objects[object]);
  for (let frame = 0; frame < 2; frame++) {
    sprite(6 + frame, 2, objects[9], 0, false, frame ? -.7 : .2);
    sprite(3 + frame, 1, objects[10], frame ? -.10 : .10);
    sprite(1 + frame, 1, objects[11], 0, !!frame);
  }
  for (const [x, y, direction] of [[5, 4, 0], [6, 4, 1], [7, 4, 2], [8, 4, 3], [8, 7, 0], [9, 6, 1], [9, 7, 2], [8, 6, 3]]) sprite(x, y, objects[8], direction * Math.PI / 2);
  paint(1, 4, () => { ctx.strokeStyle = '#bde7db'; ctx.lineWidth = .75; ctx.beginPath(); ctx.ellipse(16, 16, 5, 9, -.15, 0, Math.PI * 2); ctx.stroke(); });
  // Both river frames are explicit: a continuous current, never an empty tile.
  for (let frame = 0; frame < 2; frame++) paint(9, 3 + frame, () => {
    const water = ctx.createLinearGradient(0, 0, 0, 32);
    water.addColorStop(0, '#729b98'); water.addColorStop(.2, '#386b70'); water.addColorStop(.7, '#24444e'); water.addColorStop(1, '#162d39');
    ctx.fillStyle = water; ctx.fillRect(0, 0, 32, 32);
    for (let wave = 0; wave < 4; wave++) {
      ctx.strokeStyle = wave % 2 ? '#87c4c2' : '#acd6cf'; ctx.globalAlpha = .55; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(-2, wave * 8 + 3); ctx.bezierCurveTo(8, wave * 8 - frame, 19, wave * 8 + 9 + frame, 34, wave * 8 + 3); ctx.stroke();
    }
  });
  paint(5, 6, () => {
    const fill = ctx.createRadialGradient(12, 10, 1, 16, 18, 16); fill.addColorStop(0, m.light); fill.addColorStop(1, m.stone);
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(2, 28); ctx.quadraticCurveTo(2, 20, 9, 13); ctx.quadraticCurveTo(14, 4, 20, 14); ctx.quadraticCurveTo(29, 18, 30, 28); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 11; i++) ellipse(6 + i * 7 % 22, 20 + i * 3 % 7, .65, .4, m.accent);
  });
  paint(4, 6, () => {
    ellipse(16, 23, 13, 6, '#343b3f'); ellipse(16, 20, 12, 6, '#7c8580');
    ctx.strokeStyle = m.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(24, 20); ctx.stroke();
  });
  for (let x = 0; x < 4; x++) paint(x, 3, () => {
    ctx.translate(16, 16); if (x >= 2) ctx.rotate(Math.PI / 2);
    const beam = ctx.createLinearGradient(-14, 0, 14, 0); beam.addColorStop(0, '#e6994900'); beam.addColorStop(.7, '#f5c56f'); beam.addColorStop(1, '#fff6d9');
    ctx.fillStyle = beam; ctx.beginPath(); ctx.roundRect(-14, -1.5 - x % 2, 28, 3 + (x % 2) * 2, 2); ctx.fill();
  });
  for (let phase = 0; phase < 3; phase++) paint(10, 3 + phase, () => {
    const flame = ctx.createRadialGradient(16, 20, 2, 16, 17, 15); flame.addColorStop(0, '#fff4b5'); flame.addColorStop(.35, '#f3b854'); flame.addColorStop(.7, '#d36136'); flame.addColorStop(1, '#d3613600');
    ctx.fillStyle = flame; ctx.beginPath(); ctx.moveTo(16, 1 + phase * 3); ctx.bezierCurveTo(30, 14, 33, 30, 16, 31); ctx.bezierCurveTo(0, 31, 1, 15, 10, 10); ctx.quadraticCurveTo(10, 24, 16, 1 + phase * 3); ctx.fill();
  });
  for (let phase = 0; phase < 4; phase++) paint(1 + phase, 2, () => {
    const r = 7 + phase * 2; const burst = ctx.createRadialGradient(16, 16, 1, 16, 16, r);
    burst.addColorStop(0, '#fff4d0'); burst.addColorStop(.35, '#f5c16d'); burst.addColorStop(.75, '#cc7041'); burst.addColorStop(1, '#a7523000');
    ellipse(16, 16, r, r, '#482d2420'); ctx.fillStyle = burst; ctx.fillRect(0, 0, 32, 32);
    for (let ray = 0; ray < 7; ray++) ellipse(16 + Math.cos(ray * 6.28 / 7) * r, 16 + Math.sin(ray * 6.28 / 7) * r, 1, 1, '#f7d89a');
  });
  for (let phase = 0; phase < 3; phase++) paint(2 + phase, 4, () => {
    for (let cloud = 0; cloud < 5; cloud++) { ctx.globalAlpha = .65 - phase * .15; ellipse(10 + cloud * 7 % 16, 12 + cloud * 5 % 13, 5 + phase, 5 + phase, '#b5c5be'); }
  });
  // Atlas terrain frames remain useful in galleries; gameplay draws connected terrain.
  for (const [x, y] of [[2, 0], [3, 0], [9, 1], [10, 1], [7, 1], [5, 2], [8, 5], [9, 5]]) paint(x, y, () => {
    const rock = ctx.createLinearGradient(3, 2, 30, 31); rock.addColorStop(0, m.light); rock.addColorStop(1, m.stone);
    ctx.fillStyle = rock; ctx.beginPath(); ctx.roundRect(1, 1, 30, 30, 7); ctx.fill();
  });
  return atlas;
}
