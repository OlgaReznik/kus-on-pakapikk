// Creates every kind of object in the picture: hidden targets, look-alike decoys and scenery.
//
// `decoyRate` (0…1, set per level) controls how often a filler object copies some – but never
// all – of a target's tell-tale features.

import { COLORS, SIGNS, TARGET_COLORS as T } from '../palette.js';

// ---------- Look-alike guards ----------

const hasElfScarf = (person) => person.scarf?.main === T.elfScarf.main && person.scarf?.stripe === T.elfScarf.stripe;

const looksLikeElf = (person) =>
  person.hatStyle === 'pointy' && COLORS.greens.includes(person.hatColor) && hasElfScarf(person);

const looksLikeSanta = (person) =>
  person.hatStyle === 'santa' && person.beard && COLORS.redCoats.includes(person.coat);

const looksLikeLumi = (snowman) =>
  snowman.hasHat && snowman.hatBand === T.snowmanBand && snowman.scarf === T.snowmanScarf;

// ---------- People ----------

function pickHatStyle(rng) {
  const roll = rng.next();
  if (roll < 0.28) return 'beanie';
  if (roll < 0.44) return 'santa';
  if (roll < 0.66) return 'pointy';
  if (roll < 0.82) return 'earmuffs';
  return 'none';
}

function pickScarf(rng, decoyRate) {
  const roll = rng.next();
  if (roll < decoyRate * 1.6) return { ...T.elfScarf };
  if (roll < decoyRate * 2.2) return { main: T.elfScarf.main, stripe: rng.pick(COLORS.scarfRedPartners) };
  if (roll < 0.8) return { main: rng.pick(COLORS.scarves), stripe: rng.chance(0.5) ? rng.pick(COLORS.scarves) : null };
  return null;
}

function createPassenger(rng, decoyRate) {
  const person = {
    type: 'person',
    coat: rng.pick(COLORS.coats),
    pants: rng.pick(COLORS.pants),
    mitten: rng.pick(COLORS.mittens),
    skin: rng.pick(COLORS.skins),
    hair: rng.pick(COLORS.hair),
    glasses: rng.chance(0.14),
    waving: rng.chance(0.12),
    flip: rng.chance(0.5),
    hatStyle: pickHatStyle(rng),
    hatColor: rng.pick(COLORS.hats),
    hatTrim: rng.pick(COLORS.hatTrims),
    bellColor: rng.pick(COLORS.bells),
    beard: false,
    belt: false,
  };

  if (person.hatStyle === 'pointy') {
    person.hatTrim = rng.chance(0.5) ? null : rng.pick(COLORS.hatTrims);
    if (rng.chance(decoyRate * 2.6)) person.hatColor = rng.pick(COLORS.greens);
  }
  if (person.hatStyle === 'beanie' && rng.chance(decoyRate)) person.hatColor = rng.pick(COLORS.greens);
  person.scarf = pickScarf(rng, decoyRate);

  if (rng.chance(0.05 + decoyRate * 0.8)) {
    person.beard = true;
    person.hair = rng.pick(COLORS.greyHair);
  }
  if (rng.chance(decoyRate * 0.9)) {
    person.hatStyle = 'santa';
    person.coat = rng.pick(COLORS.redCoats);
  }
  return breakTargetLookalikes(rng, person);
}

function breakTargetLookalikes(rng, person) {
  if (looksLikeElf(person)) person.scarf = { main: T.elfScarf.main, stripe: null };
  if (looksLikeSanta(person)) {
    if (rng.chance(0.5)) person.beard = false;
    else person.coat = rng.pick(COLORS.nonRedCoats);
  }
  return person;
}

// ---------- Reindeer ----------

function createReindeer(rng, decoyRate) {
  return {
    type: 'reindeer',
    fur: rng.pick(COLORS.fur),
    nose: rng.pick(COLORS.darkNoses),
    collar: rng.chance(0.25 + decoyRate) ? rng.pick(COLORS.collars) : null,
    noseGlows: false,
    flip: rng.chance(0.5),
  };
}

// ---------- Gifts ----------

function createGift(rng, decoyRate) {
  let box = rng.pick(COLORS.boxes);
  let ribbon = rng.pick(COLORS.ribbons);
  if (rng.chance(decoyRate * 2.2)) {
    box = rng.pick(COLORS.golds);
    ribbon = rng.pick(COLORS.nonRedRibbons);
  }
  if (box === ribbon) ribbon = '#ffffff';
  if (box === '#ecf0f1') ribbon = rng.pick(['#c0392b', '#27ae60', '#2980b9']);
  return {
    type: 'gift', box, ribbon, dots: rng.chance(0.3) ? rng.pick(COLORS.giftDots) : null, shiny: false, flip: false,
  };
}

// ---------- Trees ----------

function createOrnaments(rng) {
  return Array.from({ length: 9 }, () => {
    const layer = rng.integer(0, 3);
    const layerBase = -10 - layer * 22;
    const y = layerBase - 4 - rng.next() * 22;
    const halfWidth = (30 - layer * 7) * (1 - (layerBase - y) / 34) * 0.85;
    return { x: rng.range(-halfWidth, halfWidth), y, color: rng.pick(COLORS.ornaments) };
  });
}

