// Leaderboard table and its periodic refresh.

import { LEADERBOARD_REFRESH_MS } from '../config.js';
import { fetchLeaderboard } from '../services/leaderboardApi.js';
import { escapeHtml, formatDuration } from '../utils/format.js';

function rowHtml(row, place, cssClass) {
  return `<tr class="${cssClass}"><td>${place}.</td><td>${escapeHtml(row.name)}</td>`
    + `<td class="num">${formatDuration(row.timeMs)}</td><td class="num">${row.misses}</td>`
    + `<td class="num">${row.hints}</td></tr>`;
}

/**
 * @param {Array<{name, timeMs, misses, hints}>} rows sorted fastest first
 * @param {{highlightName?: string, limit?: number}} options
 */
export function leaderboardHtml(rows, { highlightName = null, limit = 10 } = {}) {
  if (!rows.length) return '<p>Selle pildi tulemusi veel pole.</p>';

  const myIndex = highlightName ? rows.findIndex((row) => row.name.toLowerCase() === highlightName.toLowerCase()) : -1;
  const cssClassFor = (index) => {
    if (index === myIndex) return 'is-me';
    return index === 0 ? 'is-first' : '';
  };

  const visibleRows = rows.slice(0, limit).map((row, index) => rowHtml(row, index + 1, cssClassFor(index)));
  if (myIndex >= limit) {
    visibleRows.push('<tr><td colspan="5">…</td></tr>', rowHtml(rows[myIndex], myIndex + 1, 'is-me'));
  }

  const total = rows.length > limit ? `<p class="hint-text">Kokku ${rows.length} mängijat.</p>` : '';
  return '<table><thead><tr><th>Koht</th><th>Nimi</th><th>Aeg</th><th>Mööda</th><th>Vihjed</th></tr></thead>'
    + `<tbody>${visibleRows.join('')}</tbody></table>${total}`;
}

/** Keeps one leaderboard element up to date. Only one poller should run at a time. */
export class LeaderboardPoller {
  constructor() {
    this.timer = null;
  }

  start(gameId, element, options) {
    this.stop();
    const refresh = () => fetchLeaderboard(gameId)
      .then((rows) => { element.innerHTML = leaderboardHtml(rows, options); })
      .catch(() => { /* keep the last table; the next refresh will try again */ });
    refresh();
    this.timer = setInterval(refresh, LEADERBOARD_REFRESH_MS);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }
}
