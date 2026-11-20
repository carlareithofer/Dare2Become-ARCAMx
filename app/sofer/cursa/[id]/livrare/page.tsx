'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, Check, CheckCircle2, Loader2, ThumbsUp } from 'lucide-react';
import { BottomAction, DriverHeader } from '@/components/DriverHeader';
import { PhotoPicker } from '@/components/PhotoPicker';
import { SignaturePad } from '@/components/SignaturePad';
import { Button, Card, Input, Label, LinkButton, Textarea, cx } from '@/components/ui';
import { getCurrentDriverId, getTrip, submitDelivery } from '@/lib/data';
import { useLive } from '@/lib/useLive';
import { getLocation } from '@/lib/geo';
import { remarkLabel } from '@/lib/format';
import type { RemarkCategory } from '@/lib/types';

const categories = Object.keys(remarkLabel) as RemarkCategory[];
type Step = 'check' | 'remarks' | 'sign' | 'done';

/** Livrarea, în pași: marfa e ok? → observații + poze → semnătura destinatarului → gata. */
export default function DeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const { data: trip } = useLive(() => getTrip(id), [id]);
  const [step, setStep] = useState<Step>('check');
  const [goodsOk, setGoodsOk] = useState(true);
  const [selected, setSelected] = useState<RemarkCategory[]>([]);
  const [otherText, setOtherText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!trip) return <DriverHeader title="Livrare" back={`/sofer/cursa/${id}`} />;

  const back = step === 'remarks' ? () => setStep('check') : step === 'sign' ? () => setStep(goodsOk ? 'check' : 'remarks') : undefined;
  const stepNo = { check: 1, remarks: 2, sign: 3, done: 3 }[step];

  const toggle = (c: RemarkCategory) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const finish = async () => {
    setBusy(true);
    const loc = await getLocation();
    await submitDelivery(trip.id, {
      goodsOk,
      remarks: goodsOk ? [] : selected.map((c) => ({ category: c, details: c === 'other' ? otherText.trim() : undefined })),
      photos,
      consignee: { signerName: `${name.trim()} (${trip.consignee?.name})`, signatureUrl: sig!, ...loc },
    }, getCurrentDriverId() ?? trip.driverId);
    setBusy(false);
    setStep('done');
  };

  if (step === 'done') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-ok text-white dark:text-brand"><CheckCircle2 size={56} aria-hidden /></span>
        <h1 className="text-[26px] font-extrabold">Livrare înregistrată</h1>
        <p className="text-[16px] text-muted">eCMR-ul {trip.ecmr?.number} a fost semnat și trimis la firmă. Factura se poate emite chiar azi.</p>
        <div className="mt-4 flex w-full flex-col gap-3">
          <LinkButton size="lg" href="/sofer">Înapoi la cursele mele</LinkButton>
          <LinkButton size="lg" variant="secondary" href={`/sofer/cursa/${trip.id}`}>Vezi eCMR-ul</LinkButton>
        </div>
      </main>
    );
  }

  return (
    <main>
      <DriverHeader
        title="Înregistrează livrarea"
        back={back ? undefined : `/sofer/cursa/${id}`}
        right={<span className="pr-2 text-[14px] text-white/75">Pasul {stepNo} din 3</span>}
      />
      {back && (
        <button onClick={back} className="px-4 pt-3 text-[15px] font-semibold text-muted">← Pasul anterior</button>
      )}

      {step === 'check' && (
        <div className="flex flex-col gap-4 p-4">
          <h2 className="text-[22px] font-bold">Marfa a ajuns în regulă?</h2>
          <p className="text-[15px] text-muted">Verificați împreună cu destinatarul ({trip.consignee?.name}).</p>
          <button
            onClick={() => { setGoodsOk(true); setSelected([]); setStep('sign'); }}
            className="flex min-h-24 items-center gap-4 rounded-2xl border-2 border-ok bg-ok-soft p-4 text-left"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ok text-white dark:text-brand"><ThumbsUp aria-hidden /></span>
            <span><span className="block text-[19px] font-bold text-ok">Da, totul e în regulă</span><span className="text-[14px] text-ink">Fără observații</span></span>
          </button>
          <button
            onClick={() => { setGoodsOk(false); setStep('remarks'); }}
            className="flex min-h-24 items-center gap-4 rounded-2xl border-2 border-progress bg-progress-soft p-4 text-left"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-progress text-white dark:text-brand"><AlertTriangle aria-hidden /></span>
            <span><span className="block text-[19px] font-bold text-progress">Am observații</span><span className="text-[14px] text-ink">Lipsuri, deteriorări, întârziere</span></span>
          </button>
          <div className="mt-2">
            <Label hint="(opțional)">Poze cu marfa la descărcare</Label>
            <PhotoPicker photos={photos} onChange={setPhotos} />
          </div>
        </div>
      )}

      {step === 'remarks' && (
        <div className="flex flex-col gap-4 p-4">
          <h2 className="text-[22px] font-bold">Ce observații sunt?</h2>
          <p className="text-[15px] text-muted">Alege tot ce se aplică.</p>
          <div className="flex flex-col gap-2">
            {categories.map((c) => {
              const on = selected.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggle(c)}
                  aria-pressed={on}
                  className={cx('flex h-14 items-center gap-3 rounded-2xl border-2 px-4 text-left text-[17px] font-semibold', on ? 'border-brand bg-brand-soft dark:border-accent' : 'border-line bg-card')}
                >
                  <span className={cx('grid h-7 w-7 place-items-center rounded-md border-2', on ? 'border-brand bg-brand text-white dark:border-accent dark:bg-accent dark:text-brand' : 'border-muted')}>
                    {on && <Check size={18} strokeWidth={3} aria-hidden />}
                  </span>
                  {remarkLabel[c]}
                </button>
              );
            })}
          </div>
          {selected.includes('other') && (
            <label>
              <Label>Descrie pe scurt</Label>
              <Textarea value={otherText} onChange={(e) => setOtherText(e.target.value)} placeholder="ex. livrat la altă rampă" />
            </label>
          )}
          <div>
            <Label hint="(recomandat)">Poze ca dovadă</Label>
            <PhotoPicker photos={photos} onChange={setPhotos} />
          </div>
        </div>
      )}

      {step === 'sign' && (
        <div className="flex flex-col gap-5 p-4">
          <h2 className="text-[22px] font-bold">Semnătura destinatarului</h2>
          <Card className="p-4 text-[15px]">
            <p><b>{trip.consignee?.name}</b> confirmă primirea mărfii{goodsOk ? ' fără observații.' : ' cu observațiile:'}</p>
            {!goodsOk && (
              <ul className="mt-2 list-disc pl-5">
                {selected.map((c) => <li key={c}>{remarkLabel[c]}{c === 'other' && otherText ? `: ${otherText}` : ''}</li>)}
              </ul>
            )}
            {photos.length > 0 && <p className="mt-2 text-muted">{photos.length} {photos.length === 1 ? 'poză atașată' : 'poze atașate'}</p>}
          </Card>
          <label>
            <Label>Numele persoanei care primește marfa</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Ana Varga" autoComplete="name" />
          </label>
          <div>
            <Label hint="(căsuța 24)">Semnătura</Label>
            <SignaturePad onChange={setSig} />
          </div>
          <p className="text-[13px] text-muted">
            La semnare se salvează ora, locația și amprenta documentului. <Link href={`/sofer/cursa/${id}`} className="underline">Vezi eCMR-ul</Link>
          </p>
        </div>
      )}

      <BottomAction>
        {step === 'remarks' && (
          <Button size="lg" disabled={selected.length === 0 || (selected.includes('other') && !otherText.trim())} onClick={() => setStep('sign')}>
            Continuă spre semnătură
          </Button>
        )}
        {step === 'sign' && (
          <Button size="lg" disabled={!name.trim() || !sig || busy} onClick={finish}>
            {busy && <Loader2 className="animate-spin" aria-hidden />} Semnează și finalizează
          </Button>
        )}
        {step === 'check' && <p className="text-center text-[14px] text-muted">Alege o variantă de mai sus</p>}
      </BottomAction>
    </main>
  );
}
