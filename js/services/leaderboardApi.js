// Talks to the results backend: Google Apps Script (backend/Code.gs)
// or Power Automate + Office Script for Excel (backend/ExcelScript.ts).
// Field names (action, name, code, ms, misses, hints, sig) must match the backend.
// Every request is a POST with a text/plain body: it avoids a CORS pre-flight request
// and works with both backends (a Power Automate URL cannot take extra query parameters).

import { LEADERBOARD_URL } from '../config.js';

export const isLeaderboardEnabled = () => Boolean(LEADERBOARD_URL);

const toRow = (row) => ({ name: row.name, timeMs: row.ms, misses: row.misses, hints: row.hints });

async function readJson(response) {
  if (!response.ok) throw new Error(`Server vastas: ${response.status}`);
  const data = await response.json();
  if (!data?.ok) throw new Error(data?.status ?? 'tundmatu viga');
  return data;
}

const post = (body) => fetch(LEADERBOARD_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify(body),
});

/**
 * @param {{name: string, gameId: string, timeMs: number, misses: number, hints: number, signature: string}} result
 * @returns {Promise<{alreadySaved: boolean, rows: Array}>}
 */
export async function submitResult(result) {
  const response = await post({
    action: 'submit',
    name: result.name,
    code: result.gameId,
    ms: Math.round(result.timeMs),
    misses: result.misses,
    hints: result.hints,
    sig: result.signature,
  });
  const data = await readJson(response);
  return { alreadySaved: data.status === 'exists', rows: (data.rows ?? []).map(toRow) };
}

export async function fetchLeaderboard(gameId) {
  const data = await readJson(await post({ action: 'list', code: gameId }));
  return (data.rows ?? []).map(toRow);
}
