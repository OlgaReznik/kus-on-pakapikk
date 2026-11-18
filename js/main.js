// Entry point: wires the page together and handles the player and admin flows.

import { DEFAULT_LEVEL, SCENE, STORAGE_KEYS, TARGET } from './config.js';
import { renderScene } from './draw/sceneRenderer.js';
import { Game } from './game/Game.js';
import { isShortCodeSeed, parseGameCode, randomSeed, toShortCode } from './game/gameCode.js';
import { createResultCode, readResultCode } from './game/resultCode.js';
import { hitboxCenter } from './scene/hitbox.js';
import { adminSession, isCorrectAdminPassword } from './services/adminSession.js';
import { playerHistory, playerNameStore } from './services/playerHistory.js';
import { copyWithFeedback } from './utils/clipboard.js';
import { byId, hide, onEnter, show } from './utils/dom.js';
import { formatDuration } from './utils/format.js';
import { localStore } from './utils/storage.js';
import { LeaderboardPoller } from './view/leaderboard.js';
import { OverlayRenderer } from './view/OverlayRenderer.js';
import { ResultsDialog } from './view/ResultsDialog.js';
import { TargetCards } from './view/targetCards.js';
import { Viewport } from './view/Viewport.js';
import { WinDialog } from './view/WinDialog.js';

const WIN_DIALOG_DELAY_MS = 900;

const ui = {
  sceneCanvas: byId('sceneCanvas'),
  overlayCanvas: byId('overlayCanvas'),
  timeValue: byId('timeValue'),
  missValue: byId('missValue'),
  levelSelect: byId('levelSelect'),
  solutionButton: byId('solutionButton'),
  gameCodeValue: byId('gameCodeValue'),
  playerNameValue: byId('playerNameValue'),
  startScreen: byId('startScreen'),
  loginScreen: byId('loginScreen'),
  nameInput: byId('nameInput'),
  codeInput: byId('codeInput'),
  startError: byId('startError'),
  passwordInput: byId('passwordInput'),
  loginError: byId('loginError'),
};

const state = {
  /** @type {'player' | 'admin' | null} */
  role: null,
  playerName: '',
  /** @type {Game | null} */
  game: null,
};

const poller = new LeaderboardPoller();
const overlay = new OverlayRenderer(ui.overlayCanvas);
const targetCards = new TargetCards(byId('targetCards'));
const viewport = new Viewport(byId('viewport'), byId('stage'), handleSceneClick);
const winDialog = new WinDialog(poller);
const resultsDialog = new ResultsDialog(poller, () => state.game);

// ---------- Game lifecycle ----------

function loadGame(levelKey, seed) {
  state.game = new Game(levelKey, seed);
  renderScene(ui.sceneCanvas, state.game.scene);
  targetCards.render(state.game.targets);
  overlay.attach(state.game);

  ui.levelSelect.value = levelKey;
  ui.gameCodeValue.textContent = state.game.shortCode;
  ui.missValue.textContent = '0';
  ui.solutionButton.textContent = 'Näita lahendust';
  winDialog.close();
  viewport.reset();
  if (state.role === 'admin') localStore.set(STORAGE_KEYS.adminGame, state.game.id);
}

function handleSceneClick(x, y, { isTouch }) {
  if (!state.game || !state.role) return;
  const padding = isTouch ? TARGET.touchHitPadding : TARGET.hitPadding;
  const outcome = state.game.click(x, y, { padding });

  if (outcome.kind === 'miss') {
    overlay.markMiss(x, y);
    ui.missValue.textContent = String(state.game.misses);
  }
  if (outcome.kind === 'found') {
    overlay.markFound(outcome.target);
    targetCards.markFound(outcome.target.targetKey);
    if (state.game.isFinished) handleFinished();
  }
}

function handleFinished() {
  const { game } = state;
  const summary = { timeMs: game.elapsedMs(), misses: game.misses, hints: game.hints };
  const upload = state.role === 'player' ? savePlayerResult(game) : null;
  setTimeout(() => winDialog.open(summary, { upload }), WIN_DIALOG_DELAY_MS);
}

function savePlayerResult(game) {
  const result = game.toResult(state.playerName);
  const resultCode = createResultCode(result);
  playerHistory.save(game.id, state.playerName, { ...result, resultCode });
  return { result, resultCode, signature: readResultCode(resultCode).signature };
}

function showHint() {
  const hint = state.game?.requestHint();
  if (hint) viewport.centerOn(hint.x, hint.y);
}

// ---------- Player flow ----------

