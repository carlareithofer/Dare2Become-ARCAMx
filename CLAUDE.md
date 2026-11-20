# FacturCMR – context pentru Claude (citește înainte de orice modificare)

Prototip pentru programul Dare2Become (echipa ARCAMx). Deadline: **duminică, 22 noiembrie 2026, 23:59**.

## Produsul
Platformă de **eCMR** (scrisoare de trăsură electronică) pentru firme mici de transport din România.
Șoferul completează livrarea pe telefon (bife, observații din listă, poze), iar expeditorul și destinatarul
**semnează pe telefonul șoferului, fără cont**. Firma vede eCMR-ul complet imediat și îl aprobă pentru facturare.

Fluxul principal: firma creează cursa (+ eCMR) → șoferul pornește cursa → încărcare (semnează expeditorul)
→ livrare (observații + poze + semnează destinatarul) → firma aprobă pentru facturare.

**NU sunt în prototip:** hartă/locații, comunitate, case de expediție, plăți, integrare SmartBill/e-Factura (faza 2).

## Cine ce face
- **Carla:** UI/UX – aplicația șoferului (`app/sofer`) și dashboard-ul firmei (`app/firma`).
- **Răzvan:** baza de date (Supabase/PostgreSQL), login, eCMR + semnătura digitală, PDF.

## Stack
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 (tema e în `app/globals.css`, nu există tailwind.config).
Iconițe: `lucide-react`. Semnătura: `react-signature-canvas`. Font: Inter (`@fontsource-variable/inter`, fără rețea).
Atenție: Next 16 are schimbări față de versiunile vechi – vezi `AGENTS.md` și `node_modules/next/dist/docs/`.

## Datele – regula cea mai importantă
- Tipurile comune sunt în `lib/types.ts` (urmează schema bazei de date). **Nu le schimba fără acordul ambilor.**
- Interfața folosește **doar** funcțiile din `lib/data/index.ts` (`getTrips`, `getTrip`, `createTrip`, `submitLoading`, `submitDelivery`, `approveForInvoicing`, `loginWithInviteCode` etc.).
- Acum acele funcții citesc/scriu într-un store fictiv în `localStorage` (`lib/data/store.ts`, seed în `lib/mock/seed.ts`).
- **Pentru Supabase:** reimplementează funcțiile din `lib/data/index.ts` cu aceleași nume, parametri și tipuri returnate. Paginile nu trebuie modificate.
- `useLive()` (`lib/useLive.ts`) reîncarcă datele când se schimbă store-ul; cu Supabase se poate lega de Realtime.

## Design
Paleta „Autostradă”: bleumarin `#0F2A4A` (brand), portocaliu `#FF7A1A` (accent / buton principal, cu **text bleumarin**, nu alb),
fundal `#F4F6F9`, text `#1C2530`. Statusuri: livrat `#15803D`, în curs text `#92400E` pe `#FEF3C7`, problemă `#DC2626`, planificat `#64748B`.
Statusul are mereu text + iconiță. Aplicația șoferului: mobile-first (max-w-md), butoane ≥ 48 px, text ≥ 16 px,
un singur buton principal fixat jos, mod întunecat automat. Toată interfața în română, cu diacritice.

## Structură
```
app/page.tsx                      alegere rol (demo)
app/sofer/login                   intrare cu cod de invitație (demo: ION123, MIH456, AND789)
app/sofer                         Cursele mele
app/sofer/cursa/[id]              detalii cursă + eCMR
app/sofer/cursa/[id]/incarcare    semnătura expeditorului
app/sofer/cursa/[id]/livrare      livrare în 3 pași
app/firma                         lista curselor + indicatori
app/firma/curse/noua              creare cursă
app/firma/curse/[id]              detalii + eCMR + aprobare pentru facturare
app/firma/calendar                calendar lunar
app/firma/soferi                  șoferi + coduri de invitație
components/                       ui.tsx, EcmrView, SignaturePad, PhotoPicker, DriverHeader, FirmSidebar
```

## Git
Ramuri separate (`carla/ui`, `razvan/...`), pull request în `main`. Commit-uri mici. Rulează `npm run lint` și `npm run build` înainte de PR.
