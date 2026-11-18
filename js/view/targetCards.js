// The "wanted" cards in the header showing what to look for.

import { TARGET_INFO } from '../config.js';
import { drawSceneObject } from '../draw/sceneRenderer.js';
import { fillCircle } from '../draw/primitives.js';

const CARD_SIZE = 72;
const COMPACT_FROM_COUNT = 4;

/** Where each kind of target sits inside its card, so it is centred and fully visible. */
const CARD_POSE = {
  person: { x: 36, y: 71, scale: 0.98 },
  reindeer: { x: 31, y: 62, scale: 0.98 },
  snowman: { x: 36, y: 69, scale: 0.88 },
  tree: { x: 36, y: 69, scale: 0.66 },
  mitten: { x: 38, y: 56, scale: 1.7, rotation: -0.3 },
  gift: { x: 36, y: 58, scale: 1.45 },
};

function createPortrait(target) {
  const canvas = document.createElement('canvas');
  const pixelRatio = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = CARD_SIZE * pixelRatio;
  canvas.height = CARD_SIZE * pixelRatio;

  const ctx = canvas.getContext('2d');
  ctx.scale(pixelRatio, pixelRatio);
  ctx.fillStyle = '#eaf2fb';
  fillCircle(ctx, CARD_SIZE / 2, CARD_SIZE / 2, CARD_SIZE / 2 - 2);
  drawSceneObject(ctx, { ...target, ...CARD_POSE[target.type], flip: false });
  return canvas;
}

export class TargetCards {
  constructor(container) {
    this.container = container;
    this.cards = new Map();
  }

  render(targets) {
    this.container.replaceChildren();
    this.cards.clear();
    this.container.classList.toggle('is-compact', targets.length >= COMPACT_FROM_COUNT);

    targets.forEach((target) => {
      const info = TARGET_INFO[target.targetKey];
      const card = document.createElement('div');
      card.className = 'target-card';
      card.title = info.hint;
      const label = document.createElement('small');
      label.textContent = info.label;
      card.append(createPortrait(target), label);
      this.container.append(card);
      this.cards.set(target.targetKey, card);
    });
  }

  markFound(targetKey) {
    this.cards.get(targetKey)?.classList.add('is-found');
  }

  markAllFound() {
    this.cards.forEach((card) => card.classList.add('is-found'));
  }
}
