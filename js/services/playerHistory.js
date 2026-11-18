// Remembers in this browser which pictures a player has already solved, so a reload can't restart the clock.

import { STORAGE_KEYS } from '../config.js';
import { localStore } from '../utils/storage.js';

const keyFor = (gameId, playerName) => `${STORAGE_KEYS.playerResultPrefix}${gameId}-${playerName.toLowerCase()}`;

export const playerHistory = {
  /** @returns {{timeMs, misses, hints, resultCode} | null} */
  find(gameId, playerName) {
    return localStore.getJson(keyFor(gameId, playerName), null);
  },
  save(gameId, playerName, record) {
    localStore.setJson(keyFor(gameId, playerName), record);
  },
};

export const playerNameStore = {
  get: () => localStore.get(STORAGE_KEYS.playerName) ?? '',
  set: (name) => localStore.set(STORAGE_KEYS.playerName, name),
};
