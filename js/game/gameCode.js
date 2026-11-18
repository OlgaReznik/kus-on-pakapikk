// Game codes.
//
// Players see a 5-digit code: first digit = level (1 kerge, 2 keskmine, 3 raske), the other four = picture.
// Internally (and in Google Sheets) a game is stored as "<level>-<seed>", e.g. "keskmine-4813".

import { LEVEL_ORDER } from '../config.js';
import { unseededRandom } from '../utils/random.js';

const MIN_SEED = 1000;
const MAX_SEED = 9999;
const SHORT_CODE = /^([1-9])(\d{4})$/;
const LONG_CODE = /^([a-z]+)-(\d{1,9})$/;

const isKnownLevel = (levelKey) => LEVEL_ORDER.includes(levelKey);
const toGame = (levelKey, seed) => ({ levelKey, seed, id: `${levelKey}-${seed}` });

export const randomSeed = () => unseededRandom.integer(MIN_SEED, MAX_SEED + 1);

export const isShortCodeSeed = (seed) => seed >= MIN_SEED && seed <= MAX_SEED;

/** Accepts "24813", "2 48 13" or the internal "keskmine-4813". Returns null when the code is invalid. */
export function parseGameCode(input) {
  const text = String(input ?? '').toLowerCase().replace(/\s+/g, '');

  const short = text.match(SHORT_CODE);
  if (short) {
    const levelKey = LEVEL_ORDER[Number(short[1]) - 1];
    return levelKey ? toGame(levelKey, Number(short[2])) : null;
  }

  const long = text.match(LONG_CODE);
  if (long && isKnownLevel(long[1])) return toGame(long[1], Number(long[2]));
  return null;
}

/** "keskmine-4813" → "24813". */
export function toShortCode(gameId) {
  const game = parseGameCode(gameId);
  if (!game || !isShortCodeSeed(game.seed)) return gameId;
  return `${LEVEL_ORDER.indexOf(game.levelKey) + 1}${game.seed}`;
}
