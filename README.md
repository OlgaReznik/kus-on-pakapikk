# Kus on päkapikk Pärtel?

QA Clubi jõulumäng: leia rahvarohkelt jõuluturult üles kõik otsitavad. Kiireim võidab.

## Kasutamine

- **Admin** logib sisse („Admini sisselogimine“), valib taseme, vajutab „Uus pilt“ ja jagab 5-kohalist mängu koodi.
- **Mängija** sisestab nime ja koodi. Mängu lõpus saadetakse tulemus automaatselt Google Sheetsi või OneDrive'i Exceli faili ja kuvatakse edetabel.
- Lingiga saab koodi eeltäita: `https://<kasutaja>.github.io/<repo>/#24813`

## Kaustade struktuur

```
index.html              lehe ülesehitus
css/style.css           kõik stiilid
js/
  main.js               sisenemispunkt: mängija ja admini voog, nuppude sidumine
  config.js             kõik seadistatavad väärtused (tasemed, karistused, Google Sheetsi URL, parool)
  palette.js            värvid ja sildid
  game/                 mängureeglid ilma DOM-ita (Game, mängu koodid, tulemuse koodid)
  scene/                pildi genereerimine (taust, objektid, segajad, paigutus, klõpsualad)
  draw/                 canvasele joonistamine (tegelased, esemed, ehitised, taust)
  view/                 kasutajaliides (suum, animatsioonikiht, kaardid, dialoogid, edetabel)
  services/             Google Sheets API, admini sessioon, mängija ajalugu
  utils/                üldised abifunktsioonid
backend/Code.gs         Google Apps Scripti taustarakendus (tulemused ja edetabel)
backend/ExcelScript.ts  sama Exceli jaoks (Office Script + Power Automate), vt backend/EXCEL-SEADISTUS.md
```

## Sagedasemad muudatused

| Mida muuta | Kus |
|---|---|
| Tasemete raskus, otsitavate arv | `js/config.js` → `LEVELS` |
| Otsitavate nimed ja vihjed | `js/config.js` → `TARGET_INFO` |
| Otsitava suurus (väiksem = raskem) | `js/config.js` → `TARGET_SIZE` |
| Vale klõpsu / vihje karistus | `js/config.js` → `PENALTY_SECONDS` |
| Google Sheetsi / Power Automate'i aadress | `js/config.js` → `LEADERBOARD_URL` |
| Tulemused Exceli faili | `backend/EXCEL-SEADISTUS.md` |
| Värvid, siltide tekstid | `js/palette.js` |

Admini parool on `config.js` failis räsina. Uue parooli räsi arvutamiseks küsi abi või kasuta `hashToString(parool, 7)` funktsiooni failist `js/utils/hash.js`.

## Kohalik käivitamine

ES-moodulid ei tööta faili topeltklõpsuga avades. Käivita kaustas väike veebiserver:

```
python -m http.server 8000
```

ja ava brauseris `http://localhost:8000`.
