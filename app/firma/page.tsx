'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, FileClock, Truck } from 'lucide-react';
import { Card, StatusBadge, cx } from '@/components/ui';
import { getTrips } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { city, fmtDateTime, fmtMoney, statusLabel } from '@/lib/format';
import type { TripStatus } from '@/lib/types';

const filters: ('all' | TripStatus)[] = ['all', 'planned', 'in_progress', 'loaded', 'delivered', 'invoiced'];

export default function FirmTrips() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | TripStatus>('all');
  const { data: trips } = useLive(() => getTrips(), []);
  if (!trips) return null;

  const count = (s: TripStatus[]) => trips.filter((t) => s.includes(t.status)).length;
  const withRemarks = trips.filter((t) => t.remarks.length > 0 && t.status === 'delivered').length;
  const kpis = [
    { label: 'Curse active', value: count(['planned', 'in_progress', 'loaded']), Icon: Truck, cls: 'text-brand bg-brand-soft' },
    { label: 'De aprobat pentru facturare', value: count(['delivered']), Icon: FileClock, cls: 'text-progress bg-progress-soft' },
    { label: 'Livrări cu observații', value: withRemarks, Icon: AlertTriangle, cls: 'text-problem bg-problem-soft' },
    { label: 'Facturate', value: count(['invoiced']), Icon: CheckCircle2, cls: 'text-ok bg-ok-soft' },
  ];
  const list = [...trips].reverse().filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[28px] font-extrabold text-brand">Curse</h1>
      <p className="text-muted">Toate cursele firmei și eCMR-urile lor, actualizate în timp real.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, Icon, cls }) => (
          <Card key={label} className="flex items-center gap-4 p-4">
            <span className={cx('grid h-11 w-11 place-items-center rounded-xl', cls)}><Icon size={22} aria-hidden /></span>
            <span><span className="block text-[26px] font-extrabold leading-none text-ink">{value}</span><span className="text-[13px] text-muted">{label}</span></span>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx('h-9 rounded-full px-4 text-[14px] font-semibold', filter === f ? 'bg-brand text-white' : 'border border-line bg-card text-ink hover:border-muted')}
          >
            {f === 'all' ? `Toate (${trips.length})` : `${statusLabel[f]} (${count([f])})`}
          </button>
        ))}
      </div>

      <Card className="mt-4 overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-surface text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">eCMR</th>
              <th className="px-4 py-3 font-semibold">Rută</th>
              <th className="px-4 py-3 font-semibold">Încărcare</th>
              <th className="px-4 py-3 font-semibold">Șofer</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 text-right font-semibold">Preț</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} onClick={() => router.push(`/firma/curse/${t.id}`)} className="cursor-pointer border-t border-line hover:bg-surface">
                <td className="px-4 py-3 font-semibold text-brand">
                  <Link href={`/firma/curse/${t.id}`}>{t.ecmr?.number}</Link>
                  {t.remarks.length > 0 && <AlertTriangle size={14} className="ml-1.5 inline text-problem" aria-label="are observații" />}
                </td>
                <td className="px-4 py-3 font-semibold">{city(t.loadingAddress)} → {city(t.deliveryAddress)}</td>
                <td className="px-4 py-3 text-muted">{fmtDateTime(t.loadingDate)}</td>
                <td className="px-4 py-3">{t.driver?.fullName}</td>
                <td className="px-4 py-3">{t.client?.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(t.price, t.currency)}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-center text-muted">Nicio cursă cu acest status.</p>}
      </Card>
    </div>
  );
}
