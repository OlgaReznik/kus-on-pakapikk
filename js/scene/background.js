// Generates the static backdrop: sky, skyline, church, ice rink and the row of market stalls.
import { SCENE } from '../config.js';
import { COLORS, SIGNS } from '../palette.js';

const SKYLINE_BOTTOM = 250;

function createStars(rng) {
  return Array.from({ length: 70 }, () => ({
    x: rng.range(0, SCENE.width),
    y: rng.range(5, 170),
    radius: rng.range(0.6, 1.8),
    alpha: rng.range(0.4, 1),
  }));
}

function createWindowGrid(rng, left, width, top, bottom, step, litChance) {
  const windows = [];
  for (let x = left + step.inset; x < left + width - step.inset - 4; x += step.x) {
    for (let y = top + step.top; y < bottom; y += step.y) windows.push({ x, y, lit: rng.chance(litChance) });
  }
  return windows;
}

function createBackSkyline(rng) {
  const buildings = [];
  for (let x = -30; x < SCENE.width;) {
    const width = rng.range(60, 130);
    const top = rng.range(95, 150);
    buildings.push({
      x,
      top,
      width,
      peak: rng.chance(0.4) ? rng.range(15, 35) : 0,
      windows: createWindowGrid(rng, x, width, top, 200, { x: 16, y: 18, inset: 8, top: 10 }, 0.35),
    });
    x += width + rng.range(-10, 10);
  }
  return buildings;
}

function createFrontSkyline(rng) {
  const houses = [];
  for (let x = -20; x < SCENE.width;) {
    const width = rng.range(80, 170);
    const top = rng.range(140, 195);
    houses.push({
      x,
      top,
      width,
      roofHeight: rng.range(25, 45),
      color: rng.pick(COLORS.skylineHouses),
      windows: createWindowGrid(rng, x, width, top, SCENE.horizonY, { x: 22, y: 24, inset: 12, top: 12 }, 0.6),
    });
    x += width + rng.range(4, 20);
  }
  return houses;
}

function createStalls(rng) {
  const stalls = [];
  for (let x = rng.range(20, 90); x < SCENE.width - 150;) {
    const width = rng.range(120, 150);
    stalls.push({
      x,
      baseY: rng.range(285, 298),
      width,
      awning: rng.pick(COLORS.awnings),
      sign: rng.pick(SIGNS.stalls),
      goods: Array.from({ length: 5 }, (_, i) => ({
        x: x + 16 + (i * (width - 32)) / 4,
        color: rng.pick(COLORS.stallGoods),
        radius: rng.range(3, 5),
      })),
    });
    x += width + rng.range(60, 200);
  }
  return stalls;
}

export function createBackground(rng) {
  return {
    skylineBottom: SKYLINE_BOTTOM,
    stars: createStars(rng),
    moon: { x: rng.range(200, SCENE.width - 200), y: rng.range(50, 90) },
    backSkyline: createBackSkyline(rng),
    church: { x: rng.range(150, SCENE.width - 250), top: rng.range(120, 135) },
    frontSkyline: createFrontSkyline(rng),
    snowDrifts: Array.from({ length: 40 }, () => ({
      x: rng.range(0, SCENE.width), y: rng.range(280, SCENE.height), radiusX: rng.range(40, 140), radiusY: rng.range(6, 16),
    })),
    iceRink: {
      x: rng.range(450, SCENE.width - 450),
      y: rng.range(600, 820),
      radiusX: rng.range(220, 290),
      radiusY: rng.range(90, 120),
      scratchOffsets: Array.from({ length: 6 }, () => rng.range(-40, 40)),
    },
    stalls: createStalls(rng),
  };
}
