@AGENTS.md

# FacturCMR – prototip eCMR

Platformă de **eCMR** (scrisoare de trăsură electronică) pentru firme mici de transport din România.
Deadline prototip: **duminică, 22 noiembrie 2026, 23:59**.

## Echipa și împărțirea muncii
- **Carla – UI/UX**: aplicația șoferului (mobil) și dashboard-ul firmei (desktop). Ramura `carla/ui`.
- **Răzvan – date + logică**: baza de date Supabase, logica eCMR, semnătura digitală.
- UI-ul rulează acum pe **date mock** (localStorage). Răzvan reimplementează funcțiile din `lib/data/` cu Supabase.

## Reguli importante (citește-le înainte să schimbi ceva)
1. **Nu schimba semnăturile funcțiilor din `lib/data/`** (nume, parametri, tip returnat). UI-ul depinde doar de ele.
   Se schimbă doar *implementarea* (mock → Supabase).
2. **Nu schimba `lib/types.ts` fără acordul amândurora.** Tipurile urmează schema bazei de date.
3. UI-ul nu importă niciodată direct din `lib/mock/`. Doar `lib/data/` are voie.
4. Toată interfața e în **română, cu diacritice** (ă, â, î, ș, ț).
5. Fără librării UI grele. Iconițe: `lucide-react`. Semnătură: `react-signature-canvas`.
6. Nu construim acum: hartă/locații, comunitate, jocuri, case de expediție, plăți, SmartBill/e-Factura.

## Fluxul principal (singurul care trebuie să meargă)
1. Firma creează o cursă (client, expeditor, destinatar, rută, date, marfă, camion, șofer) → se generează automat un eCMR.
2. Șoferul vede cursa în aplicație, cu eCMR-ul atașat.
3. La încărcare, expeditorul semnează pe telefonul șoferului (opțional în prototip).
4. La livrare: „Marfă OK” sau observații din listă + poze + numele și semnătura destinatarului pe ecran.
5. Firma vede cursa ca „Livrată”, cu eCMR-ul complet.

## Statusuri
- Cursă (`TripStatus`): `planned` → `in_progress` (șoferul pornește cursa) → `loaded` → `delivered` → `invoiced`. Oricând: `cancelled`.
- eCMR (`EcmrStatus`): `draft` → `issued` (la creare) → `loaded` → `delivered` → `closed`.
- Număr eCMR: `FCMR-AAAA-NNNNNN` (ex. `FCMR-2026-000123`).
- Etichete, culori și iconițe pentru statusuri: `lib/status.ts`.

## Stack
Next.js 16 (App Router, `cacheComponents` activ) + TypeScript + Tailwind CSS v4 (paleta în `tailwind.config.mts`, încărcată cu `@config`) + font Inter.

## Structură
```
app/
  page.tsx                → alegere rol (demo): „Sunt șofer” / „Sunt firmă”
  sofer/                  → aplicația șoferului (mobile-first)
    page.tsx              → Cursele mele
    login/page.tsx        → intrare cu cod de invitație (6 caractere)
    cursa/[id]/page.tsx   → detalii cursă + eCMR
    cursa/[id]/livrare/   → livrare în pași: bife, observații, poze, semnătură
  firma/                  → dashboard firmă (desktop)
    page.tsx              → lista curselor + filtre pe status
    curse/noua/page.tsx   → creare cursă
    curse/[id]/page.tsx   → detalii cursă + eCMR + semnături + poze
    calendar/page.tsx     → calendar cu cursele pe zile
    soferi/page.tsx       → listă șoferi + generare cod de invitație
components/               → componente mici, reutilizabile
lib/types.ts              → tipurile comune (schema DB)
lib/status.ts             → etichete/culori/iconițe pentru statusuri
lib/data/                 → stratul de date (mock acum, Supabase mai târziu)
lib/mock/                 → seed + store în localStorage (folosit DOAR de lib/data/)
```

## Stratul de date (`lib/data/`)
Toate funcțiile sunt `async` și primesc/întorc tipurile din `lib/types.ts`.
Fiecare fișier are la început o listă cu funcțiile lui. Note pentru Supabase:
- `Signature.signatureUrl` și `Photo.url` sunt acum **dataURL**. În Supabase → upload în Storage și URL public/semnat.
- `Ecmr.snapshot` = copia datelor cursei la emitere (părți, rută, marfă), ca eCMR-ul să nu se schimbe dacă se editează partenerii.
- „Sesiunea” (utilizatorul curent) e simulată în `lib/data/session.ts`. În Supabase → Auth.

## Design
- Paletă: `brand` #0F2A4A, `accent` #FF7A1A, `surface` #F4F6F9, `ink` #1C2530, `status.*`.
- Butonul principal: fundal `accent`, **text `brand`** (nu alb).
- „În curs”: text #92400E pe fundal #FEF3C7. Statusul are mereu text + iconiță.
- Aplicația șoferului: mobil 375–430 px, butoane ≥ 48 px, text ≥ 16 px, un singur buton principal fixat jos, contrast mare, dark mode.
- Dashboard firmă: bară laterală bleumarin (Curse, Calendar, Șoferi), conținut pe `surface`.

## Rulare
```bash
npm run dev                    # http://localhost:3000
npm run dev -- -H 0.0.0.0      # accesibil de pe telefon în aceeași rețea Wi-Fi
```
Datele mock stau în localStorage-ul fiecărui browser (nu se sincronizează între dispozitive).
