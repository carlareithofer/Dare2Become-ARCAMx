# FacturCMR – prototip eCMR

eCMR completat și semnat pe telefon. De la livrare la factură, în aceeași zi.

## Cum îl pornești
Ai nevoie de **Node.js 20 sau mai nou** (https://nodejs.org, varianta LTS).

```bash
npm install      # o singură dată
npm run dev      # pornește aplicația
```

Deschide http://localhost:3000 în browser.

- **Aplicația șoferului:** http://localhost:3000/sofer (cod demo: `ION123`)
- **Dashboard-ul firmei:** http://localhost:3000/firma

### Pe telefon
Telefonul și laptopul trebuie să fie pe același Wi-Fi. Pornește cu:

```bash
npm run dev -- -H 0.0.0.0
```

În terminal apare o adresă „Network”, de forma `http://192.168.x.x:3000`. Deschide-o pe telefon și adaugă `/sofer`.

## Demo
Datele sunt fictive și se salvează doar în browserul în care lucrezi. Ca să vezi cum ajunge livrarea la firmă,
deschide `/sofer` și `/firma` în **același browser** (două taburi): ce face șoferul apare imediat în dashboard.
„Resetează datele demo” (jos, în meniul firmei) readuce datele inițiale.

Pentru detalii tehnice și împărțirea muncii vezi `CLAUDE.md`.
