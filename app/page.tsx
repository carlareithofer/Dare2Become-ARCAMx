import Link from "next/link";

// Ecran temporar; alegerea rolului („Sunt șofer” / „Sunt firmă”) vine în etapa 2.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold text-brand dark:text-white">FacturCMR</h1>
      <p className="text-ink-muted dark:text-slate-400">Prototip în lucru.</p>
      <Link href="/componente" className="font-semibold text-brand underline dark:text-white">
        Vezi componentele de bază →
      </Link>
    </main>
  );
}
