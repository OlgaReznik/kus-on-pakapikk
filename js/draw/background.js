import { SCENE } from '../config.js';
import { COLORS } from '../palette.js';
import { fillCircle, fillEllipse, fillRoundRect } from './primitives.js';

function drawSky(ctx, background) {
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#0b1d3a');
  sky.addColorStop(1, '#3d5f8f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE.width, 260);

  background.stars.forEach((star) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    fillCircle(ctx, star.x, star.y, star.radius);
  });

  const { moon } = background;
  ctx.fillStyle = '#fdf6d8';
  fillCircle(ctx, moon.x, moon.y, 30);
  ctx.fillStyle = '#0f2442';
  fillCircle(ctx, moon.x + 12, moon.y - 6, 27);
}

function drawBackSkyline(ctx, background) {
  const bottom = background.skylineBottom;
  background.backSkyline.forEach((building) => {
    ctx.fillStyle = '#1a2c48';
    ctx.fillRect(building.x, building.top, building.width, bottom - building.top);
    if (building.peak) {
      ctx.beginPath();
      ctx.moveTo(building.x - 4, building.top);
      ctx.lineTo(building.x + building.width / 2, building.top - building.peak);
      ctx.lineTo(building.x + building.width + 4, building.top);
      ctx.closePath();
      ctx.fill();
    }
    building.windows.forEach((window) => {
      ctx.fillStyle = window.lit ? 'rgba(255, 217, 102, .7)' : '#24395a';
      ctx.fillRect(window.x, window.y, 7, 9);
    });
  });
}

function drawChurch(ctx, background) {
  const { x, top } = background.church;
  const bottom = background.skylineBottom;
  ctx.fillStyle = '#233a5e';
  ctx.fillRect(x, top, 90, bottom - top);
  ctx.fillRect(x + 28, top - 90, 34, 90);
  ctx.beginPath();
  ctx.moveTo(x + 24, top - 90);
  ctx.lineTo(x + 45, top - 160);
  ctx.lineTo(x + 66, top - 90);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f4f8fc';
  ctx.beginPath();
  ctx.moveTo(x + 40, top - 142);
  ctx.lineTo(x + 45, top - 160);
  ctx.lineTo(x + 50, top - 142);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fdf6d8';
  fillCircle(ctx, x + 45, top - 68, 8);
  ctx.strokeStyle = '#233a5e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 45, top - 68); ctx.lineTo(x + 45, top - 74);
  ctx.moveTo(x + 45, top - 68); ctx.lineTo(x + 49, top - 68);
  ctx.stroke();

  ctx.fillStyle = '#ffd966';
  [[12, 20], [64, 20], [12, 55], [64, 55]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx, top + dy + 22);
    ctx.lineTo(x + dx, top + dy + 6);
    ctx.arc(x + dx + 7, top + dy + 6, 7, Math.PI, 0);
    ctx.lineTo(x + dx + 14, top + dy + 22);
    ctx.fill();
  });
}

function drawFrontSkyline(ctx, background) {
  const bottom = background.skylineBottom;
  background.frontSkyline.forEach((house) => {
    const { x, top, width, roofHeight } = house;
    ctx.fillStyle = house.color;
    ctx.fillRect(x, top, width, bottom - top);
    ctx.beginPath();
    ctx.moveTo(x - 6, top);
    ctx.lineTo(x + width / 2, top - roofHeight);
    ctx.lineTo(x + width + 6, top);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f4f8fc';
    ctx.beginPath();
    ctx.moveTo(x - 6, top);
    ctx.lineTo(x + width / 2, top - roofHeight);
    ctx.lineTo(x + width + 6, top);
    ctx.lineTo(x + width + 2, top + 3);
    ctx.lineTo(x + width / 2, top - roofHeight + 5);
    ctx.lineTo(x - 2, top + 3);
    ctx.closePath();
    ctx.fill();

    house.windows.forEach((window) => {
      ctx.fillStyle = window.lit ? '#ffd966' : '#2a3b55';
      ctx.fillRect(window.x, window.y, 9, 11);
    });
  });
}

