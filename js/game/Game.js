// Game rules and state, without any DOM code.

import { PENALTY_SECONDS, TARGET } from '../config.js';
import { generateScene } from '../scene/sceneGenerator.js';
import { containsPoint, hitboxCenter } from '../scene/hitbox.js';
import { toShortCode } from './gameCode.js';

const HINT = { radius: 170, maxOffset: 90 };

export class Game {
  constructor(levelKey, seed, now = performance.now()) {
    this.scene = generateScene(levelKey, seed);
    this.levelKey = levelKey;
    this.seed = seed;
    this.id = `${levelKey}-${seed}`;
    this.shortCode = toShortCode(this.id);
    this.startedAt = now;
    this.finishedAt = null;
    this.misses = 0;
    this.hints = 0;
    this.penaltySeconds = 0;
    this.foundKeys = new Set();
    this.activeHints = [];
  }

  get targets() { return this.scene.targets; }

  get isFinished() { return this.finishedAt !== null; }

  elapsedMs(now = performance.now()) {
    const end = this.finishedAt ?? now;
    return end - this.startedAt + this.penaltySeconds * 1000;
  }

  isFound(target) { return this.foundKeys.has(target.targetKey); }

  /**
   * Handles a click at scene coordinates.
   * @param {{padding?: number, now?: number}} options padding = extra clickable margin around targets
   * @returns {{kind: 'found', target} | {kind: 'miss'} | {kind: 'ignored'}}
   */
  click(x, y, { padding = TARGET.hitPadding, now = performance.now() } = {}) {
    if (this.isFinished) return { kind: 'ignored' };

    const target = this.targets.find((candidate) => containsPoint(candidate.hitbox, x, y, padding));
    if (target) {
      if (this.isFound(target)) return { kind: 'ignored' };
      this.foundKeys.add(target.targetKey);
      this.activeHints = this.activeHints.filter((hint) => hint.target !== target);
      if (this.foundKeys.size === this.targets.length) this.finishedAt = now;
      return { kind: 'found', target };
    }

    this.misses += 1;
    this.penaltySeconds += PENALTY_SECONDS.miss;
    return { kind: 'miss' };
  }

  /** Shows a circle around an area that contains an unfound target. Returns null if nothing is left. */
  requestHint(random = Math.random) {
    if (this.isFinished) return null;
    const unfound = this.targets.filter((target) => !this.isFound(target));
    const target = unfound.find((candidate) => !this.activeHints.some((hint) => hint.target === candidate)) ?? unfound[0];
    if (!target) return null;

    this.hints += 1;
    this.penaltySeconds += PENALTY_SECONDS.hint;

    const center = hitboxCenter(target.hitbox);
    const angle = random() * Math.PI * 2;
    const offset = random() * HINT.maxOffset;
    const hint = {
      target,
      x: center.x + Math.cos(angle) * offset,
      y: center.y + Math.sin(angle) * offset,
      radius: HINT.radius,
      createdAt: performance.now(),
    };
    this.activeHints = [...this.activeHints.filter((existing) => existing.target !== target), hint];
    return hint;
  }

  /** Restores a game this player already finished earlier. */
  restoreFinished(result) {
    this.targets.forEach((target) => this.foundKeys.add(target.targetKey));
    this.misses = result.misses;
    this.hints = result.hints;
    this.penaltySeconds = 0;
    this.finishedAt = this.startedAt + result.timeMs;
  }

  toResult(playerName) {
    return {
      name: playerName, gameId: this.id, timeMs: Math.round(this.elapsedMs()), misses: this.misses, hints: this.hints,
    };
  }
}
