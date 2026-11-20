import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Antetul aplicației șoferului: bleumarin, lipit sus, cu buton „Înapoi” opțional. */
export function AppHeader({ title, subtitle, backHref, action }: { title: string; subtitle?: string; backHref?: string; action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 bg-brand pt-[env(safe-area-inset-top)] text-white dark:bg-brand-dark dark:border-b dark:border-slate-800">
      <div className="mx-auto flex min-h-16 max-w-md items-center gap-2 px-3">
        {backHref && (
          <Link href={backHref} className="-ml-1 flex size-12 items-center justify-center rounded-xl hover:bg-white/10" aria-label="Înapoi">
            <ChevronLeft className="size-7" aria-hidden />
          </Link>
        )}
        <div className="min-w-0 flex-1 py-2">
          <h1 className="truncate text-xl font-bold">{title}</h1>
          {subtitle && <p className="truncate text-sm text-slate-300">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
