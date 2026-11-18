// Signed result codes ("PARTEL.<data>.<signature>") – used for the automatic upload and as a manual fallback.

import { SECURITY } from '../config.js';
import { decodeBase64, encodeBase64 } from '../utils/format.js';
import { hashToString } from '../utils/hash.js';

const PREFIX = 'PARTEL';
const RESULT_CODE = /^PARTEL\.([A-Za-z0-9+/]+)\.([a-z0-9]+)$/;
export const RESULT_CODE_IN_TEXT = /PARTEL\.[A-Za-z0-9+/]+\.[a-z0-9]+/g;

const serialize = (result) => JSON.stringify([result.name, result.gameId, result.timeMs, result.misses, result.hints]);
const sign = (payload) => hashToString(payload + SECURITY.resultSecret);

/** @param {{name: string, gameId: string, timeMs: number, misses: number, hints: number}} result */
export function createResultCode(result) {
  const payload = serialize({ ...result, timeMs: Math.round(result.timeMs) });
  return `${PREFIX}.${encodeBase64(payload)}.${sign(payload)}`;
}

export function readResultCode(code) {
  const match = String(code).match(RESULT_CODE);
  if (!match) return null;
  try {
    const payload = decodeBase64(match[1]);
    const [name, gameId, timeMs, misses, hints] = JSON.parse(payload);
    return {
      name, gameId, timeMs, misses, hints, signature: match[2], isValid: sign(payload) === match[2], code,
    };
  } catch {
    return null;
  }
}

export const findResultCodes = (text) => (String(text).match(RESULT_CODE_IN_TEXT) ?? []).map(readResultCode).filter(Boolean);
