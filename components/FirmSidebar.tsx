'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutList, Plus, RotateCcw, Users } from 'lucide-react';
import { Logo, cx } from './ui';
import { resetDemoData } from '@/lib/data';
import { ThemeToggle } from './ThemeToggle';

const items = [
  { href: '/firma', label: 'Curse', Icon: LayoutList },
  { href: '/firma/calendar', label: 'Calendar', Icon: CalendarDays },
  { href: '/firma/soferi', label: 'Șoferi', Icon: Users },
];

export function FirmSidebar() {
  const path = usePathname();
  const active = (href: string) => (href === '/firma' ? path === '/firma' || path.startsWith('/firma/curse') : path.startsWith(href));
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-brand px-3 py-5 text-white">
      <Link href="/" className="px-2"><Logo light /></Link>
      <Link href="/firma/curse/noua" className="mt-8 flex h-11 items-center justify-center gap-2 rounded-xl bg-accent font-bold text-brand hover:bg-accent-pressed">
        <Plus size={18} aria-hidden /> Cursă nouă
      </Link>
      <nav className="mt-6 flex flex-col gap-1">
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cx('flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold', active(href) ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')}
          >
            <Icon size={18} aria-hidden /> {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-xl bg-white/5 p-3 text-[13px] text-white/70">
        <p className="font-semibold text-white">Trans Exemplu SRL</p>
        <p>Elena Ionescu · Admin</p>
        <div className="mt-2 flex items-center justify-between gap-1">
          <button onClick={() => confirm('Refaci datele demo? Modificările făcute se pierd.') && resetDemoData()} className="inline-flex items-center gap-1.5 whitespace-nowrap text-white/60 hover:text-white">
            <RotateCcw size={13} aria-hidden /> Resetează datele demo
          </button>
          <ThemeToggle size={16} className="-mr-1 h-8 w-8 shrink-0 justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" />
        </div>
      </div>
    </aside>
  );
}
