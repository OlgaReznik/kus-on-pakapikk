import {
  drawGroundShadow, drawInObjectSpace, fillCircle, fillEllipse, fillGlow, fillRoundRect,
} from './primitives.js';

// ---------- Person ----------

function drawLegs(ctx, person) {
  ctx.fillStyle = person.pants;
  ctx.fillRect(-7, -14, 5, 12.5);
  ctx.fillRect(2, -14, 5, 12.5);
  ctx.fillStyle = '#3b2a20';
  fillRoundRect(ctx, -9, -3.5, 8, 4, 2);
  fillRoundRect(ctx, 1, -3.5, 8, 4, 2);
}

function drawCoat(ctx, person) {
  ctx.fillStyle = person.coat;
  ctx.beginPath();
  ctx.moveTo(-11, -12);
  ctx.lineTo(-9, -33);
  ctx.quadraticCurveTo(0, -38, 9, -33);
  ctx.lineTo(11, -12);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 0, 0, .22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(0, -13);
  ctx.stroke();
}

function drawArms(ctx, person) {
  const rightElbow = person.waving ? { x: 15, y: -41 } : { x: 14, y: -18 };
  const rightHand = person.waving ? { x: 15.5, y: -42.5 } : { x: 14, y: -17 };
  ctx.strokeStyle = person.coat;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, -30);
  ctx.lineTo(-14, -18);
  ctx.moveTo(9, -30);
  ctx.lineTo(rightElbow.x, rightElbow.y);
  ctx.stroke();

  ctx.fillStyle = person.mitten;
  fillCircle(ctx, -14, -17, 2.9);
  fillCircle(ctx, rightHand.x, rightHand.y, 2.9);
}

function drawHead(ctx, person) {
  ctx.fillStyle = person.skin;
  fillCircle(ctx, 0, -43, 8);

  const hairVisible = person.hatStyle === 'none' || person.hatStyle === 'earmuffs';
  if (hairVisible) {
    ctx.fillStyle = person.hair;
    ctx.beginPath();
    ctx.arc(0, -44, 8.5, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    ctx.fillStyle = person.skin;
    fillEllipse(ctx, 0, -41.5, 6.4, 4.6);
  }

  ctx.fillStyle = '#222';
  fillCircle(ctx, -2.8, -43.5, 1.15);
  fillCircle(ctx, 2.8, -43.5, 1.15);
  ctx.fillStyle = 'rgba(230, 100, 100, .35)';
  fillCircle(ctx, -4.8, -40.3, 1.6);
  fillCircle(ctx, 4.8, -40.3, 1.6);

  if (person.glasses) drawGlasses(ctx);
}

function drawGlasses(ctx) {
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(-2.9, -43.5, 2.5, 0, Math.PI * 2);
  ctx.moveTo(5.4, -43.5);
  ctx.arc(2.9, -43.5, 2.5, 0, Math.PI * 2);
  ctx.moveTo(-0.4, -43.5);
  ctx.lineTo(0.4, -43.5);
  ctx.stroke();
}

function drawScarf(ctx, scarf) {
  if (!scarf) return;
  const segment = (x, y, width, height, index) => {
    ctx.fillStyle = scarf.stripe && index % 2 ? scarf.stripe : scarf.main;
    ctx.fillRect(x, y, width, height);
  };
  for (let i = 0; i < 4; i++) segment(-8 + i * 4, -36.5, 4, 4.5, i);
  for (let j = 0; j < 3; j++) segment(2, -32 + j * 3.4, 4.6, 3.4, j + 1);
}

/** Green bars of the Nortal "N" mark (from Nortal.svg): [x, top, bottom] in a 32 × 44 box. */
const NORTAL_BARS = [
  [0.94, 1.9, 42.2], [4.69, 0, 44], [8.44, 1.9, 42.2], [12.19, 7.4, 29.5], [15.93, 11, 33],
  [19.68, 14.7, 36.7], [23.43, 1.9, 42.2], [27.18, 0, 43.9], [30.92, 1.9, 42.2],
];
const NORTAL_GREEN = '#009639';

/** Nortal "N" on the left side of the chest. */
function drawNortalLogo(ctx) {
  const size = 0.2;
  ctx.save();
  ctx.translate(-7.4, -30.5);
  ctx.scale(size, size);
  ctx.strokeStyle = NORTAL_GREEN;
  ctx.lineWidth = 1.9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  NORTAL_BARS.forEach(([x, top, bottom]) => {
    ctx.moveTo(x, top + 1);
    ctx.lineTo(x, bottom - 1);
  });
  ctx.stroke();
  ctx.restore();
}

/** Laptop carried under the left arm. */
function drawLaptop(ctx, color) {
  ctx.fillStyle = color;
  fillRoundRect(ctx, -18.5, -28, 5, 13.5, 1);
  ctx.fillStyle = 'rgba(0, 0, 0, .25)';
  ctx.fillRect(-14.4, -27.5, 0.9, 12.5);
}

function drawSantaBelt(ctx) {
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(-10.6, -21, 21.2, 2.8);
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(-2, -21.4, 4, 3.6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-0.8, -32, 1.6, 10);
}

function drawBeard(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-7.4, -42);
  ctx.quadraticCurveTo(-7, -33, 0, -30.5);
  ctx.quadraticCurveTo(7, -33, 7.4, -42);
  ctx.quadraticCurveTo(4, -38.5, 0, -39);
  ctx.quadraticCurveTo(-4, -38.5, -7.4, -42);
  ctx.fill();
}

