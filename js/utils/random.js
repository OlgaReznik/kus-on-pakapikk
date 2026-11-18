// Seeded random numbers, so the same game code always draws the same picture.

function mulberry32(seed) {
  let state = seed | 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wrap(next) {
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    integer: (min, maxExclusive) => min + Math.floor(next() * (maxExclusive - min)),
    chance: (probability) => next() < probability,
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffleInPlace(items) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    },
  };
}

export const createSeededRandom = (seed) => wrap(mulberry32(seed));
export const unseededRandom = wrap(Math.random);
