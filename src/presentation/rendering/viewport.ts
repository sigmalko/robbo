/** Keep objects at 32 CSS pixels; available space only changes camera coverage. */
export function viewportSize(width: number, height: number, pixelRatio = 1) {
  width = Math.max(1, width); height = Math.max(1, height);
  const tileSize = 32;
  const scale = Math.max(1, Math.min(2, pixelRatio || 1));
  return {
    width, height, tileSize,
    columns: width / tileSize, rows: height / tileSize,
    backingWidth: Math.round(width * scale), backingHeight: Math.round(height * scale)
  };
}
