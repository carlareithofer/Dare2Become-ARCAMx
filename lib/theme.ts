// Tema aplicației: Automat (urmează sistemul) → Luminos → Întunecat.
// Alegerea e comună pentru aplicația șoferului și dashboard-ul firmei.

export type ThemeMode = 'auto' | 'light' | 'dark';

export const THEME_KEY = 'facturcmr-theme';
const CHANGE_EVENT = 'facturcmr-theme-change';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export const themeLabel: Record<ThemeMode, string> = { auto: 'Automat', light: 'Luminos', dark: 'Întunecat' };

const next: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' };
export const nextTheme = (mode: ThemeMode) => next[mode];

const isMode = (v: unknown): v is ThemeMode => v === 'auto' || v === 'light' || v === 'dark';

export function getTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isMode(v) ? v : 'auto';
  } catch {
    return 'auto';
  }
}

/** Pune sau scoate clasa `dark` pe <html>, după alegere (sau după sistem, în modul Automat). */
export function applyTheme(mode: ThemeMode = getTheme()) {
  const dark = mode === 'dark' || (mode === 'auto' && window.matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
}

export function setTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {}
  applyTheme(mode);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Pentru useSyncExternalStore: anunță la schimbarea temei (și din alt tab). */
export function subscribeTheme(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === THEME_KEY && cb();
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** Rulează înainte de prima afișare (în <head>), ca să nu „clipească” tema. Aceeași logică ca applyTheme. */
export const themeScript = `(function(){try{var m=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=m==="dark"||(m!=="light"&&window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export const darkQuery = DARK_QUERY;
