/**
 * Editable source for the Neon Forge atlas.  The 34px stride and 2px inset are
 * intentional: they make this a drop-in replacement for the historical atlas.
 */
const size = 32, stride = 34, inset = 2;
type Painter = CanvasRenderingContext2D;

function glow(ctx: Painter, colour: string, blur = 8): void { ctx.shadowColor = colour; ctx.shadowBlur = blur; }
function panel(ctx: Painter): void {
  const fill = ctx.createLinearGradient(0, 0, 32, 32); fill.addColorStop(0, '#173d67'); fill.addColorStop(.52, '#0b1e39'); fill.addColorStop(1, '#050c1d');
  ctx.fillStyle = fill; ctx.fillRect(0, 0, size, size); ctx.strokeStyle = '#286a9b'; ctx.lineWidth = 1; ctx.strokeRect(.5, .5, 31, 31);
  ctx.fillStyle = '#6beaff22'; for (let i = 3; i < 31; i += 7) ctx.fillRect(i, 3, 2, 1);
}
function circle(ctx: Painter, x: number, y: number, r: number, fill: string, stroke = '#b9faff'): void { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1.4; ctx.stroke(); }
function line(ctx: Painter, points: readonly [number, number][], colour: string, width = 2): void { ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(p => ctx.lineTo(...p)); ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.stroke(); }
function icon(ctx: Painter, x: number, y: number): void {
  // Familiar semantics are kept per legacy frame: robot, screws, keys, doors,
  // hazards and effects all receive a distinct, high-colour treatment.
  if (y === 5 && x < 8) { // robot direction/animation frames
    glow(ctx, '#4fe6ff'); circle(ctx, 16, 16, 10, '#167bb5'); ctx.fillStyle = '#0b1934'; ctx.fillRect(8, 10, 16, 12); circle(ctx, 12, 16, 3, '#7af6ff'); circle(ctx, 20, 16, 3, '#7af6ff'); line(ctx, [[16, 6], [16, 2]], '#ffd65a'); circle(ctx, 16, 2, 1.6, '#ffd65a', '#fff3aa'); return; }
  if (x === 4 && y === 0) { glow(ctx, '#ffe266'); line(ctx, [[7, 20], [22, 5]], '#ffca42', 5); circle(ctx, 8, 21, 4, '#ffc14a'); circle(ctx, 23, 6, 4, '#fff4a3'); return; }
  if (x === 7 && y === 0) { glow(ctx, '#fb77dd'); circle(ctx, 11, 13, 6, '#f455c8'); line(ctx, [[15, 15], [27, 27]], '#ff9be9', 4); line(ctx, [[23, 23], [28, 18]], '#fff0fb', 2); return; }
  if (x === 5 && y === 0) { glow(ctx, '#65ffa2'); ctx.fillStyle = '#35cc79'; ctx.fillRect(7, 10, 18, 12); ctx.fillStyle = '#d8ffe9'; ctx.fillRect(11, 13, 10, 6); return; }
  if (x === 9 && y === 0) { glow(ctx, '#a579ff'); ctx.fillStyle = '#4d2b9d'; ctx.fillRect(7, 5, 18, 24); ctx.fillStyle = '#d9c5ff'; ctx.fillRect(11, 9, 10, 16); circle(ctx, 20, 17, 1.5, '#ffdf66'); return; }
  if (x === 6 && y === 0) { ctx.fillStyle = '#d76f32'; ctx.fillRect(5, 7, 22, 20); ctx.strokeStyle = '#ffca82'; ctx.strokeRect(5.5, 7.5, 21, 19); line(ctx, [[5, 9], [27, 24]], '#8f351d'); line(ctx, [[27, 9], [5, 24]], '#8f351d'); return; }
  if (x === 8 && y === 0) { glow(ctx, '#ff766d'); circle(ctx, 16, 17, 10, '#d62e41'); line(ctx, [[16, 8], [16, 17]], '#fff1b0', 2); circle(ctx, 16, 21, 1.5, '#fff1b0'); return; }
  if (x === 6 && y === 1) { glow(ctx, '#62f6ff'); ctx.fillStyle = '#1d4b86'; ctx.beginPath(); ctx.moveTo(4, 22); ctx.lineTo(16, 4); ctx.lineTo(28, 22); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#bdf9ff'; ctx.stroke(); circle(ctx, 16, 18, 4, '#ffdd62'); return; }
  if ((x === 3 || x === 4) && y === 1) { glow(ctx, '#80f7ff'); ctx.fillStyle = '#4d96d1'; ctx.beginPath(); ctx.ellipse(16, 16, 11, 7, 0, 0, Math.PI * 2); ctx.fill(); line(ctx, [[7, 15], [2, 9]], '#c8faff'); line(ctx, [[25, 15], [30, 9]], '#c8faff'); circle(ctx, 19, 14, 1.4, '#05101e'); return; }
  if ((x === 1 || x === 2) && y === 1) { circle(ctx, 16, 17, 10, '#ac7746', '#ffd39d'); circle(ctx, 12, 14, 1.4, '#1b1110'); circle(ctx, 20, 14, 1.4, '#1b1110'); return; }
  if ((x === 6 || x === 7) && y === 2) { glow(ctx, '#69ff9e'); for (let i = 0; i < 4; i++) circle(ctx, 7 + i * 6, 17 + (i % 2 ? -3 : 3), 4, '#3fc66a', '#c2ffd2'); return; }
  if ((x === 8 || x === 9) && y === 2) { glow(ctx, '#f6b4ff'); circle(ctx, 10, 16, 7, '#a847c3'); circle(ctx, 22, 16, 7, '#a847c3'); circle(ctx, 11, 16, 2, '#e7fbff'); circle(ctx, 23, 16, 2, '#e7fbff'); return; }
  if (y === 3 && x < 4) { glow(ctx, '#ffdb5a'); line(ctx, [[x < 2 ? 5 : 16, x < 2 ? 16 : 5], [x < 2 ? 27 : 16, x < 2 ? 16 : 27]], '#ffe36e', 3); return; }
  if (x === 5 && y === 6) { ctx.fillStyle = '#c99b51'; for (let i = 0; i < 8; i++) circle(ctx, 5 + (i * 7) % 24, 7 + (i * 11) % 20, 2.5, '#d8b26b', '#805c2d'); return; }
  if (x === 4 && y === 6) { ctx.fillStyle = '#c74c73'; ctx.fillRect(5, 5, 22, 22); line(ctx, [[9, 9], [23, 23]], '#ffb0ca', 2); line(ctx, [[23, 9], [9, 23]], '#ffb0ca', 2); return; }
  if (x === 10 && y >= 3 && y <= 5) { glow(ctx, '#ff8b43', 12); circle(ctx, 16, 16, 11, '#ef5b34', '#ffe18c'); circle(ctx, 16, 16, 5, '#fff3ba', '#fff3ba'); return; }
  if (x === 5 && y === 2) { glow(ctx, '#ff8b43'); ctx.fillStyle = '#973541'; ctx.fillRect(7, 9, 18, 15); circle(ctx, 11, 15, 2, '#ffe6a5'); circle(ctx, 21, 15, 2, '#ffe6a5'); return; }
  if (x === 2 && y === 0) { ctx.fillStyle = '#60768a'; ctx.fillRect(2, 2, 28, 28); line(ctx, [[2, 7], [30, 7]], '#b9d7e8'); line(ctx, [[7, 2], [7, 30]], '#b9d7e8'); return; }
  if (x === 0 && y === 1) { glow(ctx, '#ffdc6c'); ctx.fillStyle = '#b17b29'; ctx.fillRect(5, 5, 22, 22); ctx.fillStyle = '#fff2aa'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('?', 9, 25); return; }
  // Unused/effect frames stay attractive and visible for future frame mappings.
  glow(ctx, '#58dfff', 4); circle(ctx, 16, 16, 7, '#185886'); circle(ctx, 16, 16, 2, '#c9faff');
}

export function createModernAtlas(scale = 1): HTMLCanvasElement {
  const atlas = document.createElement('canvas'); atlas.width = 410 * scale; atlas.height = 274 * scale;
  const ctx = atlas.getContext('2d'); if (!ctx) throw Error('Unable to create modern artwork canvas');
  ctx.scale(scale, scale);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 11; x++) {
    ctx.save(); ctx.translate(x * stride + inset, y * stride + inset); panel(ctx); icon(ctx, x, y); ctx.restore();
  }
  return atlas;
}

/** Reject a partial render before it can be exposed as a selectable layout. */
export function validateModernAtlas(atlas: HTMLCanvasElement): void {
  if (atlas.width !== 410 || atlas.height !== 274) throw Error('Modern atlas dimensions are invalid');
  const ctx = atlas.getContext('2d'); if (!ctx) throw Error('Unable to inspect modern artwork canvas');
  for (let y = 0; y < 8; y++) for (let x = 0; x < 11; x++) {
    // Every required frame has an opaque panel at its centre, even effect frames.
    if (ctx.getImageData(x * stride + inset + 16, y * stride + inset + 16, 1, 1).data[3] !== 255) throw Error(`Modern atlas frame ${x},${y} is transparent`);
  }
}
