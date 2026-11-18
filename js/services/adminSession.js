import { SECURITY, STORAGE_KEYS } from '../config.js';
import { hashToString } from '../utils/hash.js';
import { sessionStore } from '../utils/storage.js';

export const isCorrectAdminPassword = (password) =>
  hashToString(password, SECURITY.adminPasswordHashSeed) === SECURITY.adminPasswordHash;

export const adminSession = {
  isActive: () => sessionStore.get(STORAGE_KEYS.adminSession) === '1',
  start: () => sessionStore.set(STORAGE_KEYS.adminSession, '1'),
  end: () => sessionStore.remove(STORAGE_KEYS.adminSession),
};
