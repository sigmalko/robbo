import type { MilestoneFrame } from './milestone-effects';
import { curtainEdge, flightPosition, LIFT_OFF_MS, FLIGHT_END_MS } from './milestone-effects';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function drawMilestone(
  ctx: CanvasRenderingContext2D, frame: MilestoneFrame | undefined,
  width: number, height: number, x: number, y: number,
  reduced: boolean, ship: (x: number, y: number, size: number) => void
): void {
  if (!frame) return;
  const t = frame.elapsed;
  const curtain = () => {
    const edge = curtainEdge(frame.kind, t) * width;
    ctx.save();
    if (reduced) ctx.globalAlpha = 1 - curtainEdge(frame.kind, t);
    else { ctx.beginPath(); ctx.rect(edge, 0, width - edge, height); ctx.clip(); }
    ctx.fillStyle = '#040a14'; ctx.fillRect(0, 0, width, height);
    // Identical star positions on both sides of the planet change keep the seam invisible.
    for (let i = 0; i < 65; i++) {
      ctx.fillStyle = `rgba(202,227,255,${0.3 + i % 3 * 0.2})`;
      ctx.fillRect((i * 127.3 + 19) % width, (i * 71.7 + 11) % height, 1.5, 1.5);
    }
    if (!reduced && edge > 0 && edge < width) {
      const rim = ctx.createLinearGradient(edge, 0, edge + 14, 0);
      rim.addColorStop(0, '#a9e7ff66'); rim.addColorStop(1, '#a9e7ff00');
      ctx.fillStyle = rim; ctx.fillRect(edge, 0, 14, height);
    }
    ctx.restore();
  };
  ctx.save();
  if (frame.kind === 'unlock') {
    // One warm flash, not a repeated strobe. The map stays legible throughout.
    if (!reduced) {
      ctx.fillStyle = `rgba(255,245,202,${0.48 * Math.pow(1 - clamp(t / 260), 2)})`;
      ctx.fillRect(0, 0, width, height);
      const p = clamp(t / 850);
      ctx.strokeStyle = `rgba(255,221,116,${1 - p})`; ctx.lineWidth = 3 * (1 - p) + 1;
      ctx.beginPath(); ctx.arc(x, y, 12 + p * 106, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 18; i++) {
        const angle = i * Math.PI * 2 / 18, r = 15 + p * (46 + i % 4 * 11);
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = i % 3 ? '#ffe599' : '#eaffff';
        ctx.fillRect(Math.round(x + Math.cos(angle) * r), Math.round(y + Math.sin(angle) * r + p * p * 18), 3, 3);
      }
    }
  } else if (frame.kind === 'departure') {
    const ignition = clamp((t - 200) / 260), flight = clamp((t - LIFT_OFF_MS) / (FLIGHT_END_MS - LIFT_OFF_MS));
    const px = x, py = reduced ? y : flightPosition(t, y);
    ctx.save();
    ctx.globalAlpha = reduced ? 1 - clamp((t - 1600) / 800) : 1;
    if (ignition > 0) {
      const length = reduced ? 20 : (24 + flight * 105) * ignition + Math.sin(t / 29) * 3;
      const glow = ctx.createRadialGradient(px, py + 16, 1, px, py + 16, 55);
      glow.addColorStop(0, '#8cefff88'); glow.addColorStop(1, '#72daff00');
      ctx.fillStyle = glow; ctx.fillRect(px - 55, py - 40, 110, 110);
      const plume = ctx.createLinearGradient(px, py + 12, px, py + 16 + length);
      plume.addColorStop(0, '#faffff'); plume.addColorStop(0.28, '#b1efff');
      plume.addColorStop(0.65, '#ffcf70'); plume.addColorStop(1, '#ff8c3200');
      ctx.fillStyle = plume; ctx.beginPath(); ctx.moveTo(px - 8, py + 12);
      ctx.lineTo(px, py + 16 + length); ctx.lineTo(px + 8, py + 12); ctx.fill();
    }
    ship(px - 16, py - 16, 32);
    ctx.restore();
    curtain();
  } else {
    curtain();
  }
  ctx.restore();
}
