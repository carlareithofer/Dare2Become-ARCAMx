'use client';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { CheckCircle2, CircleDashed, FileCheck2, PackageCheck, Truck, XCircle } from 'lucide-react';
import type { TripStatus } from '@/lib/types';
import { statusLabel } from '@/lib/format';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const variants: Record<Variant, string> = {
  // text bleumarin pe portocaliu: contrast 5,5:1 (alb ar avea doar 2,6:1)
  primary: 'bg-accent text-brand hover:bg-accent-pressed active:bg-accent-pressed font-bold',
  secondary: 'bg-card text-ink border-2 border-line hover:border-muted font-semibold',
  ghost: 'bg-transparent text-ink hover:bg-brand-soft font-semibold',
  danger: 'bg-problem text-white dark:text-brand hover:opacity-90 font-semibold',
};
const sizes = { md: 'h-11 px-4 text-[15px] rounded-xl', lg: 'h-14 px-5 text-[17px] rounded-2xl w-full' };

export function Button({
  variant = 'primary', size = 'md', className, ...p
}: ComponentProps<'button'> & { variant?: Variant; size?: keyof typeof sizes }) {
  return (
    <button
      {...p}
      className={cx('inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
    />
  );
}

export function LinkButton({
  variant = 'primary', size = 'md', className, ...p
}: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof sizes }) {
  return <Link {...p} className={cx('inline-flex items-center justify-center gap-2 transition-colors', variants[variant], sizes[size], className)} />;
}

export function Card({ className, ...p }: ComponentProps<'div'>) {
  return <div {...p} className={cx('bg-card rounded-2xl border border-line', className)} />;
}

const statusStyle: Record<TripStatus, { cls: string; Icon: typeof Truck }> = {
  planned: { cls: 'bg-planned-soft text-planned', Icon: CircleDashed },
  in_progress: { cls: 'bg-progress-soft text-progress', Icon: Truck },
  loaded: { cls: 'bg-brand-soft text-brand dark:text-ink', Icon: PackageCheck },
  delivered: { cls: 'bg-ok-soft text-ok', Icon: CheckCircle2 },
  invoiced: { cls: 'bg-ok-soft text-ok', Icon: FileCheck2 },
  cancelled: { cls: 'bg-problem-soft text-problem', Icon: XCircle },
};

/** Statusul are mereu text + iconiță, nu doar culoare. */
export function StatusBadge({ status, className }: { status: TripStatus; className?: string }) {
  const { cls, Icon } = statusStyle[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap', cls, className)}>
      <Icon size={15} aria-hidden />
      {statusLabel[status]}
    </span>
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 block text-[14px] font-semibold text-ink">
      {children} {hint && <span className="font-normal text-muted">{hint}</span>}
    </span>
  );
}

const field = 'w-full rounded-xl border-2 border-line bg-card px-3.5 text-[16px] text-ink outline-none focus:border-brand dark:focus:border-accent';

export function Input(p: ComponentProps<'input'>) {
  return <input {...p} className={cx(field, 'h-12', p.className)} />;
}
export function Select(p: ComponentProps<'select'>) {
  return <select {...p} className={cx(field, 'h-12', p.className)} />;
}
export function Textarea(p: ComponentProps<'textarea'>) {
  return <textarea {...p} className={cx(field, 'py-3 min-h-24', p.className)} />;
}

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-extrabold tracking-tight', light ? 'text-white' : 'text-brand dark:text-ink', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-brand">
        <Truck size={18} strokeWidth={2.5} aria-hidden />
      </span>
      FacturCMR
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border-2 border-dashed border-line p-6 text-center text-muted">{children}</p>;
}

export { cx };
