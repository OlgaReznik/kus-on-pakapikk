// All tunable settings of the game live here.

/**
 * Results backend URL: Google Apps Script web app (backend/Code.gs) or Power Automate HTTP trigger
 * for Excel (backend/ExcelScript.ts, see backend/EXCEL-SEADISTUS.md). Leave empty to use manual result codes only.
 */
export const LEADERBOARD_URL =
  'https://script.google.com/macros/s/AKfycbxTPgS8nIBSUWHQ1xYa4w5ad_dCJU2t35VjmxGfugFzWas1xaIvBWfMjn52pqjqBKAwbA/exec';

export const LEADERBOARD_REFRESH_MS = 10_000;

export const SECURITY = {
  /** cyrb53 hash (seed 7, base 36) of the admin password "QAClub2026". */
  adminPasswordHash: '1jjvbkju9h5',
  adminPasswordHashSeed: 7,
  /** Shared with Code.gs – used to sign result codes. */
  resultSecret: 'partel-qa-club-2026',
};

export const SCENE = {
  width: 1800,
  height: 1100,
  /** Canvas pixels per scene unit, keeps the picture sharp when zoomed. */
  resolution: 1.5,
  playArea: { top: 300, bottom: 1080, left: 30, right: 1770 },
  horizonY: 235,
};

export const PENALTY_SECONDS = { miss: 3, hint: 15 };

export const ZOOM = { min: 1, max: 4, buttonStep: 1.4, wheelStep: 1.15 };

export const TARGET = {
  /** Extra clickable margin around a target, in scene units. */
  hitPadding: 6,
  /** Fingers are less precise than a mouse, so taps get a bigger margin. */
  touchHitPadding: 14,
  /** Preferred minimum distances between targets; relaxed step by step if the picture is crowded. */
  spacingSteps: [380, 300, 230, 160, 0],
};

export const LEVEL_ORDER = ['kerge', 'keskmine', 'raske'];

export const LEVELS = {
  kerge: {
    label: 'Kerge',
    fillerCount: 110,
    decoyRate: 0.05,
    objectScale: 1.12,
    buildingCount: 4,
    targets: ['elf', 'rudolf', 'gift'],
  },
  keskmine: {
    label: 'Keskmine',
    fillerCount: 230,
    decoyRate: 0.13,
    objectScale: 1.0,
    buildingCount: 6,
    targets: ['elf', 'rudolf', 'gift', 'santa', 'snowman'],
  },
  raske: {
    label: 'Raske',
    fillerCount: 340,
    decoyRate: 0.22,
    objectScale: 0.88,
    buildingCount: 8,
    targets: ['elf', 'rudolf', 'gift', 'santa', 'snowman', 'tree', 'mitten', 'gingerbread', 'hat', 'nortal'],
  },
};

export const DEFAULT_LEVEL = 'keskmine';

/** Size of a target compared to the crowd around it. Below 1 makes it harder to spot. */
export const TARGET_SIZE = { nortal: 0.9 };

export const TARGET_INFO = {
  elf: { label: 'Päkapikk Pärtel', hint: 'roheline teravmüts + puna-valge triibuline sall' },
  rudolf: { label: 'Rudolf', hint: 'punase ninaga põhjapõder' },
  gift: { label: 'Kuldne kink', hint: 'kuldne kast punase lindiga' },
  santa: { label: 'Jõuluvana', hint: 'punane kasukas + jõuluvanamüts + valge habe' },
  snowman: { label: 'Lumememm Lumi', hint: 'kuldse paelaga kübar + sinine sall' },
  tree: { label: 'Kuldne kuusk', hint: 'ainult kuldsed ehted + punane täht' },
  mitten: { label: 'Kadunud kinnas', hint: 'sinine kinnas valge äärega' },
  gingerbread: { label: 'Piparkook', hint: 'punane kikilips + rohelised nööbid' },
  hat: { label: 'Päkapiku müts', hint: 'maas lebav roheline müts valge ääre ja kuldse kuljusega' },
  nortal: { label: 'Nortali töötaja', hint: 'tumesinine jope + rinnal roheline Nortali N + kaenla all sülearvuti' },
};

export const STORAGE_KEYS = {
  playerName: 'partel-nimi',
  adminSession: 'partel-admin',
  adminGame: 'partel-admin-mang',
  manualResults: 'partel-admin-tulemused',
  playerResultPrefix: 'partel-tulemus-',
};
