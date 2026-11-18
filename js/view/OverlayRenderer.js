// Animated layer above the picture: falling snow, found/miss markers, hint circles and the admin solution.

import { PENALTY_SECONDS, SCENE, TARGET_INFO } from '../config.js';
import { fillCircle } from '../draw/primitives.js';
import { hitboxCenter } from '../scene/hitbox.js';

const SNOWFLAKE_COUNT = 160;
const MISS_MARK_MS = 900;
const FOUND_GROW_MS = 400;
const FOUND_PULSE_MS = 1600;

function createSnowflakes() {
  return Array.from({ length: SNOWFLAKE_COUNT }, () => ({
    x: Math.random() * SCENE.width,
    y: Math.random() * SCENE.height,
    radius: Math.random() * 2.2 + 0.8,
    speed: Math.random() * 0.6 + 0.35,
    phase: Math.random() * 6,
  }));
}

export class OverlayRenderer {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.snowflakes = createSnowflakes();
    this.game = null;
    this.missMarks = [];
    this.foundMarks = [];
    this.showSolution = false;
  }

  attach(game) {
    this.game = game;
    this.missMarks = [];
    this.foundMarks = [];
    this.showSolution = false;
  }

  markMiss(x, y) {
    this.missMarks.push({ x, y, createdAt: performance.now() });
  }

  markFound(target) {
    const center = hitboxCenter(target.hitbox);
    const radius = Math.max(target.hitbox.width, target.hitbox.height) * 0.75;
    this.foundMarks.push({ ...center, radius, createdAt: performance.now() });
  }

  markAllFound(targets) {
    targets.forEach((target) => this.markFound(target));
  }

  draw(now) {
    const { ctx } = this;
    ctx.setTransform(SCENE.resolution, 0, 0, SCENE.resolution, 0, 0);
    ctx.clearRect(0, 0, SCENE.width, SCENE.height);
    this.drawSnow(now);
    if (!this.game) return;
    this.game.activeHints.forEach((hint) => this.drawHint(hint, now));
    this.drawMissMarks(now);
    this.foundMarks.forEach((mark) => this.drawFoundMark(mark, now));
    if (this.showSolution) this.game.targets.forEach((target) => this.drawSolutionLabel(target));
  }

  drawSnow(now) {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(255, 255, 255, .85)';
    this.snowflakes.forEach((flake) => {
      flake.y += flake.speed;
      flake.x += Math.sin(now / 1400 + flake.phase) * 0.3;
      if (flake.y > SCENE.height) {
        flake.y = -5;
        flake.x = Math.random() * SCENE.width;
      }
      fillCircle(ctx, flake.x, flake.y, flake.radius);
    });
  }

  drawHint(hint, now) {
    const { ctx } = this;
    const pulse = (Math.sin((now - hint.createdAt) / 300) + 1) / 2;
    ctx.strokeStyle = `rgba(244, 196, 48, ${0.55 + 0.4 * pulse})`;
    ctx.lineWidth = 5 + 3 * pulse;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.arc(hint.x, hint.y, hint.radius + pulse * 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawMissMarks(now) {
    const { ctx } = this;
    this.missMarks = this.missMarks.filter((mark) => now - mark.createdAt < MISS_MARK_MS);
    this.missMarks.forEach((mark) => {
      const alpha = 1 - (now - mark.createdAt) / MISS_MARK_MS;
      ctx.strokeStyle = `rgba(214, 40, 40, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mark.x - 9, mark.y - 9); ctx.lineTo(mark.x + 9, mark.y + 9);
      ctx.moveTo(mark.x + 9, mark.y - 9); ctx.lineTo(mark.x - 9, mark.y + 9);
      ctx.stroke();
      ctx.fillStyle = `rgba(214, 40, 40, ${alpha})`;
      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`+${PENALTY_SECONDS.miss} s`, mark.x + 12, mark.y - 10 - (1 - alpha) * 14);
    });
  }

  drawFoundMark(mark, now) {
    const { ctx } = this;
    const age = now - mark.createdAt;
    const grow = Math.min(1, age / FOUND_GROW_MS);
    const pulse = age < FOUND_PULSE_MS ? Math.sin(age / 120) * 3 : 0;
    const radius = (mark.radius + pulse) * (0.4 + 0.6 * grow);
    ctx.strokeStyle = '#1f9d3a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(mark.x, mark.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mark.x, mark.y, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawSolutionLabel(target) {
    const { ctx } = this;
    const center = hitboxCenter(target.hitbox);
    const radius = Math.max(target.hitbox.width, target.hitbox.height) * 0.8;
    ctx.strokeStyle = '#e84393';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const label = TARGET_INFO[target.targetKey].label;
    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.textAlign = 'center';
    const labelWidth = ctx.measureText(label).width + 12;
    ctx.fillStyle = '#e84393';
    ctx.fillRect(center.x - labelWidth / 2, center.y - radius - 26, labelWidth, 22);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, center.x, center.y - radius - 9);
  }
}
