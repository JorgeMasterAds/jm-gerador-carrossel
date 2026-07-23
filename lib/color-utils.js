/**
 * color-utils.js — helpers de cor para os templates
 *
 * Permite derivar variantes com transparência (glow, borda, fundo sutil) de
 * uma única cor de destaque configurada em brand.config.json, sem precisar
 * hardcodar cada rgba() manualmente por template.
 */

export function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const bigint = parseInt(full, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
