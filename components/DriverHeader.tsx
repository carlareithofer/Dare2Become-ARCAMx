'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';

/** Bara de sus din aplicația șoferului. */
export function DriverHeader({ title, back, right }: { title: ReactNode; back?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-brand px-3 text-white">
      {back ? (
        <Link href={back} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Înapoi">
          <ArrowLeft />
        </Link>
      ) : <span className="w-2" />}
      <h1 className="flex-1 truncate text-[18px] font-bold">{title}</h1>
      <ThemeToggle className="h-11 w-11 shrink-0 justify-center rounded-full hover:bg-white/10" />
      {right}
    </header>
  );
}

/** Butonul principal, fixat jos pe ecran (ușor de atins cu degetul mare). */
export function BottomAction({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-28" />
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line bg-card/95 p-4 backdrop-blur" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {children}
      </div>
    </>
  );
}
