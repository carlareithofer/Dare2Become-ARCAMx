// Mock store în localStorage. Folosit DOAR de lib/data/ – UI-ul nu-l importă direct.
// Când vine Supabase, fișierul ăsta (și seed.ts) dispar.
import type {
  Company,
  Ecmr,
  EcmrGoods,
  Partner,
  Photo,
  Profile,
  Remark,
  Signature,
  Trip,
  Vehicle,
} from "../types";
import { buildSeed } from "./seed";

/** Cod de invitație pentru șoferi. Nu e (încă) în schema din types.ts – vezi lib/data/invites.ts. */
export interface DriverInvite {
  id: string;
  companyId: string;
  code: string; // 6 caractere, ex. „K7M2QX”
  fullName: string;
  phone: string;
  profileId?: string; // dacă șoferul are deja profil
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

export interface MockDb {
  companies: Company[];
  profiles: Profile[];
  vehicles: Vehicle[];
  partners: Partner[];
  trips: Trip[];
  ecmrs: Ecmr[];
  goods: EcmrGoods[];
  signatures: Signature[];
  remarks: Remark[];
  photos: Photo[];
  invites: DriverInvite[];
}

const DB_KEY = "facturcmr:db:v1";
let cache: MockDb | null = null;

const isBrowser = () => typeof window !== "undefined";

/** Citește baza mock (din cache, localStorage sau seed). */
export function readDb(): MockDb {
  if (cache) return cache;
  if (!isBrowser()) return buildSeed(); // pe server nu persistăm nimic
  const raw = window.localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      cache = JSON.parse(raw) as MockDb;
      return cache;
    } catch {
      // date corupte → reîncărcăm seed-ul
    }
  }
  cache = buildSeed();
  writeDb(cache);
  return cache;
}

/** Aplică o modificare și salvează. Întoarce rezultatul funcției. */
export function mutateDb<T>(fn: (db: MockDb) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}

function writeDb(db: MockDb) {
  cache = db;
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // De obicei QuotaExceededError (prea multe poze în localStorage).
    throw new Error("Memoria telefonului pentru demo e plină. Resetează datele demo.");
  }
}

/** Șterge tot și reîncarcă datele fictive. */
export function resetDb() {
  cache = null;
  if (isBrowser()) window.localStorage.removeItem(DB_KEY);
  readDb();
}

/** Id unic. crypto.randomUUID există doar pe HTTPS/localhost, deci avem și fallback (ex. telefon pe http://192.168…). */
export function newId(prefix = ""): string {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/** Simulează latența rețelei, ca stările de încărcare să fie vizibile. */
export function delay(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Copie profundă, ca UI-ul să nu modifice din greșeală obiectele din store. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
