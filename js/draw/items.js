import {
  drawGroundShadow, drawInObjectSpace, fillCircle, fillEllipse, fillGlow, fillRoundRect, fillStar, strokeCircle,
} from './primitives.js';

const MITTEN_SIZE_BOOST = 1.35;

export function drawGift(ctx, gift) {
  drawInObjectSpace(ctx, gift, () => {
    drawGroundShadow(ctx, 15, 3.5);
    ctx.fillStyle = gift.box;
    fillRoundRect(ctx, -12, -22, 24, 22, 2);

    if (gift.dots) {
      ctx.fillStyle = gift.dots;
      [[-8, -17], [6, -6], [-6, -6], [8, -17], [0, -12]].forEach(([x, y]) => fillCircle(ctx, x, y, 1.4));
    }

    ctx.fillStyle = 'rgba(0, 0, 0, .13)';
    ctx.fillRect(6, -22, 6, 22);
    ctx.fillStyle = gift.box;
    fillRoundRect(ctx, -13.5, -27, 27, 6, 1.5);
    ctx.fillStyle = 'rgba(0, 0, 0, .08)';
    ctx.fillRect(-13.5, -22.5, 27, 1.5);

    ctx.fillStyle = gift.ribbon;
    ctx.fillRect(-2.3, -27, 4.6, 27);
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(4.5 * side, -29.5);
      ctx.rotate(0.4 * side);
      fillEllipse(ctx, 0, 0, 4.6, 2.7);
      ctx.restore();
    });
    fillCircle(ctx, 0, -28.5, 2);

    if (gift.shiny) {
      ctx.fillStyle = 'rgba(255, 255, 255, .55)';
      ctx.fillRect(-10, -20, 2.5, 16);
      ctx.fillStyle = 'rgba(255, 250, 200, .9)';
      fillStar(ctx, -9, -31, 3.2, 1.2);
    }
  });
}

export function drawTree(ctx, tree) {
  drawInObjectSpace(ctx, tree, () => {
    drawGroundShadow(ctx, 26, 6);
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(-4, -11, 8, 11);

    for (let layer = 0; layer < 3; layer++) {
      const baseY = -10 - layer * 22;
      const halfWidth = 30 - layer * 7;
      ctx.fillStyle = tree.green;
      ctx.beginPath();
      ctx.moveTo(-halfWidth, baseY);
      ctx.lineTo(halfWidth, baseY);
      ctx.lineTo(0, baseY - 34);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, .85)';
      fillEllipse(ctx, -halfWidth * 0.45, baseY - 1, halfWidth * 0.35, 2.2);
      fillEllipse(ctx, halfWidth * 0.4, baseY - 1.5, halfWidth * 0.3, 2);
    }

    tree.ornaments.forEach((ornament) => {
      ctx.fillStyle = ornament.color;
      fillCircle(ctx, ornament.x, ornament.y, 2.4);
    });
    ctx.fillStyle = tree.star;
    fillStar(ctx, 0, -88, 6, 2.6);
  });
}

export function drawSnowman(ctx, snowman) {
  drawInObjectSpace(ctx, snowman, () => {
    drawGroundShadow(ctx, 16, 4);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#c7dbee';
    ctx.lineWidth = 1.2;
    [[-13, 13], [-33, 10], [-50, 7.5]].forEach(([y, radius]) => {
      fillCircle(ctx, 0, y, radius);
      strokeCircle(ctx, 0, y, radius);
    });

    ctx.fillStyle = '#222';
    [[-2.6, -51.5], [2.6, -51.5], [0, -35], [0, -30]].forEach(([x, y]) => fillCircle(ctx, x, y, 1.15));
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(0, -49.5);
    ctx.lineTo(9, -48.5);
    ctx.lineTo(0, -47.5);
    ctx.fill();

    ctx.fillStyle = snowman.scarf;
    ctx.fillRect(-7.5, -44, 15, 3.5);
    ctx.fillRect(2, -42, 3.5, 8);

    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-9, -35); ctx.lineTo(-19, -42);
    ctx.moveTo(9, -35); ctx.lineTo(19, -41);
    ctx.stroke();

    if (snowman.hasHat) {
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(-8, -58, 16, 2.5);
      ctx.fillRect(-5.5, -68, 11, 10.5);
      ctx.fillStyle = snowman.hatBand;
      ctx.fillRect(-5.5, -61, 11, 2.6);
    }
  });
}

export function drawLamp(ctx, lamp) {
  drawInObjectSpace(ctx, lamp, () => {
    drawGroundShadow(ctx, 8, 2.5);
    fillGlow(ctx, 0, -86, 26, '255, 220, 120', 0.55);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-1.6, -80, 3.2, 80);
    ctx.fillRect(-5, -3, 10, 3);
    ctx.fillStyle = '#ffe08a';
    ctx.fillRect(-5, -93, 10, 13);
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(-7.5, -93);
    ctx.lineTo(7.5, -93);
    ctx.lineTo(0, -100);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-6, -81, 12, 2);
    ctx.fillStyle = '#fff';
    fillEllipse(ctx, 0, -99, 6, 1.8);
  });
}

export function drawMitten(ctx, mitten) {
  drawInObjectSpace(ctx, mitten, () => {
    drawGroundShadow(ctx, 9, 2.4);
    ctx.rotate(mitten.rotation);
    ctx.fillStyle = mitten.color;
    fillRoundRect(ctx, -5.5, -15, 11, 12, 5);
    fillEllipse(ctx, -6, -8, 2.6, 4);
    ctx.fillStyle = mitten.cuff;
    fillRoundRect(ctx, -6.2, -4.5, 12.4, 4.2, 1.5);
  }, MITTEN_SIZE_BOOST);
}
