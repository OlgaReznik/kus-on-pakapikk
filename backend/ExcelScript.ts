// "Kus on päkapikk Pärtel?" – tulemuste ja edetabeli taustarakendus Exceli (OneDrive) jaoks.
// See on Office Script: Excel veebis → Automatiseeri (Automate) → Uus skript, kleebi see kood ja salvesta.
// Power Automate'i voog kutsub seda „Run script“ tegevusega ja annab päringu sisu parameetrina `request`.
// Loogika on sama mis Code.gs failis (Google Sheetsi versioon).

const TABLE_NAME = 'Tulemused';
const SECRET = 'partel-qa-club-2026'; // peab ühtima js/config.js → SECURITY.resultSecret
const HEADERS = ['Aeg (saabus)', 'Nimi', 'Mängu kood', 'Tulemus (ms)', 'Tulemus', 'Mööda', 'Vihjeid'];

interface Request {
  action?: string;
  name?: string;
  code?: string;
  ms?: number;
  misses?: number;
  hints?: number;
  sig?: string;
}

interface Row {
  name: string;
  ms: number;
  misses: number;
  hints: number;
}

function main(workbook: ExcelScript.Workbook, request: string): string {
  try {
    const d = JSON.parse(request || '{}') as Request;
    const table = getTable(workbook);
    const code = String(d.code || '').trim().toLowerCase();

    // Edetabeli küsimine: { action: 'list', code: 'keskmine-12345' }
    if (d.action === 'list') {
      return JSON.stringify({ ok: true, rows: code ? rows(table, code) : [] });
    }

    // Tulemuse saatmine
    const name = String(d.name || '').trim().slice(0, 40);
    const ms = Math.round(Number(d.ms));
    const misses = Math.round(Number(d.misses));
    const hints = Math.round(Number(d.hints));
    const payload = JSON.stringify([name, code, ms, misses, hints]);
    if (!name || !/^(kerge|keskmine|raske)-\d{1,9}$/.test(code) || !(ms > 0)
        || cyrb53(payload + SECRET).toString(36) !== d.sig) {
      return JSON.stringify({ ok: false, status: 'invalid' });
    }

    const exists = rows(table, code).some((r) => r.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      table.addRow(-1, [new Date().toISOString(), name, code, ms, fmt(ms), misses, hints]);
    }
    return JSON.stringify({ ok: true, status: exists ? 'exists' : 'added', rows: rows(table, code) });
  } catch (err) {
    return JSON.stringify({ ok: false, status: 'error', message: String(err) });
  }
}

/** Leiab tabeli „Tulemused“ või loob selle (koos samanimelise lehega). */
function getTable(workbook: ExcelScript.Workbook): ExcelScript.Table {
  const existing = workbook.getTable(TABLE_NAME);
  if (existing) return existing;
  const sheet = workbook.getWorksheet(TABLE_NAME) ?? workbook.addWorksheet(TABLE_NAME);
  const header = sheet.getRange('A1:G1');
  header.setValues([HEADERS]);
  const table = workbook.addTable(header, true);
  table.setName(TABLE_NAME);
  return table;
}

function rows(table: ExcelScript.Table, code: string): Row[] {
  const body = table.getRangeBetweenHeaderAndTotal();
  if (!body) return [];
  return body.getValues()
    .filter((r) => String(r[1]).trim() !== '' && String(r[2]).trim().toLowerCase() === code)
    .map((r) => ({ name: String(r[1]), ms: Number(r[3]), misses: Number(r[5]), hints: Number(r[6]) }))
    .sort((a, b) => a.ms - b.ms);
}

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
}

function cyrb53(str: string, seed: number = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
