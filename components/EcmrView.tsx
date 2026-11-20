// eCMR afișat ca document, cu căsuțele CMR principale (numerotarea din formularul CMR).
// Se adaptează la lățimea containerului (container queries): 1 coloană pe telefon, 2 pe desktop.
import type { ReactNode } from "react";
import type { TripDetails } from "@/lib/data";
import { readEcmrSnapshot } from "@/lib/ecmr";
import { formatCoords, formatDate, formatDateTime, formatKg } from "@/lib/format";
import { PARTY_LABEL, REMARK_LABEL } from "@/lib/status";
import type { Signature, SignatureParty } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function Box({ n, title, children, wide }: { n: number | string; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`border-slate-300 p-3 dark:border-slate-700 ${wide ? "@lg:col-span-2" : ""}`}>
      <h3 className="mb-1 flex items-baseline gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase dark:text-slate-400">
        <span className="rounded bg-brand px-1.5 py-0.5 text-[11px] text-white">{n}</span>
        {title}
      </h3>
      <div className="text-base leading-snug">{children}</div>
    </section>
  );
}

function PartyBlock({ p }: { p: { name: string; address: string; city?: string; country: string; vatCode: string } }) {
  return (
    <>
      <p className="font-semibold">{p.name}</p>
      <p>{p.address}</p>
      {p.city && <p>{p.city}, {p.country}</p>}
      <p className="text-sm text-ink-muted dark:text-slate-400">CUI/TVA: {p.vatCode}</p>
    </>
  );
}

function SignatureBlock({ sig, party }: { sig?: Signature; party: SignatureParty }) {
  if (!sig) return <p className="text-ink-muted italic dark:text-slate-400">Nesemnat încă</p>;
  const coords = formatCoords(sig.latitude, sig.longitude);
  return (
    <div className="flex flex-col gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element -- dataURL/URL Storage */}
      <img src={sig.signatureUrl} alt={`Semnătura ${PARTY_LABEL[party].toLowerCase()} – ${sig.signerName}`} className="h-20 w-full max-w-64 rounded-lg border border-slate-200 bg-white object-contain" />
      <p className="font-semibold">{sig.signerName}</p>
      <p className="text-sm text-ink-muted dark:text-slate-400">{formatDateTime(sig.signedAt)}</p>
      {coords && <p className="text-sm text-ink-muted dark:text-slate-400">GPS: {coords}</p>}
    </div>
  );
}

export function EcmrView({ details }: { details: TripDetails }) {
  const { ecmr, signatures, remarks } = details;
  const s = readEcmrSnapshot(ecmr.snapshot);
  const sig = (party: SignatureParty) => signatures.find((x) => x.party === party);
  const totalKg = s.goods.reduce((sum, g) => sum + g.weightKg, 0);
  const totalPackages = s.goods.reduce((sum, g) => sum + g.packagesCount, 0);

  return (
    <article className="@container overflow-hidden rounded-2xl border-2 border-brand bg-surface-card text-ink dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-2 bg-brand px-4 py-3 text-white">
        <div>
          <p className="text-xs tracking-widest text-slate-300 uppercase">Scrisoare de trăsură internațională · eCMR</p>
          <p className="text-xl font-bold tabular-nums">{ecmr.number}</p>
        </div>
        <StatusBadge kind="ecmr" status={ecmr.status} size="sm" />
      </header>

      <div className="grid divide-y divide-slate-300 @lg:grid-cols-2 @lg:divide-x dark:divide-slate-700 [&>*]:border-slate-300">
        <Box n={1} title="Expeditor">
          <PartyBlock p={s.sender} />
        </Box>
        <Box n={16} title="Transportator">
          <PartyBlock p={s.carrier} />
          <p className="mt-1 text-sm">
            Șofer: <strong>{s.driverName}</strong> · {s.plateNumber}
            {s.trailerPlate && ` / ${s.trailerPlate}`}
          </p>
        </Box>
        <Box n={2} title="Destinatar">
          <PartyBlock p={s.consignee} />
        </Box>
        <Box n={3} title="Locul livrării">
          <p>{s.deliveryAddress}</p>
          <p className="text-sm text-ink-muted dark:text-slate-400">Planificat: {formatDate(s.plannedDeliveryDate)}</p>
        </Box>
        <Box n={4} title="Locul și data încărcării" wide>
          <p>{s.loadingAddress}</p>
          <p className="text-sm text-ink-muted dark:text-slate-400">{formatDateTime(s.loadingDate)}</p>
        </Box>

        <Box n="6–12" title="Marfa" wide>
          <ul className="flex flex-col gap-2">
            {s.goods.map((g, i) => (
              <li key={i} className="rounded-lg bg-surface p-2 dark:bg-slate-800">
                <p className="font-semibold">{g.description}</p>
                <p className="text-sm">
                  {g.packagesCount} {g.packagingType} · {formatKg(g.weightKg)} · {g.volumeM3} m³
                  {g.marks && <> · Mărci: {g.marks}</>}
                </p>
              </li>
            ))}
          </ul>
          {s.goods.length > 1 && (
            <p className="mt-2 text-sm font-semibold">
              Total: {totalPackages} unități · {formatKg(totalKg)}
            </p>
          )}
        </Box>

        <Box n={18} title="Rezerve și observații" wide>
          {ecmr.carrierReservations && <p className="mb-1">{ecmr.carrierReservations}</p>}
          {remarks.length === 0 ? (
            <p className="text-ink-muted dark:text-slate-400">Fără observații</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {remarks.map((r) => (
                <li key={r.id}>
                  <strong>{r.stage === "loading" ? "La încărcare" : "La livrare"}:</strong> {REMARK_LABEL[r.category]}
                  {r.details && ` – ${r.details}`}
                </li>
              ))}
            </ul>
          )}
        </Box>

        <Box n={22} title="Semnătura expeditorului">
          <SignatureBlock sig={sig("sender")} party="sender" />
        </Box>
        <Box n={24} title="Primit – semnătura destinatarului">
          <SignatureBlock sig={sig("consignee")} party="consignee" />
        </Box>
      </div>

      <footer className="border-t border-slate-300 px-4 py-2 text-xs text-ink-muted dark:border-slate-700 dark:text-slate-400">
        Emis la {formatDateTime(ecmr.issuedAt)}
        {ecmr.closedAt && ` · Închis la ${formatDateTime(ecmr.closedAt)}`}
        {ecmr.documentHash && ` · Hash: ${ecmr.documentHash.slice(0, 12)}…`}
      </footer>
    </article>
  );
}