function createTree(rng, decoyRate) {
  const tree = {
    type: 'tree', green: rng.pick(COLORS.treeGreens), ornaments: createOrnaments(rng), star: '#f4d03f', flip: false,
  };
  if (rng.chance(decoyRate * 1.4)) tree.ornaments.forEach((ornament) => { ornament.color = T.goldOrnament; });
  else if (rng.chance(decoyRate * 1.2)) tree.star = T.redStar;
  return tree;
}

// ---------- Snowmen ----------

function createSnowman(rng, decoyRate) {
  const snowman = {
    type: 'snowman',
    scarf: rng.pick(COLORS.scarves),
    hasHat: rng.chance(0.75),
    hatBand: rng.pick(COLORS.snowmanBands),
    flip: rng.chance(0.5),
  };
  if (rng.chance(decoyRate * 2)) snowman.hatBand = T.snowmanBand;
  if (rng.chance(decoyRate * 1.5)) snowman.scarf = T.snowmanScarf;
  if (looksLikeLumi(snowman)) snowman.scarf = '#c0392b';
  return snowman;
}

// ---------- Mittens ----------

function createMitten(rng, decoyRate) {
  let color = rng.pick(COLORS.mittenColors);
  let cuff = rng.pick(COLORS.mittenCuffs);
  if (rng.chance(decoyRate * 2.5)) {
    color = T.lostMitten;
    cuff = rng.pick(['#2980b9', '#f1c40f', '#2c3e50']);
  }
  if (rng.chance(decoyRate * 1.5)) {
    cuff = T.lostMittenCuff;
    color = rng.pick(COLORS.blueishMittens);
  }
  return { type: 'mitten', color, cuff, rotation: rng.range(-0.9, 0.9), flip: rng.chance(0.5) };
}

const createLamp = () => ({ type: 'lamp', flip: false });

// ---------- Fillers: weighted mix of everything above ----------

const FILLER_MIX = [
  { weight: 52, create: createPassenger },
  { weight: 10, create: createReindeer },
  { weight: 13, create: createGift },
  { weight: 10, create: createTree },
  { weight: 6, create: createSnowman },
  { weight: 4, create: createLamp },
  { weight: 5, create: createMitten },
];
const FILLER_WEIGHT_TOTAL = FILLER_MIX.reduce((sum, entry) => sum + entry.weight, 0);

export function createFiller(rng, decoyRate) {
  let roll = rng.next() * FILLER_WEIGHT_TOTAL;
  const entry = FILLER_MIX.find((candidate) => (roll -= candidate.weight) < 0) ?? FILLER_MIX[0];
  return entry.create(rng, decoyRate);
}

/** A plain gift – used to replace scenery that would hide a target. */
export const createReplacementGift = createGift;

// ---------- Buildings ----------

export function createBuilding(rng) {
  const roll = rng.next();
  const wall = rng.pick(COLORS.walls);
  if (roll < 0.38) return { type: 'cafe', wall, awning: rng.pick(COLORS.awnings), sign: rng.pick(SIGNS.cafes), flip: false };
  if (roll < 0.72) return { type: 'house', wall, roof: rng.pick(COLORS.roofs), flip: false };
  return { type: 'kiosk', wall, sign: rng.pick(SIGNS.kiosks), flip: false };
}

// ---------- Targets ----------

const TARGET_FACTORIES = {
  elf: (rng) => ({
    type: 'person', coat: '#2e7d32', pants: '#7a3b16', mitten: '#d62828', skin: '#f6d5b8', hair: '#a0522d',
    glasses: true, waving: false, flip: rng.chance(0.5), hatStyle: 'pointy', hatColor: T.elfHat, hatTrim: null,
    bellColor: '#f1c40f', scarf: { ...T.elfScarf }, beard: false, belt: false,
  }),
  rudolf: (rng) => ({
    type: 'reindeer', fur: '#8d6e63', nose: T.rudolfNose, collar: null, noseGlows: true, flip: rng.chance(0.5),
  }),
  gift: () => ({ type: 'gift', box: T.goldBox, ribbon: T.goldRibbon, dots: null, shiny: true, flip: false }),
  santa: (rng) => ({
    type: 'person', coat: T.santaCoat, pants: '#2d3436', mitten: '#2d3436', skin: '#f2c9a0', hair: '#e6e6e6',
    glasses: false, waving: rng.chance(0.5), flip: rng.chance(0.5), hatStyle: 'santa', hatColor: T.santaCoat,
    hatTrim: '#ffffff', bellColor: '#ffffff', scarf: null, beard: true, belt: true,
  }),
  snowman: (rng) => ({
    type: 'snowman', scarf: T.snowmanScarf, hasHat: true, hatBand: T.snowmanBand, flip: rng.chance(0.5),
  }),
  tree: (rng) => ({
    type: 'tree',
    green: '#1e8449',
    ornaments: createOrnaments(rng).map((ornament) => ({ ...ornament, color: T.goldOrnament })),
    star: T.redStar,
    flip: false,
  }),
  mitten: (rng) => ({
    type: 'mitten', color: T.lostMitten, cuff: T.lostMittenCuff, rotation: rng.range(-0.6, 0.6), flip: rng.chance(0.5),
  }),
};

export function createTarget(rng, targetKey) {
  const create = TARGET_FACTORIES[targetKey];
  if (!create) throw new Error(`Tundmatu otsitav: ${targetKey}`);
  return { ...create(rng), targetKey };
}
