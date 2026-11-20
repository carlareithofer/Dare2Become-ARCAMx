'use client';
import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { applyTheme, darkQuery, getTheme, nextTheme, setTheme, subscribeTheme, themeLabel, type ThemeMode } from '@/lib/theme';
import { cx } from './ui';

const icons: Record<ThemeMode, typeof Sun> = { auto: Monitor, light: Sun, dark: Moon };

const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme, () => 'auto' as ThemeMode);

/**
 * Pus o singură dată în layout-ul principal: reaplică tema după ce React reface <html>
 * (în dezvoltare) și, în modul Automat, urmează schimbarea temei sistemului.
 */
export function ThemeSync() {
  const mode = useTheme();
  useLayoutEffect(() => applyTheme(mode), [mode]);
  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia(darkQuery);
    const onChange = () => applyTheme('auto');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);
  return null;
}

/** Buton care schimbă tema: Automat → Luminos → Întunecat → Automat. */
export function ThemeToggle({ className, size = 20, showLabel = false }: { className?: string; size?: number; showLabel?: boolean }) {
  const mode = useTheme();
  const Icon = icons[mode];
  const label = `Temă: ${themeLabel[mode]}`;
  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme(mode))}
      aria-label={label}
      title={label}
      className={cx('inline-flex items-center', className)}
    >
      <Icon size={size} aria-hidden />
      {showLabel && <span>{label}</span>}
    </button>
  );
}
