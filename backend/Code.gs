// "Kus on päkapikk Pärtel?" – tulemuste ja edetabeli taustarakendus (Google Apps Script)
// Kleebi see kood Google Sheetsi alt: Laiendused → Apps Script, ja avalda veebirakendusena.

const SHEET_NAME = 'Tulemused';
const SECRET = 'partel-qa-club-2026';   // peab ühtima index.html failis olevaga

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Aeg (saabus)', 'Nimi', 'Mängu kood', 'Tulemus (ms)', 'Tulemus', 'Mööda', 'Vihjeid']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function cyrb53_(str, seed) {
  seed = seed || 0;
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function fmt_(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function rows_(code) {
  const values = sheet_().getDataRange().getValues().slice(1);
  return values
    .filter(r => String(r[2]) === code)
    .map(r => ({ name: String(r[1]), ms: Number(r[3]), misses: Number(r[5]), hints: Number(r[6]) }))
    .sort((a, b) => a.ms - b.ms);
}

// Mäng saadab tulemuse ({ action: 'submit', ... }) või küsib edetabelit ({ action: 'list', code })
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.action === 'list') {
    const listCode = String(d.code || '').trim().toLowerCase();
    return json_({ ok: true, rows: listCode ? rows_(listCode) : [] });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const name = String(d.name || '').trim().slice(0, 40);
    const code = String(d.code || '').trim().toLowerCase();
    const ms = Math.round(Number(d.ms)), misses = Math.round(Number(d.misses)), hints = Math.round(Number(d.hints));
    const payload = JSON.stringify([name, code, ms, misses, hints]);
    if (!name || !/^(kerge|keskmine|raske)-\d{1,9}$/.test(code) || !(ms > 0) ||
        cyrb53_(payload + SECRET).toString(36) !== d.sig) {
      return json_({ ok: false, status: 'invalid' });
    }
    const exists = rows_(code).some(r => r.name.toLowerCase() === name.toLowerCase());
    if (!exists) sheet_().appendRow([new Date(), name, code, ms, fmt_(ms), misses, hints]);
    return json_({ ok: true, status: exists ? 'exists' : 'added', rows: rows_(code) });
  } catch (err) {
    return json_({ ok: false, status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Mäng küsib edetabelit: ...?code=keskmine-12345
function doGet(e) {
  const code = String((e.parameter && e.parameter.code) || '').trim().toLowerCase();
  if (!code) return json_({ ok: true, rows: [] });
  return json_({ ok: true, rows: rows_(code) });
}
