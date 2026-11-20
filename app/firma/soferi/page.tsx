'use client';
import { useState } from 'react';
import { Copy, KeyRound, Phone, Truck } from 'lucide-react';
import { Button, Card, StatusBadge } from '@/components/ui';
import { createInviteCode, getDrivers, getTrips } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { city } from '@/lib/format';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function Drivers() {
  const { data } = useLive(async () => ({ drivers: await getDrivers(), trips: await getTrips() }), []);
  const [code, setCode] = useState<string | null>(null);
  if (!data) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-brand">Șoferi</h1>
          <p className="text-muted">Șoferii intră în aplicație cu un cod de invitație, fără parolă.</p>
        </div>
        <Button onClick={async () => setCode(await createInviteCode())}><KeyRound size={17} aria-hidden /> Invită un șofer</Button>
      </div>

      {code && (
        <Card className="mt-5 flex flex-wrap items-center gap-4 border-2 border-accent p-5">
          <div>
            <p className="text-[14px] text-muted">Trimite-i șoferului acest cod (valabil 7 zile):</p>
            <p className="text-[32px] font-extrabold tracking-[0.25em] text-brand">{code}</p>
          </div>
          <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(code)}><Copy size={16} aria-hidden /> Copiază</Button>
        </Card>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.drivers.map((d) => {
          const mine = data.trips.filter((t) => t.driverId === d.id);
          const current = mine.find((t) => ['in_progress', 'loaded'].includes(t.status)) ?? mine.find((t) => t.status === 'planned');
          return (
            <Card key={d.id} className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-[17px] font-bold text-white">{d.fullName.split(' ').map((x) => x[0]).join('')}</span>
                <div>
                  <p className="text-[17px] font-bold">{d.fullName}</p>
                  <p className="flex items-center gap-1 text-[13px] text-muted"><Phone size={13} aria-hidden /> {d.phone}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-surface p-3">
                {current ? (
                  <>
                    <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[13px] text-muted"><Truck size={14} aria-hidden /> {current.status === 'planned' ? 'Următoarea cursă' : 'Cursa curentă'}</span><StatusBadge status={current.status} /></div>
                    <p className="mt-1 font-semibold">{city(current.loadingAddress)} → {city(current.deliveryAddress)}</p>
                  </>
                ) : <p className="text-[14px] text-muted">Nicio cursă planificată</p>}
              </div>
              <p className="mt-3 text-[13px] text-muted">{plural(mine.filter((t) => ['delivered', 'invoiced'].includes(t.status)).length, 'cursă finalizată', 'curse finalizate')} · {mine.length} în total</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