function drawSnowyGround(ctx, background) {
  const ground = ctx.createLinearGradient(0, SCENE.horizonY, 0, SCENE.height);
  ground.addColorStop(0, '#dfe9f4');
  ground.addColorStop(1, '#f7fbff');
  ctx.fillStyle = ground;
  ctx.fillRect(0, SCENE.horizonY, SCENE.width, SCENE.height - SCENE.horizonY);
  ctx.fillStyle = 'rgba(170, 195, 225, .25)';
  background.snowDrifts.forEach((drift) => fillEllipse(ctx, drift.x, drift.y, drift.radiusX, drift.radiusY));
}

function drawIceRink(ctx, rink) {
  ctx.fillStyle = '#cfe7f6';
  ctx.strokeStyle = '#9cc6e2';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(rink.x, rink.y, rink.radiusX, rink.radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, .7)';
  ctx.lineWidth = 2;
  rink.scratchOffsets.forEach((offset, i) => {
    ctx.beginPath();
    ctx.ellipse(rink.x + offset, rink.y, rink.radiusX * (0.3 + i * 0.1), rink.radiusY * (0.25 + i * 0.1), 0, 3.6, 5.6);
    ctx.stroke();
  });
}

function garlandY(x) {
  const sag = (Math.floor(x / 180) % 2 ? 6 : 0) * Math.sin(((x % 180) / 180) * Math.PI);
  return 238 + Math.sin(x / 90) * 8 + sag;
}

function drawGarland(ctx) {
  ctx.strokeStyle = '#2d4a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= SCENE.width; x += 10) {
    if (x === 0) ctx.moveTo(x, garlandY(x));
    else ctx.lineTo(x, garlandY(x));
  }
  ctx.stroke();

  for (let x = 15; x < SCENE.width; x += 30) {
    ctx.fillStyle = COLORS.fairyLights[Math.floor(x / 30) % COLORS.fairyLights.length];
    fillCircle(ctx, x, garlandY(x) + 4, 3.2);
  }
}

function drawStall(ctx, stall) {
  const { x, baseY, width } = stall;
  ctx.fillStyle = 'rgba(60, 90, 130, .18)';
  fillEllipse(ctx, x + width / 2, baseY, width * 0.55, 6);
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(x, baseY - 72, width, 72);
  ctx.fillStyle = '#5d3a17';
  ctx.fillRect(x + 6, baseY - 60, width - 12, 34);
  ctx.fillStyle = '#ffe9b0';
  ctx.fillRect(x + 9, baseY - 57, width - 18, 28);
  stall.goods.forEach((item) => {
    ctx.fillStyle = item.color;
    fillCircle(ctx, item.x, baseY - 33, item.radius);
  });
  ctx.fillStyle = '#a0692f';
  ctx.fillRect(x - 4, baseY - 28, width + 8, 6);

  const stripeCount = 8;
  const stripeWidth = (width + 16) / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    const left = x - 8 + i * stripeWidth;
    ctx.fillStyle = i % 2 ? '#fff' : stall.awning;
    ctx.beginPath();
    ctx.moveTo(left, baseY - 92);
    ctx.lineTo(left + stripeWidth, baseY - 92);
    ctx.lineTo(left + stripeWidth, baseY - 74);
    ctx.arc(left + stripeWidth / 2, baseY - 74, stripeWidth / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#f4f8fc';
  fillRoundRect(ctx, x - 10, baseY - 98, width + 20, 8, 4);

  ctx.fillStyle = '#14273d';
  ctx.font = 'bold 12px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stall.sign, x + width / 2, baseY - 8);
}

export function drawBackground(ctx, background) {
  drawSky(ctx, background);
  drawBackSkyline(ctx, background);
  drawChurch(ctx, background);
  drawFrontSkyline(ctx, background);
  drawSnowyGround(ctx, background);
  drawIceRink(ctx, background.iceRink);
  drawGarland(ctx);
  background.stalls.forEach((stall) => drawStall(ctx, stall));
}
