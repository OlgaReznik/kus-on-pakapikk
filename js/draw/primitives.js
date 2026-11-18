import { COLORS } from '../palette.js';

const FULL_TURN = Math.PI * 2;
const SHADOW_COLOR = 'rgba(60, 90, 130, .2)';

export function fillCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, FULL_TURN);
  ctx.fill();
}

export function strokeCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, FULL_TURN);
  ctx.stroke();
}

export function fillEllipse(ctx, x, y, radiusX, radiusY) {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, FULL_TURN);
  ctx.fill();
}

export function fillRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
  ctx.fill();
}

export function fillStar(ctx, x, y, outerRadius, innerRadius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? innerRadius : outerRadius;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

export function fillGlow(ctx, x, y, radius, rgb, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = gradient;
  fillCircle(ctx, x, y, radius);
}

export function drawGroundShadow(ctx, radiusX, radiusY) {
  ctx.fillStyle = SHADOW_COLOR;
  fillEllipse(ctx, 0, 0, radiusX, radiusY);
}

/**
 * Runs `draw` with the canvas origin moved to the object's feet and scaled to its size.
 * Objects are drawn around (0, 0) = the point where they stand on the ground.
 */
export function drawInObjectSpace(ctx, object, draw, extraScale = 1) {
  const scale = object.scale * extraScale;
  ctx.save();
  ctx.translate(object.x, object.y);
  ctx.scale(object.flip ? -scale : scale, scale);
  draw();
  ctx.restore();
}

export function drawSnowyRoof(ctx, left, right, baseY, peakY, roofColor) {
  const middle = (left + right) / 2;
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(left - 8, baseY);
  ctx.lineTo(right + 8, baseY);
  ctx.lineTo(middle, peakY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f4f8fc';
  ctx.beginPath();
  ctx.moveTo(left - 8, baseY);
  ctx.lineTo(middle, peakY);
  ctx.lineTo(right + 8, baseY);
  ctx.lineTo(right + 4, baseY + 3);
  ctx.lineTo(middle, peakY + 7);
  ctx.lineTo(left - 4, baseY + 3);
  ctx.closePath();
  ctx.fill();
}

export function drawFairyLights(ctx, fromX, toX, y, bulbCount) {
  for (let i = 0; i <= bulbCount; i++) {
    ctx.fillStyle = COLORS.fairyLights[i % COLORS.fairyLights.length];
    fillCircle(ctx, fromX + ((toX - fromX) * i) / bulbCount, y + Math.sin(i * 1.3) * 1.5, 1.8);
  }
}

export function drawCenteredText(ctx, text, x, y, fontSize, color) {
  ctx.fillStyle = color;
  ctx.font = `800 ${fontSize}px Nunito, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.textBaseline = 'alphabetic';
}
