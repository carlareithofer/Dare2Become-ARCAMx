'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDown, CalendarDays, ChevronRight, LogOut, Package } from 'lucide-react';
import { DriverHeader } from '@/components/DriverHeader';
import { Card, Empty, StatusBadge, cx } from '@/components/ui';
import { getCurrentDriverId, getDriver, getTripsForDriver, logoutDriver } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { city, fmtDate, fmtTime } from '@/lib/format';
import type { TripDetail } from '@/lib/types';

const nextStep: Partial<Record<TripDetail['status'], string>> = {
  planned: 'Pornește cursa',
  in_progress: 'Confirmă încărcarea',
  loaded: 'Înregistrează livrarea',
};

function TripCard({ t }: { t: TripDetail }) {
  const step = nextStep[t.status];
  return (
    <Link href={`/sofer/cursa/${t.id}`} className="block">
      <Card className="p-4 active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={t.status} />
          <span className="text-[13px] text-muted">{t.ecmr?.number}</span>
        </div>
        <div className="mt-3 grid grid-cols-[16px_1fr] gap-x-3">
          <span className="mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-brand dark:border-ink" />
          <div>
            <div className="text-[18px] font-bold leading-tight">{city(t.loadingAddress)}</div>
            <div className="text-[14px] text-muted">{fmtDate(t.loadingDate)}, {fmtTime(t.loadingDate)} · {t.sender?.name}</div>
          </div>
          <ArrowDown size={16} className="my-1 text-muted" aria-hidden />
          <span />
          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
          <div>
            <div className="text-[18px] font-bold leading-tight">{city(t.deliveryAddress)}</div>
            <div className="text-[14px] text-muted">{fmtDate(t.plannedDeliveryDate)}, {fmtTime(t.plannedDeliveryDate)} · {t.consignee?.name}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[14px]">
          <span className="flex items-center gap-1.5 text-muted"><Package size={16} aria-hidden />{t.goods[0]?.description}</span>
        </div>
        {step && (
          <div className="mt-3 flex h-12 items-center justify-between rounded-xl bg-accent px-4 text-[16px] font-bold text-brand">
            {step} <ChevronRight aria-hidden />
          </div>
        )}
      </Card>
    </Link>
  );
}

export default function MyTrips() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'done'>('active');

  const { data } = useLive(async () => {
    const driverId = getCurrentDriverId();
    if (!driverId) return null;
    const [driver, trips] = await Promise.all([getDriver(driverId), getTripsForDriver(driverId)]);
    return { driver, trips };
  }, []);

  // fără sesiune → ecranul de intrare cu cod
  useEffect(() => {
    if (!getCurrentDriverId()) router.replace('/sofer/login');
  }, [router]);

  if (!data) return <DriverHeader title="Cursele mele" />;
  const active = data.trips.filter((t) => ['planned', 'in_progress', 'loaded'].includes(t.status));
  const done = data.trips.filter((t) => ['delivered', 'invoiced'].includes(t.status)).reverse();
  const list = tab === 'active' ? active : done;
  const firstName = data.driver?.fullName.split(' ')[0];

  return (
    <main>
      <DriverHeader
        title="Cursele mele"
        right={
          <button onClick={() => { logoutDriver(); router.replace('/sofer/login'); }} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Ieșire">
            <LogOut size={20} />
          </button>
        }
      />
      <div className="bg-brand px-4 pb-5 text-white">
        <p className="text-[22px] font-bold">Salut, {firstName}!</p>
        <p className="flex items-center gap-1.5 text-[15px] text-white/75">
          <CalendarDays size={16} aria-hidden /> {active.length === 1 ? 'Ai o cursă activă' : `Ai ${active.length} curse active`}
        </p>
      </div>

      <div className="sticky top-16 z-10 flex gap-2 bg-surface px-4 py-3">
        {(['active', 'done'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cx('h-11 flex-1 rounded-xl text-[15px] font-semibold', tab === k ? 'bg-brand text-white' : 'border-2 border-line bg-card text-ink')}
          >
            {k === 'active' ? `Active (${active.length})` : `Finalizate (${done.length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-8">
        {list.length === 0 ? <Empty>{tab === 'active' ? 'Nu ai curse active acum.' : 'Încă nu ai curse finalizate.'}</Empty> : list.map((t) => <TripCard key={t.id} t={t} />)}
      </div>
    </main>
  );
}
