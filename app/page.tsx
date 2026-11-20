import Link from 'next/link';
import { Building2, ChevronRight, Smartphone } from 'lucide-react';
import { Logo } from '@/components/ui';

// Pagina de start a prototipului: alegi din ce rol vrei să vezi aplicația.
export default function Home() {
  return (
    <main className="min-h-screen bg-brand px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Logo light className="text-xl" />
        <h1 className="mt-10 text-[34px] font-extrabold leading-tight sm:text-[44px]">
          eCMR completat și semnat pe telefon.
          <span className="block text-accent">De la livrare la factură, în aceeași zi.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[17px] text-white/75">
          Prototip demo. Alege cum vrei să intri în platformă.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/sofer" className="group rounded-2xl bg-white p-6 text-ink transition hover:-translate-y-0.5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-brand"><Smartphone aria-hidden /></span>
            <span className="mt-4 flex items-center justify-between text-[20px] font-bold">Sunt șofer <ChevronRight className="text-muted group-hover:text-ink" aria-hidden /></span>
            <span className="mt-1 block text-[15px] text-muted">Aplicația de pe telefon: cursele mele, încărcare, livrare, semnătura destinatarului.</span>
          </Link>
          <Link href="/firma" className="group rounded-2xl bg-white p-6 text-ink transition hover:-translate-y-0.5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white"><Building2 aria-hidden /></span>
            <span className="mt-4 flex items-center justify-between text-[20px] font-bold">Sunt firmă de transport <ChevronRight className="text-muted group-hover:text-ink" aria-hidden /></span>
            <span className="mt-1 block text-[15px] text-muted">Dashboard-ul de pe laptop: curse, eCMR-uri, șoferi, calendar.</span>
          </Link>
        </div>
        <p className="mt-8 text-[13px] text-white/50">Datele sunt fictive și se salvează doar în acest browser.</p>
      </div>
    </main>
  );
}
