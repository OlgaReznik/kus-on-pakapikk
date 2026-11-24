// Builds a complete picture for a level and seed. Same level + seed → same picture for every player.
//
// The play area is divided into a grid. Buildings, targets and fillers each take grid cells,
// and every object gets a little random jitter so the grid doesn't show.

import { LEVELS, SCENE, TARGET, TARGET_SIZE } from '../config.js';
import { createSeededRandom } from '../utils/random.js';
import { createBackground } from './background.js';
import { getHitbox } from './hitbox.js';
import {
  createBuilding, createFiller, createReplacementGift, createTarget,
} from './objectFactory.js';

const CELLS_PER_BUILDING = 10;
const SPARE_CELLS = 8;
const CELL_JITTER = 0.38;
const BUILDING_SIZE_BOOST = 1.3;
const OCCLUDING_TYPES = new Set(['tree', 'snowman', 'lamp']);

// ---------- Grid ----------

function createGrid(rng, level) {
  const { top, bottom, left, right } = SCENE.playArea;
  const width = right - left;
  const height = bottom - top;
  const neededCells = level.fillerCount + level.buildingCount * CELLS_PER_BUILDING + SPARE_CELLS;
  const columns = Math.max(4, Math.round(width / Math.sqrt((width * height) / neededCells)));
  const rows = Math.ceil(neededCells / columns);

  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) cells.push({ row, column, taken: false });
  }
  rng.shuffleInPlace(cells);

  return {
    cells,
    columns,
    rows,
    cellWidth: width / columns,
    cellHeight: height / rows,
    at(row, column) {
      return cells.find((cell) => cell.row === row && cell.column === column);
    },
    jitteredPosition(cell) {
      return {
        x: left + (cell.column + 0.5 + rng.range(-CELL_JITTER, CELL_JITTER)) * this.cellWidth,
        y: top + (cell.row + 0.5 + rng.range(-CELL_JITTER, CELL_JITTER)) * this.cellHeight,
      };
    },
  };
}

const isInnerCell = (grid, cell) => cell.row >= 1 && cell.column >= 1 && cell.column <= grid.columns - 2;

// ---------- Placement steps ----------

/** Buildings reserve the cells behind them, so nothing important can hide there. */
function placeBuildings(rng, grid, count) {
  const blocked = new Set();
  const key = (row, column) => `${row},${column}`;
  const buildings = [];

  for (const cell of grid.cells) {
    if (buildings.length >= count) break;
    if (cell.row < 2 || !isInnerCell(grid, cell)) continue;

    const surroundings = [];
    for (let dRow = -3; dRow <= 1; dRow++) {
      for (let dColumn = -2; dColumn <= 2; dColumn++) surroundings.push(key(cell.row + dRow, cell.column + dColumn));
    }
    if (surroundings.some((cellKey) => blocked.has(cellKey))) continue;

    for (let dRow = -2; dRow <= 0; dRow++) {
      for (let dColumn = -1; dColumn <= 1; dColumn++) {
        blocked.add(key(cell.row + dRow, cell.column + dColumn));
        const covered = grid.at(cell.row + dRow, cell.column + dColumn);
        if (covered) covered.taken = true;
      }
    }

    const { left, top } = SCENE.playArea;
    buildings.push({
      ...createBuilding(rng),
      x: left + (cell.column + 0.5) * grid.cellWidth,
      y: top + (cell.row + 0.8) * grid.cellHeight,
      isBuilding: true,
    });
  }
  return buildings;
}

function findTargetCell(grid, placedTargets, minDistance) {
  for (const cell of grid.cells) {
    if (cell.taken || !isInnerCell(grid, cell)) continue;
    const position = grid.jitteredPosition(cell);
    const tooClose = placedTargets.some((target) => Math.hypot(target.x - position.x, target.y - position.y) < minDistance);
    if (!tooClose) return { cell, position };
  }
  return null;
}

function placeTargets(rng, grid, targetKeys) {
  const targets = [];
  for (const targetKey of targetKeys) {
    const target = createTarget(rng, targetKey);
    for (const minDistance of TARGET.spacingSteps) {
      const spot = findTargetCell(grid, targets, minDistance);
      if (!spot) continue;
      spot.cell.taken = true;
      targets.push({ ...target, ...spot.position });
      break;
    }
  }
  return targets;
}

function placeFillers(rng, grid, level) {
  const fillers = [];
  for (const cell of grid.cells) {
    if (fillers.length >= level.fillerCount) break;
    if (cell.taken) continue;
    cell.taken = true;
    fillers.push({ ...createFiller(rng, level.decoyRate), ...grid.jitteredPosition(cell) });
  }
  return fillers;
}

/** Things further back (higher up) are drawn smaller. */
function applyPerspective(rng, objects, level) {
  const { top, bottom } = SCENE.playArea;
  objects.forEach((object) => {
    const depthScale = 0.74 + (0.5 * (object.y - top)) / (bottom - top);
    const variation = object.targetKey ? (TARGET_SIZE[object.targetKey] ?? 1) : rng.range(0.93, 1.07);
    const boost = object.isBuilding ? BUILDING_SIZE_BOOST : 1;
    object.scale = depthScale * variation * level.objectScale * boost;
  });
}

/** Makes sure no tree, snowman or person in front of a target hides it completely. */
function keepTargetsVisible(rng, objects, targets, level) {
  targets.forEach((target) => {
    objects.forEach((object, index) => {
      if (object === target || object.targetKey || object.isBuilding) return;
      const dx = object.x - target.x;
      const dy = object.y - target.y;
      const standsInFront = dy > 0;

      if (standsInFront && dy < 120 && Math.abs(dx) < 55 && OCCLUDING_TYPES.has(object.type)) {
        objects[index] = { ...createReplacementGift(rng, level.decoyRate), x: object.x, y: object.y, scale: object.scale };
      }
      if (standsInFront && dy < 45 && Math.abs(dx) < 30) {
        objects[index].x += (dx >= 0 ? 1 : -1) * (32 - Math.abs(dx));
      }
    });
  });
}

// ---------- Public API ----------

export function generateScene(levelKey, seed) {
  const level = LEVELS[levelKey];
  if (!level) throw new Error(`Tundmatu tase: ${levelKey}`);

  const rng = createSeededRandom(seed);
  const background = createBackground(rng);
  const grid = createGrid(rng, level);

  const buildings = placeBuildings(rng, grid, level.buildingCount);
  const targets = placeTargets(rng, grid, level.targets);
  const fillers = placeFillers(rng, grid, level);

  const objects = [...buildings, ...targets, ...fillers];
  applyPerspective(rng, objects, level);
  keepTargetsVisible(rng, objects, targets, level);
  objects.sort((a, b) => a.y - b.y);

  targets.forEach((target) => { target.hitbox = getHitbox(target); });
  return { levelKey, seed, background, objects, targets };
}
