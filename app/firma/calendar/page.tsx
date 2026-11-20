'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, cx } from '@/components/ui';
import { getTrips } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { city } from '@/lib/format';
import type { TripStatus } from '@/lib/types';

const dot: Record<TripStatus, string> = {
  planned: 'bg-planned-soft text-planned border-planned/30',
  in_progress: 'bg-progress-soft text-progress border-progress/30',
  loaded: 'bg-brand-soft text-brand border-brand/20 dark:text-ink dark:border-ink/20',
  delivered: 'bg-ok-soft text-ok border-ok/30',
  invoiced: 'bg-ok-soft text-ok border-ok/30',
  cancelled: 'bg-problem-soft text-problem border-problem/30',
};
const days = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Calendar lunar: fiecare cursă apare în ziua încărcării. */
export default function Calendar() {
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const { data: trips } = useLive(() => getTrips(), []);
  if (!trips) return null;

  const first = new Date(month);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7)); // începem de luni
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const today = key(new Date());
  const move = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold capitalize text-brand dark:text-ink">{month.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}</h1>
        <div className="flex gap-2">
          <button onClick={() => move(-1)} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card" aria-label="Luna anterioară"><ChevronLeft /></button>
          <button onClick={() => setMonth(() => { const d = new Date(); d.setDate(1); return d; })} className="h-10 rounded-xl border border-line bg-card px-4 text-[14px] font-semibold">Azi</button>
          <button onClick={() => move(1)} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card" aria-label="Luna următoare"><ChevronRight /></button>
        </div>
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="grid grid-cols-7 bg-surface text-center text-[12px] font-semibold uppercase tracking-wide text-muted">
          {days.map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d) => {
            const dayTrips = trips.filter((t) => key(new Date(t.loadingDate)) === key(d));
            const out = d.getMonth() !== month.getMonth();
            return (
              <div key={key(d)} className={cx('min-h-28 border-t border-l border-line p-1.5', out && 'bg-surface/60')}>
                <div className={cx('mb-1 grid h-6 w-6 place-items-center rounded-full text-[12px] font-semibold', key(d) === today ? 'bg-accent text-brand' : out ? 'text-muted/60' : 'text-ink')}>{d.getDate()}</div>
                <div className="flex flex-col gap-1">
                  {dayTrips.map((t) => (
                    <Link key={t.id} href={`/firma/curse/${t.id}`} className={cx('truncate rounded-md border px-1.5 py-0.5 text-[12px] font-semibold', dot[t.status])} title={`${t.driver?.fullName}: ${city(t.loadingAddress)} → ${city(t.deliveryAddress)}`}>
                      {new Date(t.loadingDate).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} {city(t.loadingAddress)} → {city(t.deliveryAddress)}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
