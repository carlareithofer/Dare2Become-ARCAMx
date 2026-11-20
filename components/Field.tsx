import type { ReactNode } from "react";

/** Etichetă + mesaj de ajutor/eroare în jurul unui câmp. Folosit de Input și Select. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-ink dark:text-slate-100">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="text-sm font-medium text-status-problem">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-sm text-ink-muted dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const fieldControlClass =
  "min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-base text-ink " +
  "placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent/40 " +
  "aria-[invalid=true]:border-status-problem dark:border-slate-600 dark:bg-slate-900 dark:text-white";
