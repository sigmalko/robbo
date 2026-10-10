import type { GameWorld } from '../../engine/game-world';
import type { ThemeManifest } from '../themes/theme';
import { themeBackground } from '../themes/theme';
import { text } from '../i18n/messages';
import { Camera } from './camera';
import { frameFor } from './sprite-frames';
import { viewportSize } from './viewport';
import { drawJourneyFloor, drawJourneyWall } from './journey-terrain';
import type { MilestoneFrame } from './milestone-effects';
import { drawMilestone } from './milestone-renderer';

export interface BoardArtwork {
  activeTheme: ThemeManifest;
  atlas?: CanvasImageSource;
  displayAtlas?: CanvasImageSource;
  displayAtlasScale: number;
}

/** Rendering only reads the world; terrain cache belongs to this canvas. */
export function createBoardRenderer(canvas: HTMLCanvasElement, camera: Camera, artwork: () => BoardArtwork) {
  function canvasContext(): CanvasRenderingContext2D {
    // Software-backed drawing keeps theme swaps and large source-atlas uploads
    // deterministic across browsers, including offscreen screenshot rendering.
    const result = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    if (!result) throw Error(text('canvas.unsupported'));
    return result;
  }
  const context = canvasContext();
  function resizeCanvas(world: GameWorld) {
    const { activeTheme } = artwork();
    const bounds = canvas.parentElement!.getBoundingClientRect();
    const view = viewportSize(bounds.width, bounds.height, Math.max(activeTheme.id.startsWith('planet-journey-') ? 2 : 1, devicePixelRatio));
    if (canvas.width !== view.backingWidth) canvas.width = view.backingWidth;
    if (canvas.height !== view.backingHeight) canvas.height = view.backingHeight;
    camera.resize(view.columns, view.rows, world);
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

  function draw(world: GameWorld, view: ReturnType<typeof viewportSize>, packId: string, planet: number, effect?: MilestoneFrame, reduced = false): void {
    const { activeTheme, atlas, displayAtlas, displayAtlasScale } = artwork();
    const journey = activeTheme.id.startsWith('planet-journey-');
    context.imageSmoothingEnabled = journey;
    context.imageSmoothingQuality = 'high';
    context.fillStyle = themeBackground(activeTheme, packId, planet, world.level.colour); context.fillRect(0, 0, view.width, view.height);
    const offsetX = Math.max(0, (view.width - world.level.width * view.tileSize) / 2);
    const offsetY = Math.max(0, (view.height - world.level.height * view.tileSize) / 2);
    const journeyIndex = Number(activeTheme.id.split('-').at(-1)) - 1;
    const sprite = (sx: number, sy: number, x: number, y: number, size = view.tileSize) => {
      if (!displayAtlas) return;
      const a = activeTheme.atlas;
      context.drawImage(displayAtlas, (sx * a.stride + a.inset) * displayAtlasScale, (sy * a.stride + a.inset) * displayAtlasScale, a.cell * displayAtlasScale, a.cell * displayAtlasScale, x, y, size, size);
    };
    // Static terrain only changes with the camera, layout, theme or wall geometry.
    if (journey) {
      const terrain = journeyTerrain(world, view, journeyIndex);
      context.drawImage(terrain, offsetX, offsetY, terrain.width / 2, terrain.height / 2);
    }
    if (atlas) for (const e of world.entities.values()) {
      const x = offsetX + (e.x - camera.x) * view.tileSize, y = offsetY + (e.y - camera.y) * view.tileSize;
      if (effect?.kind === 'departure') {
        if (e.kind === 'ship' && e.x === effect.x && e.y === effect.y) continue;
        if (e.kind === 'robot') {
          const p = Math.min(1, effect.elapsed / 220), size = view.tileSize * (1 - p * 0.6);
          if (p < 1) {
            context.save(); context.globalAlpha = 1 - p;
            const [sx, sy] = frameFor(e, world);
            sprite(sx, sy, x + (effect.x - e.x) * view.tileSize * p + (view.tileSize - size) / 2, y + (effect.y - e.y) * view.tileSize * p + (view.tileSize - size) / 2, size);
            context.restore();
          }
          continue;
        }
      }
      if (x + view.tileSize <= 0 || y + view.tileSize <= 0 || x >= view.width || y >= view.height) continue;
      if (journey && e.kind === 'wall') {
        continue;
      }
      if (journey && !['river', 'beam', 'shot', 'flame', 'smoke', 'impact', 'blast'].includes(e.kind)) {
        context.save(); context.fillStyle = '#080d1255'; context.beginPath();
        context.ellipse(x + view.tileSize / 2, y + view.tileSize * 28 / 32, (e.kind === 'robot' ? 8 : 10) * view.tileSize / 32, view.tileSize / 16, 0, 0, Math.PI * 2); context.fill(); context.restore();
      }
      const [sx, sy] = frameFor(e, world);
      sprite(sx, sy, x, y);
    }
    if (effect) drawMilestone(context, effect, view.width, view.height,
      offsetX + (effect.x - camera.x + 0.5) * view.tileSize,
      offsetY + (effect.y - camera.y + 0.5) * view.tileSize,
      reduced, (x, y, size) => sprite(5, 1, x, y, size));
  }
  return { resize: resizeCanvas, draw };
}
