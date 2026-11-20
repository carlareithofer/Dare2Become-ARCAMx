// Join-uri peste mock store (echivalentul select-urilor cu relații din Supabase). Doar pentru lib/data/.
import type { TripDetails, TripSummary } from "../data/models";
import type { Trip } from "../types";
import { clone, type MockDb } from "./store";

export function byId<T extends { id: string }>(list: T[], id: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new Error(`Nu am găsit înregistrarea ${id}`);
  return item;
}

export function summarize(db: MockDb, trip: Trip): TripSummary {
  const ecmr = db.ecmrs.find((e) => e.tripId === trip.id)!;
  const sender = byId(db.partners, trip.senderId);
  const consignee = byId(db.partners, trip.consigneeId);
  return {
    ...trip,
    ecmrId: ecmr.id,
    ecmrNumber: ecmr.number,
    driverName: byId(db.profiles, trip.driverId).fullName,
    plateNumber: byId(db.vehicles, trip.vehicleId).plateNumber,
    senderName: sender.name,
    consigneeName: consignee.name,
    loadingCity: sender.city,
    deliveryCity: consignee.city,
    hasRemarks: db.remarks.some((r) => r.ecmrId === ecmr.id),
  };
}

export function detailsFromDb(db: MockDb, tripId: string): TripDetails | null {
  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip) return null;
  const ecmr = db.ecmrs.find((e) => e.tripId === trip.id)!;
  return clone({
    trip,
    ecmr,
    goods: db.goods.filter((g) => g.ecmrId === ecmr.id),
    signatures: db.signatures.filter((s) => s.ecmrId === ecmr.id),
    remarks: db.remarks.filter((r) => r.ecmrId === ecmr.id),
    photos: db.photos.filter((p) => p.ecmrId === ecmr.id),
    client: byId(db.partners, trip.clientId),
    sender: byId(db.partners, trip.senderId),
    consignee: byId(db.partners, trip.consigneeId),
    driver: byId(db.profiles, trip.driverId),
    vehicle: byId(db.vehicles, trip.vehicleId),
  });
}
