'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Label, Select } from '@/components/ui';
import { createTrip, getDrivers, getPartners, getVehicles } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { bodyTypeLabel } from '@/lib/format';
import type { EcmrGoods } from '@/lib/types';

type GoodsRow = Omit<EcmrGoods, 'id' | 'ecmrId'>;
const emptyGoods: GoodsRow = { description: '', packagesCount: 1, packagingType: 'Europaleți', weightKg: 0, volumeM3: 0 };
const local = (offsetDays: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function NewTrip() {
  const router = useRouter();
  const { data } = useLive(async () => ({ drivers: await getDrivers(), vehicles: await getVehicles(), partners: await getPartners() }), []);
  const [f, setF] = useState({
    clientId: '', senderId: '', consigneeId: '', driverId: '', vehicleId: '',
    loadingDate: local(1, 8), plannedDeliveryDate: local(2, 12), price: '', currency: 'RON',
  });
  const [goods, setGoods] = useState<GoodsRow[]>([{ ...emptyGoods }]);
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setF((x) => ({ ...x, [k]: v, ...(k === 'clientId' && !x.senderId ? { senderId: v } : {}) }));
  };
  const addr = (id: string) => {
    const p = data.partners.find((x) => x.id === id);
    return p ? `${p.address}, ${p.city}${p.country !== 'RO' ? `, ${p.country}` : ''}` : '';
  };
  const setG = (i: number, k: keyof GoodsRow, v: string) =>
    setGoods((g) => g.map((row, j) => (j === i ? { ...row, [k]: ['description', 'packagingType', 'marks'].includes(k) ? v : Number(v) } : row)));

  const valid = f.clientId && f.senderId && f.consigneeId && f.driverId && f.vehicleId && Number(f.price) > 0 && goods.every((g) => g.description.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const id = await createTrip({
      ...f,
      price: Number(f.price),
      loadingAddress: addr(f.senderId),
      deliveryAddress: addr(f.consigneeId),
      loadingDate: new Date(f.loadingDate).toISOString(),
      plannedDeliveryDate: new Date(f.plannedDeliveryDate).toISOString(),
      goods,
    });
    router.push(`/firma/curse/${id}`);
  };

  const partnerOptions = data.partners.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.city})</option>);

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl">
      <h1 className="text-[28px] font-extrabold text-brand dark:text-ink">Cursă nouă</h1>
      <p className="text-muted">Datele de aici completează automat eCMR-ul. Șoferul vede cursa imediat în aplicație.</p>

      <Card className="mt-6 grid gap-4 p-6 md:grid-cols-3">
        <h2 className="text-[16px] font-bold md:col-span-3">Părți</h2>
        <label><Label>Client (cine plătește)</Label><Select value={f.clientId} onChange={set('clientId')} required><option value="">Alege…</option>{partnerOptions}</Select></label>
        <label><Label hint="(căsuța 1)">Expeditor</Label><Select value={f.senderId} onChange={set('senderId')} required><option value="">Alege…</option>{partnerOptions}</Select></label>
        <label><Label hint="(căsuța 2)">Destinatar</Label><Select value={f.consigneeId} onChange={set('consigneeId')} required><option value="">Alege…</option>{partnerOptions}</Select></label>
        {f.senderId && <p className="text-[13px] text-muted md:col-start-2">Încărcare: {addr(f.senderId)}</p>}
        {f.consigneeId && <p className="text-[13px] text-muted md:col-start-3">Livrare: {addr(f.consigneeId)}</p>}
      </Card>

      <Card className="mt-4 grid gap-4 p-6 md:grid-cols-2">
        <h2 className="text-[16px] font-bold md:col-span-2">Program și echipaj</h2>
        <label><Label>Încărcare</Label><Input type="datetime-local" value={f.loadingDate} onChange={set('loadingDate')} required /></label>
        <label><Label>Livrare planificată</Label><Input type="datetime-local" value={f.plannedDeliveryDate} onChange={set('plannedDeliveryDate')} required /></label>
        <label><Label>Șofer</Label><Select value={f.driverId} onChange={set('driverId')} required><option value="">Alege…</option>{data.drivers.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}</Select></label>
        <label><Label>Camion</Label><Select value={f.vehicleId} onChange={set('vehicleId')} required><option value="">Alege…</option>{data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} · {bodyTypeLabel[v.bodyType]} · {(v.capacityKg / 1000).toFixed(0)} t</option>)}</Select></label>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-[16px] font-bold">Marfa <span className="font-normal text-muted">(căsuțele 6–12)</span></h2>
        {goods.map((g, i) => (
          <div key={i} className="mt-4 grid items-end gap-3 md:grid-cols-[2fr_90px_1fr_110px_90px_44px]">
            <label><Label>Natura mărfii</Label><Input value={g.description} onChange={(e) => setG(i, 'description', e.target.value)} placeholder="ex. Piese auto" required /></label>
            <label><Label>Colete</Label><Input type="number" min={1} value={g.packagesCount} onChange={(e) => setG(i, 'packagesCount', e.target.value)} /></label>
            <label><Label>Ambalaj</Label><Input value={g.packagingType} onChange={(e) => setG(i, 'packagingType', e.target.value)} /></label>
            <label><Label>Greutate (kg)</Label><Input type="number" min={0} value={g.weightKg} onChange={(e) => setG(i, 'weightKg', e.target.value)} /></label>
            <label><Label>m³</Label><Input type="number" min={0} value={g.volumeM3} onChange={(e) => setG(i, 'volumeM3', e.target.value)} /></label>
            <button type="button" disabled={goods.length === 1} onClick={() => setGoods((x) => x.filter((_, j) => j !== i))} className="grid h-12 w-11 place-items-center rounded-xl text-muted hover:bg-problem-soft hover:text-problem disabled:opacity-30" aria-label="Șterge rândul"><Trash2 size={18} /></button>
          </div>
        ))}
        <Button type="button" variant="ghost" className="mt-3" onClick={() => setGoods((g) => [...g, { ...emptyGoods }])}><Plus size={17} aria-hidden /> Adaugă încă o marfă</Button>
      </Card>

      <Card className="mt-4 grid gap-4 p-6 md:grid-cols-[1fr_140px]">
        <label><Label>Preț cursă</Label><Input type="number" min={0} value={f.price} onChange={set('price')} placeholder="ex. 2400" required /></label>
        <label><Label>Monedă</Label><Select value={f.currency} onChange={set('currency')}><option>RON</option><option>EUR</option></Select></label>
      </Card>

      <div className="mt-6 flex justify-end gap-3 pb-10">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Renunță</Button>
        <Button type="submit" disabled={!valid || busy}>Creează cursa și eCMR-ul</Button>
      </div>
    </form>
  );
}