const HAT_DRAWERS = {
  none: () => {},

  beanie(ctx, person) {
    ctx.fillStyle = person.hatColor;
    ctx.beginPath();
    ctx.arc(0, -46, 8.7, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = person.hatTrim;
    ctx.fillRect(-9.2, -47.5, 18.4, 3.6);
    fillCircle(ctx, 0, -55.6, 2.9);
  },

  pointy(ctx, person) {
    ctx.fillStyle = person.hatColor;
    ctx.beginPath();
    ctx.moveTo(-9.2, -46);
    ctx.quadraticCurveTo(-2, -59, 9, -66);
    ctx.quadraticCurveTo(4, -56, 9.2, -46);
    ctx.closePath();
    ctx.fill();
    if (person.hatTrim) {
      ctx.fillStyle = person.hatTrim;
      ctx.fillRect(-9.6, -48, 19.2, 3.6);
    }
    ctx.fillStyle = person.bellColor;
    fillCircle(ctx, 9.6, -66, 2.7);
  },

  santa(ctx) {
    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    ctx.moveTo(-9.2, -47);
    ctx.quadraticCurveTo(0, -63, 13, -58);
    ctx.quadraticCurveTo(6, -54, 9.2, -47);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-9.6, -49.5, 19.2, 4);
    fillCircle(ctx, 13, -58, 3);
  },

  earmuffs(ctx, person) {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -44, 8.6, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.fillStyle = person.hatColor;
    fillCircle(ctx, -8.6, -43, 3.4);
    fillCircle(ctx, 8.6, -43, 3.4);
  },
};

export function drawPerson(ctx, person) {
  drawInObjectSpace(ctx, person, () => {
    drawGroundShadow(ctx, 13, 3.5);
    drawLegs(ctx, person);
    drawCoat(ctx, person);
    drawArms(ctx, person);
    drawHead(ctx, person);
    drawScarf(ctx, person.scarf);
    if (person.nortalLogo) drawNortalLogo(ctx);
    if (person.laptop) drawLaptop(ctx, person.laptop);
    if (person.belt) drawSantaBelt(ctx);
    if (person.beard) drawBeard(ctx, person.hair);
    HAT_DRAWERS[person.hatStyle](ctx, person);
  });
}

// ---------- Reindeer ----------

function drawReindeerLegs(ctx) {
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  [[-12, -13], [-6, -6], [8, 8], [13, 14]].forEach(([top, bottom]) => {
    ctx.moveTo(top, -19);
    ctx.lineTo(bottom, -1);
  });
  ctx.stroke();
}

function drawAntlers(ctx) {
  ctx.strokeStyle = '#a1887f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16.5, -46); ctx.lineTo(12.5, -58);
  ctx.moveTo(14.6, -52); ctx.lineTo(9.5, -54.5);
  ctx.moveTo(20.5, -46.5); ctx.lineTo(24.5, -58);
  ctx.moveTo(22.6, -52.5); ctx.lineTo(27.5, -55);
  ctx.stroke();
}

export function drawReindeer(ctx, reindeer) {
  drawInObjectSpace(ctx, reindeer, () => {
    drawGroundShadow(ctx, 21, 4);
    drawReindeerLegs(ctx);

    ctx.fillStyle = reindeer.fur;
    fillEllipse(ctx, 0, -23, 18, 9.5);
    ctx.fillStyle = '#d7ccc8';
    fillEllipse(ctx, 1, -18.5, 11, 3.8);
    fillEllipse(ctx, -18, -26, 3.2, 2.6);

    ctx.strokeStyle = reindeer.fur;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(10, -27);
    ctx.lineTo(17, -39);
    ctx.stroke();

    ctx.fillStyle = reindeer.fur;
    fillEllipse(ctx, 19, -41, 6.6, 5.6);
    ctx.fillStyle = '#bcaaa4';
    fillEllipse(ctx, 24.5, -39, 4.2, 3.1);
    drawAntlers(ctx);
    ctx.fillStyle = reindeer.fur;
    fillEllipse(ctx, 14, -45, 3.2, 1.6);
    ctx.fillStyle = '#1e1e1e';
    fillCircle(ctx, 20.5, -42.8, 1.1);

    if (reindeer.collar) {
      ctx.strokeStyle = reindeer.collar;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(11.5, -33);
      ctx.lineTo(17, -30.5);
      ctx.stroke();
      ctx.fillStyle = '#f1c40f';
      fillCircle(ctx, 14.5, -29, 1.8);
    }

    if (reindeer.noseGlows) fillGlow(ctx, 28.5, -39.5, 7, '255, 60, 60', 0.65);
    ctx.fillStyle = reindeer.nose;
    fillCircle(ctx, 28.5, -39.5, 2.7);
  });
}
