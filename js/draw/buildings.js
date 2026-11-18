import {
  drawCenteredText, drawFairyLights, drawGroundShadow, drawInObjectSpace, drawSnowyRoof, fillCircle, fillRoundRect,
} from './primitives.js';

const DARK_WOOD = '#3b2f2f';
const SIGN_BOARD = '#fdf6e3';
const WARM_WINDOW = '#ffe08a';

function drawChimneySmoke(ctx, x, topY) {
  ctx.fillStyle = 'rgba(255, 255, 255, .7)';
  fillCircle(ctx, x, topY - 6, 5);
  fillCircle(ctx, x + 5, topY - 14, 6);
  fillCircle(ctx, x + 1, topY - 23, 7);
}

function drawStripedAwning(ctx, left, y, stripeCount, stripeWidth, color) {
  for (let i = 0; i < stripeCount; i++) {
    const x = left + i * stripeWidth;
    ctx.fillStyle = i % 2 ? '#fff' : color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + stripeWidth, y);
    ctx.lineTo(x + stripeWidth, y + 6);
    ctx.arc(x + stripeWidth / 2, y + 6, stripeWidth / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawCafe(ctx, cafe) {
  drawInObjectSpace(ctx, cafe, () => {
    drawGroundShadow(ctx, 66, 7);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(30, -112, 10, 22);
    drawChimneySmoke(ctx, 36, -112);

    ctx.fillStyle = cafe.wall;
    ctx.fillRect(-55, -82, 110, 82);
    drawSnowyRoof(ctx, -55, 55, -82, -118, DARK_WOOD);
    ctx.fillStyle = SIGN_BOARD;
    fillRoundRect(ctx, -30, -79, 60, 14, 3);
    drawCenteredText(ctx, cafe.sign, 0, -72, 10, DARK_WOOD);

    // Shop window with cups and a cake
    ctx.fillStyle = WARM_WINDOW;
    ctx.fillRect(-48, -58, 42, 34);
    ctx.fillStyle = 'rgba(120, 70, 20, .35)';
    ctx.fillRect(-48, -36, 42, 12);
    ctx.fillStyle = '#fff';
    fillCircle(ctx, -38, -40, 3);
    fillCircle(ctx, -24, -41, 3);
    ctx.fillStyle = '#8d5524';
    ctx.fillRect(-30, -47, 6, 6);
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.strokeRect(-48, -58, 42, 34);
    ctx.beginPath();
    ctx.moveTo(-27, -58);
    ctx.lineTo(-27, -24);
    ctx.stroke();
    drawStripedAwning(ctx, -51, -64, 6, 8, cafe.awning);

    // Door with a wreath
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(8, -52, 22, 52);
    ctx.fillStyle = '#f1c40f';
    fillCircle(ctx, 26, -26, 1.6);
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(19, -40, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#e74c3c';
    fillCircle(ctx, 19, -35, 1.8);

    drawFairyLights(ctx, -55, 55, -84, 14);

    // Outdoor table with a cup
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(42, -14, 3, 14);
    ctx.beginPath();
    ctx.ellipse(43.5, -14, 9, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    fillCircle(ctx, 41, -17, 1.8);
  });
}

export function drawHouse(ctx, house) {
  drawInObjectSpace(ctx, house, () => {
    drawGroundShadow(ctx, 52, 6);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(18, -108, 9, 22);
    drawChimneySmoke(ctx, 23, -106);

    ctx.fillStyle = house.wall;
    ctx.fillRect(-44, -70, 88, 70);
    ctx.strokeStyle = 'rgba(0, 0, 0, .12)';
    ctx.lineWidth = 1;
    for (let y = -62; y < 0; y += 8) {
      ctx.beginPath();
      ctx.moveTo(-44, y);
      ctx.lineTo(44, y);
      ctx.stroke();
    }
    drawSnowyRoof(ctx, -44, 44, -70, -112, house.roof);

    const windows = [[-35, -56, 20, 18], [15, -56, 20, 18], [-6, -94, 12, 12]];
    ctx.fillStyle = '#ffd966';
    windows.forEach((rect) => ctx.fillRect(...rect));
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    windows.forEach((rect) => ctx.strokeRect(...rect));
    ctx.beginPath();
    ctx.moveTo(-25, -56); ctx.lineTo(-25, -38);
    ctx.moveTo(25, -56); ctx.lineTo(25, -38);
    ctx.stroke();

    ctx.fillStyle = '#3e2723';
    fillRoundRect(ctx, -9, -34, 18, 34, 3);
    ctx.fillStyle = '#f1c40f';
    fillCircle(ctx, 5, -17, 1.5);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-37, -38, 24, 3);
    ctx.fillRect(13, -38, 24, 3);
    drawFairyLights(ctx, -50, 50, -71, 12);
  });
}

export function drawKiosk(ctx, kiosk) {
  drawInObjectSpace(ctx, kiosk, () => {
    drawGroundShadow(ctx, 36, 5);
    ctx.fillStyle = kiosk.wall;
    ctx.fillRect(-30, -66, 60, 66);
    ctx.fillStyle = '#ffe9b0';
    ctx.fillRect(-23, -54, 46, 24);
    ctx.fillStyle = '#8d5524';
    ctx.fillRect(-27, -31, 54, 5);
    [['#c0392b', -12], ['#fff', 0], ['#8d5524', 12]].forEach(([color, x]) => {
      ctx.fillStyle = color;
      fillCircle(ctx, x, -34, 3);
    });

    ctx.fillStyle = DARK_WOOD;
    ctx.beginPath();
    ctx.moveTo(-36, -66);
    ctx.quadraticCurveTo(0, -92, 36, -66);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f4f8fc';
    ctx.beginPath();
    ctx.moveTo(-36, -66);
    ctx.quadraticCurveTo(0, -92, 36, -66);
    ctx.quadraticCurveTo(0, -84, -36, -66);
    ctx.fill();

    ctx.fillStyle = SIGN_BOARD;
    fillRoundRect(ctx, -22, -22, 44, 12, 3);
    drawCenteredText(ctx, kiosk.sign, 0, -16, 9, DARK_WOOD);
    drawFairyLights(ctx, -30, 30, -67, 8);
  });
}
