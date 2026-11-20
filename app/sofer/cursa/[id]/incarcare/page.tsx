'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Package } from 'lucide-react';
import { BottomAction, DriverHeader } from '@/components/DriverHeader';
import { SignaturePad } from '@/components/SignaturePad';
import { Button, Card, Input, Label } from '@/components/ui';
import { getCurrentDriverId, getTrip, submitLoading } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { getLocation } from '@/lib/geo';

/** Încărcarea: expeditorul verifică marfa și semnează pe telefonul șoferului. */
export default function LoadingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: trip } = useLive(() => getTrip(id), [id]);
  const [name, setName] = useState('');
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!trip) return <DriverHeader title="Încărcare" back={`/sofer/cursa/${id}`} />;

  const submit = async () => {
    setBusy(true);
    const loc = await getLocation();
    await submitLoading(trip.id, { signerName: `${name.trim()} (${trip.sender?.name})`, signatureUrl: sig!, ...loc }, getCurrentDriverId() ?? trip.driverId);
    router.replace(`/sofer/cursa/${trip.id}`);
  };

  return (
    <main>
      <DriverHeader title="Confirmă încărcarea" back={`/sofer/cursa/${id}`} />
      <div className="flex flex-col gap-5 p-4">
        <Card className="p-4">
          <p className="text-[14px] text-muted">Dă telefonul expeditorului ca să verifice marfa și să semneze.</p>
          {trip.goods.map((g) => (
            <div key={g.id} className="mt-3 flex gap-3">
              <Package className="shrink-0 text-muted" aria-hidden />
              <div>
                <p className="text-[16px] font-semibold">{g.description}</p>
                <p className="text-[14px] text-muted">{g.packagesCount} × {g.packagingType} · {g.weightKg.toLocaleString('ro-RO')} kg</p>
              </div>
            </div>
          ))}
          <p className="mt-3 border-t border-line pt-3 text-[15px]"><b>Expeditor:</b> {trip.sender?.name}</p>
        </Card>

        <label>
          <Label>Numele persoanei care predă marfa</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Gheorghe Marin" autoComplete="name" />
        </label>

        <div>
          <Label hint="(căsuța 22)">Semnătura expeditorului</Label>
          <SignaturePad onChange={setSig} />
        </div>
      </div>
      <BottomAction>
        <Button size="lg" disabled={!name.trim() || !sig || busy} onClick={submit}>
          {busy ? <Loader2 className="animate-spin" aria-hidden /> : null} Confirmă încărcarea
        </Button>
      </BottomAction>
    </main>
  );
}
