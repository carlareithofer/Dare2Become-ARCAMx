# FacturCMR

**eCMR completat și semnat pe telefon. De la livrare la factură, în aceeași zi.**

Prototip realizat de echipa **ARCAMx** în programul **Dare2Become**.

---

## Cuprins

1. [Despre aplicație](#despre-aplicație)
2. [Cum funcționează](#cum-funcționează)
3. [Funcționalități](#funcționalități)
4. [Tehnologii](#tehnologii)
5. [Pornire rapidă](#pornire-rapidă)
6. [Date demo](#date-demo)
7. [Structura proiectului](#structura-proiectului)
8. [Date și backend](#date-și-backend)
9. [Design](#design)
10. [Echipa și contribuții](#echipa-și-contribuții)
11. [Ce urmează](#ce-urmează)

---

## Despre aplicație

FacturCMR este o platformă de **eCMR** (scrisoare de trăsură electronică) pentru firmele mici de transport din România.

- **Șoferul** completează livrarea pe telefon: bife, observații alese dintr-o listă și poze.
- **Expeditorul și destinatarul semnează direct pe telefonul șoferului**, fără să își facă cont.
- **Firma** vede eCMR-ul complet imediat și îl aprobă pentru facturare.

Fără hârtii pierdute, fără drumuri după CMR-ul semnat, fără zile de așteptare până la factură.

## Cum funcționează

```
Firma creează cursa (+ eCMR)
        │
        ▼
Șoferul pornește cursa
        │
        ▼
Încărcare: semnează expeditorul
        │
        ▼
Livrare: observații + poze + semnează destinatarul
        │
        ▼
Firma aprobă pentru facturare
```

Statusurile unei curse: **Planificată → În curs → Încărcată → Livrată → Facturată**.

## Funcționalități

### 📱 Aplicația șoferului (`/sofer`)

Gândită pentru telefon: butoane mari, text lizibil, un singur buton principal fixat jos.

- **Intrare cu cod de invitație**, fără parolă.
- **Cursele mele**: cursa activă în față, apoi cele planificate și cele finalizate.
- **Detaliile cursei**: rută, date, camion, contact dispecerat și eCMR-ul complet.
- **Încărcare**: expeditorul semnează pe ecran, iar locația și ora se salvează automat.
- **Livrare în 3 pași**:
  1. Marfa a ajuns în regulă? (da / am observații)
  2. Observații din listă (lipsuri, ambalaj deteriorat, marfă deteriorată, întârziere, altele) și poze ca dovadă
  3. Semnătura destinatarului
- Se poate instala pe telefon ca aplicație (PWA).

### 🖥️ Dashboard-ul firmei (`/firma`)

- **Lista curselor** cu filtre pe status și indicatori: curse active, de aprobat pentru facturare, livrări cu observații, facturate.
- **Cursă nouă**: părțile (client, expeditor, destinatar), programul, șoferul, camionul, marfa și prețul. Datele completează automat eCMR-ul.
- **Detaliile cursei**: eCMR-ul complet, istoricul cursei (cu semnăturile), observațiile și pozele de la livrare.
- **Aprobare pentru facturare**, cu datele preluate direct din eCMR.
- **Export PDF** al eCMR-ului (prin imprimare din browser).
- **Calendar lunar** cu toate cursele.
- **Șoferi**: lista șoferilor, cursa curentă / următoare și generare de coduri de invitație.

### Comune

- Actualizare **în timp real** între aplicația șoferului și dashboard.
- **Temă luminoasă / întunecată**, cu buton de comutare: Automat (după sistem) → Luminos → Întunecat.
- Toată interfața este în **limba română**.

## Tehnologii

| Ce | Cu ce |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Limbaj | TypeScript |
| Stiluri | Tailwind CSS v4 (tema în `app/globals.css`, fără `tailwind.config`) |
| Iconițe | `lucide-react` |
| Semnătură | `react-signature-canvas` |
| Font | Inter (`@fontsource-variable/inter`, funcționează fără internet) |
| Date (acum) | store fictiv în `localStorage` |
| Date (urmează) | Supabase / PostgreSQL |

> ⚠️ Next.js 16 are schimbări importante față de versiunile vechi. Vezi `AGENTS.md` înainte de a modifica codul.

## Pornire rapidă

Ai nevoie de **Node.js 20 sau mai nou** ([nodejs.org](https://nodejs.org), varianta LTS).

```bash
npm install      # o singură dată
npm run dev      # pornește aplicația
```

Deschide [http://localhost:3000](http://localhost:3000) și alege rolul:

| Interfață | Adresă |
| --- | --- |
| Alegere rol | http://localhost:3000 |
| Aplicația șoferului | http://localhost:3000/sofer |
| Dashboard-ul firmei | http://localhost:3000/firma |

### Pe telefon

Telefonul și laptopul trebuie să fie pe **același Wi-Fi**. Pornește cu:

```bash
npm run dev -- -H 0.0.0.0
```

În terminal apare o adresă „Network”, de forma `http://192.168.x.x:3000`. Deschide-o pe telefon și adaugă `/sofer`.

### Alte comenzi

```bash
npm run lint     # verifică codul
npm run build    # construiește versiunea de producție
npm run start    # pornește versiunea construită
```

## Date demo

Toate datele sunt **fictive** și se salvează doar în browserul în care lucrezi.

**Firma demo:** Trans Exemplu SRL

**Coduri de intrare pentru șoferi:**

| Șofer | Cod |
| --- | --- |
| Ion Popescu | `ION123` |
| Mihai Dumitru | `MIH456` |
| Andrei Stan | `AND789` |

Există deja 8 curse în toate statusurile, 3 camioane și 6 parteneri (din România, Germania și Ungaria).

**Sfaturi pentru demo:**

- Deschide `/sofer` și `/firma` în **același browser** (două taburi). Ce face șoferul apare imediat în dashboard.
- Butonul **„Resetează datele demo”** (jos, în meniul firmei) readuce datele inițiale.

## Structura proiectului

```
app/
├── page.tsx                        alegere rol (demo)
├── sofer/                          aplicația șoferului
│   ├── login/                      intrare cu cod de invitație
│   ├── page.tsx                    Cursele mele
│   └── cursa/[id]/
│       ├── page.tsx                detalii cursă + eCMR
│       ├── incarcare/              semnătura expeditorului
│       └── livrare/                livrare în 3 pași
└── firma/                          dashboard-ul firmei
    ├── page.tsx                    lista curselor + indicatori
    ├── curse/noua/                 creare cursă
    ├── curse/[id]/                 detalii + eCMR + aprobare
    ├── calendar/                   calendar lunar
    └── soferi/                     șoferi + coduri de invitație

components/                         ui, EcmrView, SignaturePad, PhotoPicker,
                                    DriverHeader, FirmSidebar, ThemeToggle
lib/
├── types.ts                        tipurile comune (urmează schema bazei de date)
├── data/index.ts                   funcțiile de date folosite de interfață
├── data/store.ts                   store-ul fictiv din localStorage
├── mock/seed.ts                    datele demo
├── useLive.ts                      reîncarcă datele când se schimbă
├── theme.ts                        tema luminoasă / întunecată
├── format.ts                       formatare date, bani, statusuri
└── geo.ts                          locația la semnare
public/                             manifest PWA și iconițe
```

## Date și backend

- Tipurile comune sunt în `lib/types.ts`. **Nu se schimbă fără acordul ambilor membri ai echipei.**
- Paginile folosesc **doar** funcțiile din `lib/data/index.ts` (`getTrips`, `getTrip`, `createTrip`, `submitLoading`, `submitDelivery`, `approveForInvoicing`, `loginWithInviteCode` etc.).
- Acum aceste funcții lucrează cu un store fictiv în `localStorage`.
- **Trecerea la Supabase:** se reimplementează funcțiile din `lib/data/index.ts` cu aceleași nume, parametri și tipuri returnate. Paginile nu trebuie modificate. `useLive()` se poate lega de Supabase Realtime.

## Design

Paleta **„Autostradă”**:

| Rol | Culoare |
| --- | --- |
| Brand (bleumarin) | `#0F2A4A` |
| Accent / buton principal (cu text bleumarin) | `#FF7A1A` |
| Fundal | `#F4F6F9` |
| Text | `#1C2530` |

| Status | Culoare |
| --- | --- |
| Livrat | `#15803D` |
| În curs | text `#92400E` pe `#FEF3C7` |
| Problemă | `#DC2626` |
| Planificat | `#64748B` |

Statusul are mereu text și iconiță, nu doar culoare.

## Echipa și contribuții

| Cine | Ce face |
| --- | --- |
| **Carla** | UI/UX: aplicația șoferului și dashboard-ul firmei |
| **Răzvan** | Baza de date (Supabase), login, eCMR și semnătura digitală, PDF |

**Cum lucrăm:**

- Fiecare pe ramura lui (`carla/...`, `razvan/...`), apoi pull request în `main`.
- Commit-uri mici.
- Înainte de PR: `npm run lint` și `npm run build`.

Context tehnic complet pentru dezvoltare: [`CLAUDE.md`](CLAUDE.md).

## Ce urmează

Nu sunt incluse în prototip (faza 2):

- integrare SmartBill / e-Factura
- hartă și urmărirea locației
- plăți
- comunitate și case de expediție

---

📅 **Termen prototip:** duminică, 22 noiembrie 2026, 23:59
