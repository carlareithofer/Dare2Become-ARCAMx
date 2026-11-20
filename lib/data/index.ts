'use client';
// Stratul de date al aplicației. Interfața folosește DOAR aceste funcții.
// Acum citesc/scriu în store-ul fictiv; Răzvan le reimplementează cu Supabase
// păstrând aceleași nume, parametri și tipuri returnate.
import type {
  DeliveryInput, NewTripInput, Partner, Profile, SignatureInput, Trip, TripDetail, TripStatus, Vehicle,
} from '@/lib/types';
import { readDb, resetDb, uid, writeDb } from './store';
import type { Db } from '@/lib/mock/seed';

export const COMPANY_ID = 'c1'; // în prototip: o singură firmă demo
const SESSION_KEY = 'facturcmr-driver';

// ---------- Sesiunea șoferului ----------
export function getCurrentDriverId(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(SESSION_KEY);
}

export async function loginWithInviteCode(code: string): Promise<Profile | null> {
  const db = readDb();
  const invite = db.invites.find((i) => i.code.toUpperCase() === code.trim().toUpperCase());
  if (!invite?.usedBy) return null;
  const profile = db.profiles.find((p) => p.id === invite.usedBy) ?? null;
  if (profile) window.localStorage.setItem(SESSION_KEY, profile.id);
  return profile;
}

export function logoutDriver() {
  window.localStorage.removeItem(SESSION_KEY);
}

// ---------- Citire ----------
function detail(db: Db, t: Trip): TripDetail {
  const ecmr = db.ecmrs.find((e) => e.tripId === t.id);
  const eid = ecmr?.id;
  return {
    ...t,
    driver: db.profiles.find((p) => p.id === t.driverId),
    vehicle: db.vehicles.find((v) => v.id === t.vehicleId),
    client: db.partners.find((p) => p.id === t.clientId),
    sender: db.partners.find((p) => p.id === t.senderId),
    consignee: db.partners.find((p) => p.id === t.consigneeId),
    ecmr,
    goods: db.goods.filter((g) => g.ecmrId === eid),
    signatures: db.signatures.filter((s) => s.ecmrId === eid),
    remarks: db.remarks.filter((r) => r.ecmrId === eid),
    photos: db.photos.filter((p) => p.ecmrId === eid),
  };
}

const byDate = (a: Trip, b: Trip) => a.loadingDate.localeCompare(b.loadingDate);

export async function getTripsForDriver(driverId: string): Promise<TripDetail[]> {
  const db = readDb();
  return db.trips.filter((t) => t.driverId === driverId).sort(byDate).map((t) => detail(db, t));
}

export async function getTrips(companyId = COMPANY_ID): Promise<TripDetail[]> {
  const db = readDb();
  return db.trips.filter((t) => t.companyId === companyId).sort(byDate).map((t) => detail(db, t));
}

export async function getTrip(id: string): Promise<TripDetail | null> {
  const db = readDb();
  const t = db.trips.find((x) => x.id === id);
  return t ? detail(db, t) : null;
}

export async function getDriver(id: string): Promise<Profile | null> {
  return readDb().profiles.find((p) => p.id === id) ?? null;
}

export async function getDrivers(companyId = COMPANY_ID): Promise<Profile[]> {
  return readDb().profiles.filter((p) => p.companyId === companyId && p.role === 'driver');
}

export async function getVehicles(companyId = COMPANY_ID): Promise<Vehicle[]> {
  return readDb().vehicles.filter((v) => v.companyId === companyId);
}

export async function getPartners(companyId = COMPANY_ID): Promise<Partner[]> {
  return readDb().partners.filter((p) => p.companyId === companyId);
}

export async function getCompany(companyId = COMPANY_ID) {
  return readDb().companies.find((c) => c.id === companyId) ?? null;
}

// ---------- Scriere ----------
async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return 'sha256:' + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Amprenta documentului: datele eCMR + mărfuri + semnăturile de până acum. */
async function hashFor(db: Db, tripId: string) {
  const d = detail(db, db.trips.find((t) => t.id === tripId)!);
  return sha256(JSON.stringify({ e: d.ecmr?.snapshot, n: d.ecmr?.number, g: d.goods, s: d.signatures.map((s) => [s.party, s.signerName, s.signedAt]) }));
}

