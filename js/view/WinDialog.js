// "Häid jõule!" dialog shown when all targets are found. For players it also uploads the result.

import { submitResult, isLeaderboardEnabled } from '../services/leaderboardApi.js';
import { copyWithFeedback } from '../utils/clipboard.js';
import { byId, hide, setMessage, show } from '../utils/dom.js';
import { formatDuration } from '../utils/format.js';
import { leaderboardHtml } from './leaderboard.js';

const PLAYER_BOARD_LIMIT = 10;

export class WinDialog {
  constructor(poller) {
    this.poller = poller;
    this.root = byId('winDialog');
    this.intro = byId('winIntro');
    this.time = byId('winTime');
    this.details = byId('winDetails');
    this.status = byId('submitStatus');
    this.board = byId('winLeaderboard');
    this.manualSection = byId('manualResult');
    this.resultCodeOutput = byId('resultCodeOutput');

    byId('copyResultButton').addEventListener('click', (event) => copyWithFeedback(this.resultCodeOutput.value, event.currentTarget));
    this.resultCodeOutput.addEventListener('focus', () => this.resultCodeOutput.select());
    byId('closeWinButton').addEventListener('click', () => this.close());
  }

  /**
   * @param {{timeMs, misses, hints}} summary
   * @param {{isRepeat?: boolean, upload?: {result, resultCode, signature}}} options upload only for players
   */
  open(summary, { isRepeat = false, upload = null } = {}) {
    this.intro.textContent = isRepeat ? 'Oled selle pildi juba lahendanud. Sinu aeg:' : 'Leidsid kõik üles ajaga';
    this.time.textContent = formatDuration(summary.timeMs);
    this.details.textContent = `Möödalaske: ${summary.misses} · vihjeid: ${summary.hints}`;
    this.status.textContent = '';
    this.board.replaceChildren();
    hide(this.manualSection);
    this.root.classList.add('is-open');

    if (upload) this.handleUpload(upload);
  }

  close() {
    this.root.classList.remove('is-open');
    this.poller.stop();
  }

  handleUpload({ result, resultCode, signature }) {
    this.resultCodeOutput.value = resultCode;
    if (!isLeaderboardEnabled()) {
      show(this.manualSection);
      return;
    }

    setMessage(this.status, 'Saadan tulemust…', 'info');
    submitResult({ ...result, signature })
      .then(({ alreadySaved, rows }) => {
        setMessage(this.status, alreadySaved ? 'Sinu tulemus on edetabelis ✓' : 'Tulemus saadetud ✓', 'ok');
        const options = { highlightName: result.name, limit: PLAYER_BOARD_LIMIT };
        this.board.innerHTML = leaderboardHtml(rows, options);
        this.poller.start(result.gameId, this.board, options);
      })
      .catch(() => {
        setMessage(this.status, 'Automaatne saatmine ebaõnnestus. Saada tulemuse kood adminile käsitsi.', 'error');
        show(this.manualSection);
      });
  }
}
