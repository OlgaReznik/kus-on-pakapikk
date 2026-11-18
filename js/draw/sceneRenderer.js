import { SCENE } from '../config.js';
import { drawBackground } from './background.js';
import { drawCafe, drawHouse, drawKiosk } from './buildings.js';
import { drawPerson, drawReindeer } from './characters.js';
import { drawGift, drawLamp, drawMitten, drawSnowman, drawTree } from './items.js';

const DRAWERS = {
  person: drawPerson,
  reindeer: drawReindeer,
  gift: drawGift,
  tree: drawTree,
  snowman: drawSnowman,
  lamp: drawLamp,
  mitten: drawMitten,
  cafe: drawCafe,
  house: drawHouse,
  kiosk: drawKiosk,
};

export function drawSceneObject(ctx, object) {
  const draw = DRAWERS[object.type];
  if (!draw) throw new Error(`Tundmatu objekti tüüp: ${object.type}`);
  draw(ctx, object);
}

/** Draws the whole picture. Objects must already be sorted back-to-front. */
export function renderScene(canvas, scene) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(SCENE.resolution, 0, 0, SCENE.resolution, 0, 0);
  ctx.clearRect(0, 0, SCENE.width, SCENE.height);
  drawBackground(ctx, scene.background);
  scene.objects.forEach((object) => drawSceneObject(ctx, object));
}
