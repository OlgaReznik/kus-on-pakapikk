// Talks to the Google Apps Script web app (see Code.gs).
// Field names (name, code, ms, misses, hints, sig) must match Code.gs.

import { LEADERBOARD_URL } from '../config.js';

export const isLeaderboardEnabled = () => Boolean(LEADERBOARD_URL);

const toRow = (row) => ({ name: row.name, timeMs: row.ms, misses: row.misses, hints: row.hints });

async function readJson(response) {
  if (!response.ok) throw new Error(`Server vastas: ${response.status}`);
  const data = await response.json();
  if (!data?.ok) throw new Error(data?.status ?? 'tundmatu viga');
  return data;
}

/**
 * @param {{name: string, gameId: string, timeMs: number, misses: number, hints: number, signature: string}} result
 * @returns {Promise<{alreadySaved: boolean, rows: Array}>}
 */
export async function submitResult(result) {
  // text/plain avoids a CORS pre-flight request, which Apps Script does not support.
  const response = await fetch(LEADERBOARD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      name: result.name,
      code: result.gameId,
      ms: Math.round(result.timeMs),
      misses: result.misses,
      hints: result.hints,
      sig: result.signature,
    }),
  });
  const data = await readJson(response);
  return { alreadySaved: data.status === 'exists', rows: (data.rows ?? []).map(toRow) };
}

export async function fetchLeaderboard(gameId) {
  const url = `${LEADERBOARD_URL}?code=${encodeURIComponent(gameId)}&t=${Date.now()}`;
  const data = await readJson(await fetch(url));
  return (data.rows ?? []).map(toRow);
}
