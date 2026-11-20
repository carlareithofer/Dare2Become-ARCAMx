'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, Circle, FileCheck2, Printer } from 'lucide-react';
import { EcmrView } from '@/components/EcmrView';
import { Button, Card, StatusBadge, cx } from '@/components/ui';
import { approveForInvoicing, getCompany, getTrip } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { city, fmtDateTime, fmtMoney, remarkLabel } from '@/lib/format';

export default function FirmTripDetail() {
  const { id } = useParams<{ id: string }>();
  const { data } = useLive(async () => ({ trip: await getTrip(id), company: await getCompany() }), [id]);
  if (!data) return null;
  const { trip, company } = data;
  if (!trip) return <p>Cursa nu există. <Link href="/firma" className="underline">Înapoi</Link></p>;

  const sig = (p: string) => trip.signatures.find((s) => s.party === p);
  const timeline = [
    { label: 'Cursă creată, eCMR emis', at: trip.ecmr?.issuedAt, done: true },
    { label: 'Marfă încărcată, semnat de expeditor', at: sig('sender')?.signedAt, done: !!sig('sender') },
    { label: 'Marfă livrată, semnat de destinatar', at: sig('consignee')?.signedAt, done: !!sig('consignee') },
    { label: 'Aprobat pentru facturare', at: trip.ecmr?.closedAt, done: trip.status === 'invoiced' },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/firma" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden /> Toate cursele</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold text-brand">{city(trip.loadingAddress)} → {city(trip.deliveryAddress)}</h1>
          <p className="text-muted">{trip.ecmr?.number} · {trip.driver?.fullName} · {trip.vehicle?.plateNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={trip.status} />
          <Button variant="secondary" onClick={() => window.print()}><Printer size={17} aria-hidden /> PDF</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-4">
          {trip.status === 'delivered' && (
            <Card className="border-2 border-accent p-5">
              <h2 className="flex items-center gap-2 text-[17px] font-bold"><FileCheck2 className="text-accent-pressed" aria-hidden /> Gata de facturare</h2>
              <p className="mt-1 text-[14px] text-muted">Datele sunt preluate din eCMR. Verifică și aprobă.</p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14px]">
                <dt className="text-muted">Client</dt><dd className="font-semibold">{trip.client?.name}</dd>
                <dt className="text-muted">CUI</dt><dd>{trip.client?.vatCode}</dd>
                <dt className="text-muted">Serviciu</dt><dd>Transport {city(trip.loadingAddress)} – {city(trip.deliveryAddress)}</dd>
                <dt className="text-muted">eCMR</dt><dd>{trip.ecmr?.number}</dd>
                <dt className="text-muted">Valoare</dt><dd className="text-[18px] font-extrabold text-brand">{fmtMoney(trip.price, trip.currency)}</dd>
              </dl>
              {trip.remarks.length > 0 && (
                <p className="mt-3 flex gap-2 rounded-xl bg-problem-soft p-3 text-[13px] text-problem">
                  <AlertTriangle size={16} className="shrink-0" aria-hidden /> Livrarea are observații. Verifică înainte de facturare.
                </p>
              )}
              <Button className="mt-4 w-full" onClick={() => approveForInvoicing(trip.id)}>Aprobă pentru facturare</Button>
              <p className="mt-2 text-center text-[12px] text-muted">Trimiterea în SmartBill / e-Factura vine în versiunea 2.</p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-[15px] font-bold">Istoric</h2>
            <ol className="mt-3 flex flex-col gap-3">
              {timeline.map((s) => (
                <li key={s.label} className="flex gap-3">
                  {s.done ? <CheckCircle2 size={20} className="shrink-0 text-ok" aria-hidden /> : <Circle size={20} className="shrink-0 text-line" aria-hidden />}
                  <span>
                    <span className={cx('block text-[14px] font-semibold', !s.done && 'text-muted')}>{s.label}</span>
                    {s.done && s.at && <span className="text-[13px] text-muted">{fmtDateTime(s.at)}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5 text-[14px]">
            <h2 className="text-[15px] font-bold">Detalii cursă</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              <dt className="text-muted">Client</dt><dd>{trip.client?.name}</dd>
              <dt className="text-muted">Preț</dt><dd>{fmtMoney(trip.price, trip.currency)}</dd>
              <dt className="text-muted">Șofer</dt><dd>{trip.driver?.fullName}<br /><span className="text-muted">{trip.driver?.phone}</span></dd>
              <dt className="text-muted">Livrare</dt><dd>{fmtDateTime(trip.plannedDeliveryDate)}</dd>
            </dl>
          </Card>

          {(trip.remarks.length > 0 || trip.photos.length > 0) && (
            <Card className="p-5">
              <h2 className="text-[15px] font-bold">Observații și poze de la livrare</h2>
              {trip.remarks.map((r) => (
                <p key={r.id} className="mt-2 flex gap-2 text-[14px]"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-problem" aria-hidden /><span><b>{remarkLabel[r.category]}</b>{r.details ? `: ${r.details}` : ''}</span></p>
              ))}
              {trip.photos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {trip.photos.map((p) => <a key={p.id} href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt="Poză de la livrare" className="aspect-square w-full rounded-lg object-cover" /></a>)}
                </div>
              )}
            </Card>
          )}
        </div>

        <EcmrView trip={trip} company={company} />
      </div>
    </div>
  );
}
