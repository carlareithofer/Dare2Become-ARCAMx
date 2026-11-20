'use client';
import { MapPin, ShieldCheck } from 'lucide-react';
import type { Company, SignatureParty, TripDetail } from '@/lib/types';
import { fmtDateTime, remarkLabel } from '@/lib/format';
import { cx } from './ui';

function Box({ n, title, children, className }: { n: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('border border-line p-3', className)}>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
        <span className="mr-1.5 rounded bg-brand-soft px-1.5 py-0.5 text-brand dark:text-ink">{n}</span>
        {title}
      </div>
      <div className="text-[14px] leading-snug text-ink">{children}</div>
    </div>
  );
}

const sigBox: Record<SignatureParty, { n: string; title: string }> = {
  sender: { n: '22', title: 'Expeditor – semnătură' },
  carrier: { n: '23', title: 'Transportator – semnătură' },
  consignee: { n: '24', title: 'Destinatar – marfă primită' },
};

/** eCMR-ul afișat ca document, cu căsuțele principale ale unui CMR. */
export function EcmrView({ trip, company }: { trip: TripDetail; company?: Company | null }) {
  const { ecmr } = trip;
  if (!ecmr) return null;
  const delivery = trip.remarks.filter((r) => r.stage === 'delivery');
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-brand px-4 py-3 text-white">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Scrisoare de trăsură electronică</div>
          <div className="text-[17px] font-bold">{ecmr.number}</div>
        </div>
        <div className="text-right text-[12px] text-white/80">Emis {fmtDateTime(ecmr.issuedAt)}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2">
        <Box n="1" title="Expeditor">
          <b>{trip.sender?.name}</b><br />{trip.sender?.address}, {trip.sender?.city}, {trip.sender?.country}
        </Box>
        <Box n="16" title="Transportator">
          <b>{company?.name ?? 'Transportator'}</b><br />
          {trip.vehicle?.plateNumber}{trip.vehicle?.trailerPlate ? ` / ${trip.vehicle.trailerPlate}` : ''} · {trip.driver?.fullName}
        </Box>
        <Box n="2" title="Destinatar">
          <b>{trip.consignee?.name}</b><br />{trip.consignee?.address}, {trip.consignee?.city}, {trip.consignee?.country}
        </Box>
        <Box n="3 · 4" title="Livrare · Încărcare">
          <span className="text-muted">Livrare:</span> {trip.deliveryAddress}<br />
          <span className="text-muted">Încărcare:</span> {trip.loadingAddress}, {fmtDateTime(trip.loadingDate)}
        </Box>
      </div>

      <Box n="6–12" title="Marfa" className="border-t-0">
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <thead className="text-muted">
              <tr><th className="px-1 py-1 font-semibold">Natura mărfii</th><th className="px-1 font-semibold">Colete</th><th className="px-1 font-semibold">Ambalaj</th><th className="px-1 font-semibold">Greutate</th><th className="px-1 font-semibold">Volum</th></tr>
            </thead>
            <tbody>
              {trip.goods.map((g) => (
                <tr key={g.id} className="border-t border-line">
                  <td className="px-1 py-1.5">{g.description}{g.marks ? <span className="text-muted"> · {g.marks}</span> : null}</td>
                  <td className="px-1">{g.packagesCount}</td>
                  <td className="px-1">{g.packagingType}</td>
                  <td className="px-1">{g.weightKg.toLocaleString('ro-RO')} kg</td>
                  <td className="px-1">{g.volumeM3} m³</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>

      <div className="grid grid-cols-1 sm:grid-cols-2">
        <Box n="18" title="Rezerve transportator">{ecmr.carrierReservations || <span className="text-muted">Fără rezerve</span>}</Box>
        <Box n="24" title="Observații la livrare">
          {delivery.length === 0
            ? <span className="text-muted">{trip.signatures.some((s) => s.party === 'consignee') ? 'Marfă primită fără observații' : '–'}</span>
            : delivery.map((r) => <div key={r.id}>• <b>{remarkLabel[r.category]}</b>{r.details ? `: ${r.details}` : ''}</div>)}
        </Box>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3">
        {(['sender', 'carrier', 'consignee'] as SignatureParty[]).map((party) => {
          const s = trip.signatures.find((x) => x.party === party);
          return (
            <Box key={party} n={sigBox[party].n} title={sigBox[party].title}>
              {s ? (
                <>
                  {s.signatureUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.signatureUrl} alt={`Semnătura ${s.signerName}`} className="h-14 w-full rounded bg-white object-contain" />
                    : <div className="grid h-14 place-items-center rounded bg-brand-soft text-[12px] font-semibold text-brand dark:text-ink">Confirmat în aplicație</div>}
                  <div className="mt-1 font-semibold">{s.signerName}</div>
                  <div className="text-[12px] text-muted">{fmtDateTime(s.signedAt)}</div>
                  {s.latitude != null && (
                    <div className="flex items-center gap-1 text-[12px] text-muted"><MapPin size={12} aria-hidden />{s.latitude}, {s.longitude}</div>
                  )}
                </>
              ) : <div className="grid h-14 place-items-center text-[13px] text-muted">Nesemnat încă</div>}
            </Box>
          );
        })}
      </div>

      {ecmr.documentHash && (
        <div className="flex items-start gap-2 border-t border-line px-4 py-2.5 text-[12px] text-muted">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-ok" aria-hidden />
          <span className="break-all">Amprenta documentului: {ecmr.documentHash}</span>
        </div>
      )}
    </div>
  );
}
