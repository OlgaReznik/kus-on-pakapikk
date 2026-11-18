// Admin view: live leaderboard from Google Sheets + manually pasted result codes.

import { STORAGE_KEYS } from '../config.js';
import { toShortCode } from '../game/gameCode.js';
import { findResultCodes } from '../game/resultCode.js';
import { isLeaderboardEnabled } from '../services/leaderboardApi.js';
import { copyWithFeedback } from '../utils/clipboard.js';
import { byId, hide, setVisible, show } from '../utils/dom.js';
import { escapeHtml, formatDuration } from '../utils/format.js';
import { localStore } from '../utils/storage.js';

const ADMIN_BOARD_LIMIT = 50;
const CLEAR_CONFIRM_MS = 3000;

const loadManualResults = () => localStore.getJson(STORAGE_KEYS.manualResults, []);
const saveManualResults = (results) => localStore.setJson(STORAGE_KEYS.manualResults, results);
const isSamePlayer = (a, b) => a.name.toLowerCase() === b.name.toLowerCase() && a.gameId === b.gameId;

/** Adds new codes; a valid code may replace an invalid one, never the other way round. */
function mergeResults(existing, incoming) {
  const merged = [...existing];
  let added = 0;
  let updated = 0;
  incoming.forEach((result) => {
    const index = merged.findIndex((saved) => isSamePlayer(saved, result));
    if (index < 0) {
      merged.push(result);
      added += 1;
    } else if (merged[index].code !== result.code && (result.isValid || !merged[index].isValid)) {
      merged[index] = result;
      updated += 1;
    }
  });
  return { merged, added, updated };
}

function splitByStatus(results, currentGameId) {
  const ranked = results.filter((r) => r.isValid && r.gameId === currentGameId).sort((a, b) => a.timeMs - b.timeMs);
  const others = results.filter((r) => !(r.isValid && r.gameId === currentGameId));
  return { ranked, others };
}

function resultRowHtml(result, place, statusHtml, cssClass = '') {
  return `<tr class="${cssClass}"><td>${place}</td><td>${escapeHtml(result.name)}</td>`
    + `<td class="num">${formatDuration(result.timeMs)}</td><td class="num">${result.misses}</td>`
    + `<td class="num">${result.hints}</td><td>${escapeHtml(toShortCode(result.gameId))}</td><td>${statusHtml}</td></tr>`;
}

export class ResultsDialog {
  /**
   * @param {LeaderboardPoller} poller
   * @param {() => import('../game/Game.js').Game} getGame
   */
  constructor(poller, getGame) {
    this.poller = poller;
    this.getGame = getGame;
    this.root = byId('resultsScreen');
    this.liveSection = byId('liveSection');
    this.liveGameCode = byId('liveGameCode');
    this.liveBoard = byId('liveLeaderboard');
    this.input = byId('resultCodesInput');
    this.message = byId('resultsMessage');
    this.table = byId('manualResultsTable');
    this.clearButton = byId('clearResultsButton');
    this.clearArmed = false;

    byId('refreshLiveButton').addEventListener('click', () => this.startLiveBoard());
    byId('addResultsButton').addEventListener('click', () => this.addPastedResults());
    byId('copyTableButton').addEventListener('click', (event) => copyWithFeedback(this.rankingAsText(), event.currentTarget));
    this.clearButton.addEventListener('click', () => this.clearWithConfirmation());
    byId('closeResultsButton').addEventListener('click', () => this.close());
  }

  open() {
    this.message.textContent = '';
    this.renderManualTable();
    setVisible(this.liveSection, isLeaderboardEnabled());
    if (isLeaderboardEnabled()) this.startLiveBoard();
    show(this.root);
  }

  close() {
    hide(this.root);
    this.poller.stop();
  }

  startLiveBoard() {
    const game = this.getGame();
    this.liveGameCode.textContent = game.shortCode;
    this.liveBoard.innerHTML = '<p>Laen…</p>';
    this.poller.start(game.id, this.liveBoard, { limit: ADMIN_BOARD_LIMIT });
  }

  addPastedResults() {
    const pasted = findResultCodes(this.input.value);
    const { merged, added, updated } = mergeResults(loadManualResults(), pasted);
    saveManualResults(merged);
    this.input.value = '';
    this.message.textContent = pasted.length
      ? `Lisatud ${added}${updated ? `, uuendatud ${updated}` : ''}.`
      : 'Ühtegi tulemuse koodi ei leitud.';
    this.renderManualTable();
  }

  clearWithConfirmation() {
    if (!this.clearArmed) {
      this.clearArmed = true;
      this.clearButton.textContent = 'Kindel? Vajuta uuesti';
      setTimeout(() => this.disarmClear(), CLEAR_CONFIRM_MS);
      return;
    }
    saveManualResults([]);
    this.disarmClear();
    this.message.textContent = 'Tulemused kustutatud.';
    this.renderManualTable();
  }

  disarmClear() {
    this.clearArmed = false;
    this.clearButton.textContent = 'Tühjenda';
  }

  rankingAsText() {
    const { ranked } = splitByStatus(loadManualResults(), this.getGame().id);
    if (!ranked.length) return 'Tulemusi pole';
    return ranked
      .map((r, i) => `${i + 1}. ${r.name} – ${formatDuration(r.timeMs)} (mööda ${r.misses}, vihjeid ${r.hints})`)
      .join('\n');
  }

  renderManualTable() {
    const currentGame = this.getGame();
    const { ranked, others } = splitByStatus(loadManualResults(), currentGame.id);
    if (!ranked.length && !others.length) {
      this.table.innerHTML = isLeaderboardEnabled() ? '' : '<p>Tulemusi veel pole.</p>';
      return;
    }

    const rows = [
      ...ranked.map((r, i) => resultRowHtml(r, `${i + 1}.`, '<span class="status-ok">kehtiv</span>', i === 0 ? 'is-first' : '')),
      ...others.map((r) => resultRowHtml(r, '–', r.isValid
        ? '<span class="status-other">teine pilt</span>'
        : '<span class="status-bad">võltsitud kood</span>')),
    ];
    this.table.innerHTML = '<table><thead><tr><th>Koht</th><th>Nimi</th><th>Aeg</th><th>Mööda</th><th>Vihjed</th>'
      + `<th>Pilt</th><th>Staatus</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
      + `<p class="hint-text">Paremusjärjestuses on praeguse pildi (${escapeHtml(currentGame.shortCode)}) kehtivad tulemused.</p>`;
  }
}
