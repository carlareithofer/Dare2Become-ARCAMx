import type { ReactNode } from "react";

/** Bara de jos cu butonul principal al ecranului (aplicația șoferului). Lasă loc în pagină cu `pb-28`. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-surface-card/95 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur dark:border-slate-800 dark:bg-brand-dark/95">
      <div className="mx-auto flex max-w-md flex-col gap-2 px-4 pt-3">{children}</div>
    </div>
  );
}
