'use client';
// „Baza de date” fictivă a prototipului: ține totul în localStorage-ul browserului.
// Răzvan o va înlocui cu Supabase; restul aplicației folosește doar funcțiile din lib/data/index.ts.
import { buildSeed, type Db } from '@/lib/mock/seed';

const KEY = 'facturcmr-db-v1';
const EVENT = 'facturcmr:update';
let cache: Db | null = null;

export function readDb(): Db {
  if (cache) return cache;
  if (typeof window === 'undefined') return buildSeed();
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      cache = JSON.parse(raw) as Db;
      return cache;
    } catch {
      /* date corupte: refacem seed-ul */
    }
  }
  cache = buildSeed();
  window.localStorage.setItem(KEY, JSON.stringify(cache));
  return cache;
}

export function writeDb(mutate: (db: Db) => void) {
  const db = readDb();
  mutate(db);
  cache = db;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // localStorage plin (de obicei din cauza pozelor): păstrăm datele doar în memorie.
    console.warn('Spațiul local e plin; modificările rămân doar până la reîncărcarea paginii.');
  }
  window.dispatchEvent(new Event(EVENT));
}

export function resetDb() {
  cache = buildSeed();
  window.localStorage.setItem(KEY, JSON.stringify(cache));
  window.dispatchEvent(new Event(EVENT));
}

export function onDbChange(cb: () => void) {
  const storage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null; // alt tab a modificat datele
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', storage);
  };
}

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