function startAsPlayer() {
  const name = ui.nameInput.value.trim();
  const game = parseGameCode(ui.codeInput.value);
  if (!name) {
    ui.startError.textContent = 'Sisesta oma nimi.';
    return;
  }
  if (!game) {
    ui.startError.textContent = 'Kood peab olema 5-kohaline number (nt 24813). Küsi õiget koodi adminilt.';
    return;
  }

  ui.startError.textContent = '';
  playerNameStore.set(name);
  state.role = 'player';
  state.playerName = name;
  document.body.classList.remove('is-admin');
  ui.playerNameValue.textContent = name;
  hide(ui.startScreen);

  loadGame(game.levelKey, game.seed);
  showPreviousResultIfAny();
}

/** A player who already solved this picture sees their earlier result instead of a fresh clock. */
function showPreviousResultIfAny() {
  const { game } = state;
  const previous = playerHistory.find(game.id, state.playerName);
  if (!previous?.resultCode) return;

  game.restoreFinished(previous);
  targetCards.markAllFound();
  overlay.markAllFound(game.targets);
  const parsed = readResultCode(previous.resultCode);
  winDialog.open(previous, {
    isRepeat: true,
    upload: { result: previous, resultCode: previous.resultCode, signature: parsed?.signature },
  });
}

// ---------- Admin flow ----------

function showLogin() {
  hide(ui.startScreen);
  show(ui.loginScreen);
  ui.passwordInput.focus();
}

function showStart() {
  hide(ui.loginScreen);
  show(ui.startScreen);
}

function login() {
  if (!isCorrectAdminPassword(ui.passwordInput.value)) {
    ui.loginError.textContent = 'Vale parool.';
    return;
  }
  ui.loginError.textContent = '';
  ui.passwordInput.value = '';
  adminSession.start();
  enterAdminMode();
}

function enterAdminMode() {
  state.role = 'admin';
  document.body.classList.add('is-admin');
  hide(ui.loginScreen);
  hide(ui.startScreen);

  const lastGame = parseGameCode(localStore.get(STORAGE_KEYS.adminGame));
  if (lastGame && isShortCodeSeed(lastGame.seed)) loadGame(lastGame.levelKey, lastGame.seed);
  else loadGame(lastGame?.levelKey ?? DEFAULT_LEVEL, randomSeed());
}

function logout() {
  adminSession.end();
  state.role = null;
  document.body.classList.remove('is-admin');
  resultsDialog.close();
  winDialog.close();
  show(ui.startScreen);
}

function toggleSolution() {
  overlay.showSolution = !overlay.showSolution;
  ui.solutionButton.textContent = overlay.showSolution ? 'Peida lahendus' : 'Näita lahendust';
}

// ---------- Animation loop ----------

let lastShownSecond = -1;

function animate(now) {
  overlay.draw(now);
  if (state.game && state.role) {
    const elapsed = state.game.elapsedMs(now);
    const second = Math.floor(elapsed / 1000);
    if (second !== lastShownSecond) {
      lastShownSecond = second;
      ui.timeValue.textContent = formatDuration(elapsed);
    }
  }
  requestAnimationFrame(animate);
}

// ---------- Wiring ----------

function bindControls() {
  byId('startButton').addEventListener('click', startAsPlayer);
  onEnter(ui.nameInput, startAsPlayer);
  onEnter(ui.codeInput, startAsPlayer);
  byId('showLoginButton').addEventListener('click', showLogin);
  byId('showStartButton').addEventListener('click', showStart);
  byId('loginButton').addEventListener('click', login);
  onEnter(ui.passwordInput, login);
  byId('logoutButton').addEventListener('click', logout);

  byId('hintButton').addEventListener('click', showHint);
  byId('zoomInButton').addEventListener('click', () => viewport.zoomIn());
  byId('zoomOutButton').addEventListener('click', () => viewport.zoomOut());

  byId('newPictureButton').addEventListener('click', () => loadGame(ui.levelSelect.value, randomSeed()));
  ui.levelSelect.addEventListener('change', () => loadGame(ui.levelSelect.value, randomSeed()));
  ui.solutionButton.addEventListener('click', toggleSolution);
  byId('resultsButton').addEventListener('click', () => resultsDialog.open());
  byId('copyGameCodeButton').addEventListener('click', (event) => copyWithFeedback(state.game.shortCode, event.currentTarget));
}

function prefillStartScreen() {
  ui.nameInput.value = playerNameStore.get();
  const gameFromLink = parseGameCode(window.location.hash.slice(1));
  if (gameFromLink) ui.codeInput.value = toShortCode(gameFromLink.id);
  (ui.nameInput.value ? ui.codeInput : ui.nameInput).focus();
}

function init() {
  ui.sceneCanvas.width = ui.overlayCanvas.width = SCENE.width * SCENE.resolution;
  ui.sceneCanvas.height = ui.overlayCanvas.height = SCENE.height * SCENE.resolution;
  bindControls();
  viewport.reset();
  requestAnimationFrame(animate);

  if (adminSession.isActive()) enterAdminMode();
  else prefillStartScreen();
}

document.fonts?.ready.then(init) ?? init();
