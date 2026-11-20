'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Building2, CheckCircle2, ChevronDown, FileText, Package, Truck } from 'lucide-react';
import { BottomAction, DriverHeader } from '@/components/DriverHeader';
import { EcmrView } from '@/components/EcmrView';
import { Button, Card, LinkButton, StatusBadge, cx } from '@/components/ui';
import { getCompany, getTrip, startTrip } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { bodyTypeLabel, city, fmtDateLong, fmtTime } from '@/lib/format';
import type { TripStatus } from '@/lib/types';

const steps: { key: string; label: string; done: TripStatus[] }[] = [
  { key: 'start', label: 'Pornită', done: ['in_progress', 'loaded', 'delivered', 'invoiced'] },
  { key: 'load', label: 'Încărcată', done: ['loaded', 'delivered', 'invoiced'] },
  { key: 'deliver', label: 'Livrată', done: ['delivered', 'invoiced'] },
];

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const [showEcmr, setShowEcmr] = useState(false);
  const { data } = useLive(async () => ({ trip: await getTrip(id), company: await getCompany() }), [id]);

  if (!data) return <DriverHeader title="Cursă" back="/sofer" />;
  const { trip, company } = data;
  if (!trip) return <DriverHeader title="Cursa nu există" back="/sofer" />;

  return (
    <main>
      <DriverHeader title={`${city(trip.loadingAddress)} → ${city(trip.deliveryAddress)}`} back="/sofer" />

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={trip.status} />
          <span className="text-[13px] text-muted">{trip.ecmr?.number}</span>
        </div>

        {/* progresul cursei */}
        <Card className="flex items-center justify-between p-4">
          {steps.map((s, i) => {
            const done = s.done.includes(trip.status);
            return (
              <div key={s.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <span className={cx('grid h-9 w-9 place-items-center rounded-full', done ? 'bg-ok text-white dark:text-brand' : 'border-2 border-line text-muted')}>
                    {done ? <CheckCircle2 size={20} /> : i + 1}
                  </span>
                  <span className={cx('text-[13px] font-semibold', done ? 'text-ok' : 'text-muted')}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <span className={cx('mx-1 mb-5 h-0.5 flex-1', done ? 'bg-ok' : 'bg-line')} />}
              </div>
            );
          })}
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Încărcare</h2>
          <p className="text-[17px] font-bold">{trip.sender?.name}</p>
          <p className="text-[15px]">{trip.loadingAddress}</p>
          <p className="mt-1 text-[15px] font-semibold text-brand dark:text-accent">{fmtDateLong(trip.loadingDate)}, ora {fmtTime(trip.loadingDate)}</p>
          <div className="my-4 border-t border-dashed border-line" />
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Livrare</h2>
          <p className="text-[17px] font-bold">{trip.consignee?.name}</p>
          <p className="text-[15px]">{trip.deliveryAddress}</p>
          <p className="mt-1 text-[15px] font-semibold text-brand dark:text-accent">{fmtDateLong(trip.plannedDeliveryDate)}, ora {fmtTime(trip.plannedDeliveryDate)}</p>
        </Card>

        <Card className="divide-y divide-line">
          {trip.goods.map((g) => (
            <div key={g.id} className="flex gap-3 p-4">
              <Package className="mt-0.5 shrink-0 text-muted" aria-hidden />
              <div>
                <p className="text-[16px] font-semibold">{g.description}</p>
                <p className="text-[14px] text-muted">{g.packagesCount} × {g.packagingType} · {g.weightKg.toLocaleString('ro-RO')} kg · {g.volumeM3} m³</p>
              </div>
            </div>
          ))}
          <div className="flex gap-3 p-4">
            <Truck className="mt-0.5 shrink-0 text-muted" aria-hidden />
            <div>
              <p className="text-[16px] font-semibold">{trip.vehicle?.plateNumber}{trip.vehicle?.trailerPlate ? ` / ${trip.vehicle.trailerPlate}` : ''}</p>
              <p className="text-[14px] text-muted">{trip.vehicle && bodyTypeLabel[trip.vehicle.bodyType]}</p>
            </div>
          </div>
          <div className="flex gap-3 p-4">
            <Building2 className="mt-0.5 shrink-0 text-muted" aria-hidden />
            <div>
              <p className="text-[16px] font-semibold">{company?.name}</p>
              <p className="text-[14px] text-muted">Dispecerat: +40 721 000 001</p>
            </div>
          </div>
        </Card>

        <button
          onClick={() => setShowEcmr((v) => !v)}
          className="flex h-14 items-center justify-between rounded-2xl border-2 border-line bg-card px-4 text-[16px] font-semibold"
          aria-expanded={showEcmr}
        >
          <span className="flex items-center gap-2"><FileText size={20} aria-hidden /> {showEcmr ? 'Ascunde eCMR-ul' : 'Vezi eCMR-ul complet'}</span>
          <ChevronDown className={cx('transition', showEcmr && 'rotate-180')} aria-hidden />
        </button>
        {showEcmr && <EcmrView trip={trip} company={company} />}
      </div>

      {trip.status === 'planned' && (
        <BottomAction><Button size="lg" onClick={() => startTrip(trip.id)}>Pornește cursa</Button></BottomAction>
      )}
      {trip.status === 'in_progress' && (
        <BottomAction><LinkButton size="lg" href={`/sofer/cursa/${trip.id}/incarcare`}>Confirmă încărcarea</LinkButton></BottomAction>
      )}
      {trip.status === 'loaded' && (
        <BottomAction><LinkButton size="lg" href={`/sofer/cursa/${trip.id}/livrare`}>Înregistrează livrarea</LinkButton></BottomAction>
      )}
      {(trip.status === 'delivered' || trip.status === 'invoiced') && (
        <BottomAction>
          <div className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-ok-soft text-[17px] font-bold text-ok">
            <CheckCircle2 aria-hidden /> Livrare înregistrată
          </div>
        </BottomAction>
      )}
    </main>
  );
}
