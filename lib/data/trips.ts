// Curse + eCMR.
//   getTripsForDriver(driverId)              → TripSummary[] (fără cele anulate)
//   getTripsForCompany(companyId, filter?)   → TripSummary[]
//   getTrip(id)                              → TripDetails | null
//   createTrip(input)                        → TripDetails (creează și eCMR-ul „issued”)
//   startTrip(tripId, driverId)              → TripDetails (planned → in_progress)
// Implementare MOCK (localStorage). Răzvan: înlocuiește corpurile cu Supabase, păstrează semnăturile.
import { buildEcmrSnapshot, nextEcmrNumber } from "../ecmr";
import { byId, detailsFromDb, summarize } from "../mock/joins";
import { clone, delay, mutateDb, newId, readDb } from "../mock/store";
import type { Ecmr, Trip } from "../types";
import type { CreateTripInput, TripDetails, TripFilter, TripSummary } from "./models";

const byLoadingDate = (a: Trip, b: Trip) => a.loadingDate.localeCompare(b.loadingDate);

// ---------- API ----------

export async function getTripsForDriver(driverId: string): Promise<TripSummary[]> {
  await delay();
  const db = readDb();
  return clone(
    db.trips
      .filter((t) => t.driverId === driverId && t.status !== "cancelled")
      .sort(byLoadingDate)
      .map((t) => summarize(db, t)),
  );
}

export async function getTripsForCompany(companyId: string, filter: TripFilter = {}): Promise<TripSummary[]> {
  await delay();
  const db = readDb();
  return clone(
    db.trips
      .filter((t) => t.companyId === companyId)
      .filter((t) => !filter.status?.length || filter.status.includes(t.status))
      .filter((t) => !filter.from || t.loadingDate >= filter.from)
      .filter((t) => !filter.to || t.loadingDate <= filter.to)
      .sort((a, b) => byLoadingDate(b, a)) // cele mai noi primele
      .map((t) => summarize(db, t)),
  );
}

export async function getTrip(id: string): Promise<TripDetails | null> {
  await delay();
  return detailsFromDb(readDb(), id);
}

export async function createTrip(input: CreateTripInput): Promise<TripDetails> {
  await delay(300);
  return mutateDb((db) => {
    const now = new Date().toISOString();
    const { goods, ...tripFields } = input;
    const trip: Trip = { ...tripFields, id: newId("t"), status: "planned", createdAt: now };

    const ecmrId = newId("e");
    const ecmr: Ecmr = {
      id: ecmrId,
      tripId: trip.id,
      number: nextEcmrNumber(db.ecmrs.map((e) => e.number)),
      status: "issued",
      snapshot: buildEcmrSnapshot({
        trip,
        carrier: byId(db.companies, trip.companyId),
        client: byId(db.partners, trip.clientId),
        sender: byId(db.partners, trip.senderId),
        consignee: byId(db.partners, trip.consigneeId),
        driver: byId(db.profiles, trip.driverId),
        vehicle: byId(db.vehicles, trip.vehicleId),
        goods,
      }),
      issuedAt: now,
    };

    db.trips.push(trip);
    db.ecmrs.push(ecmr);
    db.goods.push(...goods.map((g) => ({ ...g, id: newId("g"), ecmrId })));
    return detailsFromDb(db, trip.id)!;
  });
}

export async function startTrip(tripId: string, driverId: string): Promise<TripDetails> {
  await delay();
  return mutateDb((db) => {
    const trip = byId(db.trips, tripId);
    if (trip.driverId !== driverId) throw new Error("Cursa nu îți este alocată.");
    if (trip.status === "planned") trip.status = "in_progress";
    return detailsFromDb(db, tripId)!;
  });
}