export async function createTrip(input: NewTripInput, companyId = COMPANY_ID): Promise<string> {
  const db = readDb();
  const tripId = uid('t');
  const ecmrId = uid('e');
  const number = `ECMR-2026-${String(1041 + db.ecmrs.length).padStart(5, '0')}`;
  const now = new Date().toISOString();
  const { goods, ...tripFields } = input;
  const p = (id: string) => db.partners.find((x) => x.id === id);
  writeDb((d) => {
    d.trips.push({ ...tripFields, id: tripId, companyId, status: 'planned', createdAt: now });
    d.ecmrs.push({
      id: ecmrId, tripId, number, status: 'issued', issuedAt: now,
      // copia „înghețată” a datelor la emitere
      snapshot: {
        carrier: d.companies.find((c) => c.id === companyId), sender: p(input.senderId), consignee: p(input.consigneeId),
        loadingAddress: input.loadingAddress, loadingDate: input.loadingDate, deliveryAddress: input.deliveryAddress,
        vehicle: d.vehicles.find((v) => v.id === input.vehicleId),
      },
    });
    goods.forEach((g) => d.goods.push({ ...g, id: uid('g'), ecmrId }));
  });
  return tripId;
}

export async function setTripStatus(tripId: string, status: TripStatus) {
  writeDb((d) => {
    const t = d.trips.find((x) => x.id === tripId);
    if (t) t.status = status;
  });
}

export async function startTrip(tripId: string) {
  return setTripStatus(tripId, 'in_progress');
}

/** La încărcare: semnează expeditorul pe telefonul șoferului; transportatorul (șoferul) confirmă. */
export async function submitLoading(tripId: string, sender: SignatureInput, driverId: string) {
  const db = readDb();
  const trip = db.trips.find((t) => t.id === tripId)!;
  const ecmr = db.ecmrs.find((e) => e.tripId === tripId)!;
  const driver = db.profiles.find((p) => p.id === driverId);
  const now = new Date().toISOString();
  writeDb((d) => {
    d.signatures.push({ id: uid('s'), ecmrId: ecmr.id, party: 'sender', ...sender, signedAt: now, collectedBy: driverId });
    d.signatures.push({ id: uid('s'), ecmrId: ecmr.id, party: 'carrier', signerName: driver?.fullName ?? 'Șofer', signatureUrl: '', signedAt: now, latitude: sender.latitude, longitude: sender.longitude, collectedBy: driverId });
    d.trips.find((t) => t.id === trip.id)!.status = 'loaded';
    d.ecmrs.find((e) => e.id === ecmr.id)!.status = 'loaded';
  });
  const hash = await hashFor(readDb(), tripId);
  writeDb((d) => {
    d.ecmrs.find((e) => e.id === ecmr.id)!.documentHash = hash;
    d.signatures.filter((s) => s.ecmrId === ecmr.id && !s.documentHash).forEach((s) => (s.documentHash = hash));
  });
}

/** La livrare: observații din listă, poze, semnătura destinatarului. */
export async function submitDelivery(tripId: string, input: DeliveryInput, driverId: string) {
  const db = readDb();
  const ecmr = db.ecmrs.find((e) => e.tripId === tripId)!;
  const now = new Date().toISOString();
  writeDb((d) => {
    input.remarks.forEach((r) => d.remarks.push({ id: uid('r'), ecmrId: ecmr.id, stage: 'delivery', category: r.category, details: r.details, createdBy: driverId, createdAt: now }));
    input.photos.forEach((url) => d.photos.push({ id: uid('ph'), ecmrId: ecmr.id, stage: 'delivery', url, takenAt: now, uploadedBy: driverId }));
    d.signatures.push({ id: uid('s'), ecmrId: ecmr.id, party: 'consignee', ...input.consignee, signedAt: now, collectedBy: driverId });
    d.trips.find((t) => t.id === tripId)!.status = 'delivered';
    d.ecmrs.find((e) => e.id === ecmr.id)!.status = 'delivered';
  });
  const hash = await hashFor(readDb(), tripId);
  writeDb((d) => {
    d.ecmrs.find((e) => e.id === ecmr.id)!.documentHash = hash;
    d.signatures.filter((s) => s.ecmrId === ecmr.id && s.party === 'consignee' && !s.documentHash).forEach((s) => (s.documentHash = hash));
  });
}

/** Managerul aprobă: eCMR-ul se închide și cursa trece la „facturată” (integrarea SmartBill vine în faza 2). */
export async function approveForInvoicing(tripId: string) {
  writeDb((d) => {
    d.trips.find((t) => t.id === tripId)!.status = 'invoiced';
    const e = d.ecmrs.find((x) => x.tripId === tripId)!;
    e.status = 'closed';
    e.closedAt = new Date().toISOString();
  });
}

export async function createInviteCode(companyId = COMPANY_ID): Promise<string> {
  const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  writeDb((d) => {
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    d.invites.push({ id: uid('i'), companyId, code, role: 'driver', expiresAt: exp.toISOString() });
  });
  return code;
}

export function resetDemoData() {
  resetDb();
}
