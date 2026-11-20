// Funcții pure pentru eCMR (fără acces la date) – folosite și de mock, și (opțional) de Supabase.
import type { Company, EcmrGoods, Partner, Profile, Trip, Vehicle } from "./types";

/** FCMR-2026-000123 */
export function formatEcmrNumber(year: number, seq: number): string {
  return `FCMR-${year}-${String(seq).padStart(6, "0")}`;
}

/** Următorul număr eCMR, pornind de la numerele existente. */
export function nextEcmrNumber(existing: string[], now = new Date()): string {
  const year = now.getFullYear();
  const prefix = `FCMR-${year}-`;
  const max = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => Number(n.slice(prefix.length)))
    .reduce((a, b) => Math.max(a, b), 0);
  return formatEcmrNumber(year, max + 1);
}

export interface EcmrSnapshotInput {
  trip: Trip;
  carrier: Company;
  client: Partner;
  sender: Partner;
  consignee: Partner;
  driver: Profile;
  vehicle: Vehicle;
  goods: Omit<EcmrGoods, "id" | "ecmrId">[];
}

interface SnapshotParty {
  name: string;
  vatCode: string;
  address: string;
  city?: string;
  country: string;
  regNumber?: string;
}

/** Forma lui Ecmr.snapshot (în DB e JSON liber; aici îl tipizăm pentru afișare). */
export interface EcmrSnapshot {
  sender: SnapshotParty;
  consignee: SnapshotParty;
  client: SnapshotParty;
  carrier: SnapshotParty;
  driverName: string;
  plateNumber: string;
  trailerPlate: string | null;
  loadingAddress: string;
  loadingDate: string;
  deliveryAddress: string;
  plannedDeliveryDate: string;
  goods: Omit<EcmrGoods, "id" | "ecmrId">[];
}

/** Citește snapshot-ul eCMR (presupunem că a fost creat cu buildEcmrSnapshot). */
export function readEcmrSnapshot(snapshot: Record<string, unknown>): EcmrSnapshot {
  return snapshot as unknown as EcmrSnapshot;
}

/**
 * Copia datelor la momentul emiterii eCMR-ului.
 * Așa documentul rămâne la fel chiar dacă se editează ulterior partenerii sau camionul.
 */
export function buildEcmrSnapshot(i: EcmrSnapshotInput): Record<string, unknown> {
  const party = (p: Partner) => ({
    name: p.name,
    vatCode: p.vatCode,
    address: p.address,
    city: p.city,
    country: p.country,
  });
  const snapshot: EcmrSnapshot = {
    sender: party(i.sender),
    consignee: party(i.consignee),
    client: party(i.client),
    carrier: {
      name: i.carrier.name,
      vatCode: i.carrier.vatCode,
      regNumber: i.carrier.regNumber,
      address: i.carrier.address,
      country: i.carrier.country,
    },
    driverName: i.driver.fullName,
    plateNumber: i.vehicle.plateNumber,
    trailerPlate: i.vehicle.trailerPlate ?? null,
    loadingAddress: i.trip.loadingAddress,
    loadingDate: i.trip.loadingDate,
    deliveryAddress: i.trip.deliveryAddress,
    plannedDeliveryDate: i.trip.plannedDeliveryDate,
    goods: i.goods,
  };
  return snapshot as unknown as Record<string, unknown>;
}
