# Tulemused OneDrive'i Exceli faili (Google Sheetsi asemel)

Kuidas see töötab: **mäng → Power Automate'i voog (HTTP-päring) → Office Script → Exceli tabel**.
Mäng saadab kõik päringud POST-iga ja voog saadab vastuse (edetabeli) tagasi.

## Enne alustamist kontrolli

- **Power Automate Premium.** Päästik „When an HTTP request is received“ on Premium-tegevus. Kui sul seda pole, ei saa voogu salvestada. Küsi IT-lt või kasuta edasi Google Sheetsi.
- **„Anyone“ päästik peab olema lubatud.** Mängijad pole sisse logitud, seega peab voogu saama käivitada igaüks, kellel on link. Kui ettevõtte DLP-poliitika seda keelab, annab Power Automate salvestamisel veateate.
- **Office Scripts peab olema lubatud** (Excel veebis peab olema menüü „Automate“).

## 1. Loo Exceli fail

1. Loo oma OneDrive'i uus tühi Exceli fail, näiteks `Partel-tulemused.xlsx`.
2. Tabelit pole vaja luua. Skript loob lehe ja tabeli **Tulemused** ise esimesel käivitusel.

## 2. Lisa Office Script

1. Ava fail **Excel veebis** (Exceli rakendusest ei saa skripti voo jaoks salvestada).
2. Vali **Automate → New Script**.
3. Kustuta näidiskood ja kleebi sinna kogu fail `backend/ExcelScript.ts`.
4. Pane skriptile nimi, näiteks `Partel tulemused`, ja vajuta **Save script**.

## 3. Loo Power Automate'i voog

Ava [make.powerautomate.com](https://make.powerautomate.com) → **Create → Instant cloud flow** → **Skip** → otsi päästik **When an HTTP request is received**.

**Päästik: When an HTTP request is received**
- *Who can trigger the flow:* **Anyone**
- *Method:* **POST**
- *Request Body JSON Schema:* jäta tühjaks
- Päästiku **⋯ → Settings → Concurrency control: On, Degree of parallelism: 1**. Nii ei saa kaks samaaegset tulemust teineteist segada.

**Tegevus 1: Excel Online (Business) → Run script**
- *Location:* OneDrive for Business
- *Document Library:* OneDrive
- *File:* `Partel-tulemused.xlsx`
- *Script:* `Partel tulemused`
- *request:* lisa avaldis (Expression) `string(triggerBody())`

**Tegevus 2: Request → Response**
- *Status Code:* `200`
- *Headers:*
  - `Content-Type` = `application/json`
  - `Access-Control-Allow-Origin` = `*`
- *Body:* vali dünaamilisest sisust Run scripti väljund **result**

**Salvesta** voog. Seejärel ava päästik uuesti ja kopeeri **HTTP URL**.

## 4. Pane URL mängu sisse

`js/config.js` failis asenda `LEADERBOARD_URL` väärtus kopeeritud URL-iga:

```js
export const LEADERBOARD_URL = 'https://...powerautomate...';
```

Tee commit ja push, et GitHub Pages uueneks.

## 5. Testi

Käivita PowerShellis (pane `$url` asemele oma URL):

```powershell
$url = 'SIIA_SINU_URL'
Invoke-RestMethod -Method Post -Uri $url -ContentType 'text/plain' -Body '{"action":"list","code":"keskmine-1"}'
```

Vastus peaks olema `ok: True` ja tühi `rows`. Seejärel mängi üks mäng läbi. Tulemus peaks ilmuma Exceli lehele **Tulemused** ja mängu edetabelisse.

## Hea teada

- **Kiirus:** Power Automate vastab 2–6 sekundiga, Google'ist aeglasemalt. Edetabel uueneb sellegipoolest.
- **Päevalimiit:** Office Scripti saab Power Automate'ist käivitada umbes **1600 korda päevas kasutaja kohta**. Edetabel küsib uusi tulemusi iga 10 sekundi järel ja iga mängija kohta. 15 mängijaga on see umbes 90 käivitust minutis. Seepärast on mõistlik muuta `js/config.js` failis `LEADERBOARD_REFRESH_MS` väärtuseks `30_000` (30 s).
- **Tagasi Google Sheetsi:** pane `LEADERBOARD_URL` väärtuseks uuesti Apps Scripti URL. `Code.gs` töötab sama mänguga. Kui see on juba avaldatud, kleebi uus `Code.gs` Apps Scripti ja avalda uus versioon (**Deploy → Manage deployments → Edit → New version**).
- **Saladus:** `SECRET` failis `ExcelScript.ts` peab olema sama mis `SECURITY.resultSecret` failis `js/config.js`.
