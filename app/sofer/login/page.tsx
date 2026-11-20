'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { Button, Input, Logo } from '@/components/ui';
import { loginWithInviteCode } from '@/lib/data';

export default function DriverLogin() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const profile = await loginWithInviteCode(code);
    setBusy(false);
    if (!profile) return setError('Codul nu e valid. Verifică-l sau cere unul nou de la dispecer.');
    router.replace('/sofer');
  };

  return (
    <main className="flex min-h-screen flex-col">
      <div className="bg-brand px-6 pb-10 pt-12 text-white">
        <Logo light className="text-lg" />
        <h1 className="mt-8 text-[28px] font-extrabold leading-tight">Bun venit!</h1>
        <p className="mt-2 text-[16px] text-white/75">Intră cu codul de 6 caractere primit de la firma ta.</p>
      </div>
      <form onSubmit={submit} className="flex flex-1 flex-col gap-4 p-6">
        <label>
          <span className="mb-1.5 flex items-center gap-2 text-[15px] font-semibold"><KeyRound size={18} aria-hidden /> Cod de invitație</span>
          <Input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            maxLength={6}
            autoCapitalize="characters"
            autoComplete="one-time-code"
            placeholder="ex. ION123"
            className="h-16 text-center text-[26px] font-bold tracking-[0.3em]"
          />
        </label>
        {error && <p role="alert" className="rounded-xl bg-problem-soft p-3 text-[15px] font-medium text-problem">{error}</p>}
        <Button type="submit" size="lg" disabled={code.length < 6 || busy}>Intră în aplicație</Button>
        <p className="mt-auto rounded-xl bg-brand-soft p-3 text-[14px] text-ink">
          <b>Demo:</b> folosește codul <b>ION123</b> (Ion Popescu), <b>MIH456</b> sau <b>AND789</b>.
        </p>
      </form>
    </main>
  );
}
