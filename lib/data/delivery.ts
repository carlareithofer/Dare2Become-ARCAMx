// Încărcare și livrare (semnături, observații, poze).
//   submitLoading(input)   → TripDetails (in_progress/planned → loaded; semnătura expeditorului e opțională)
//   submitDelivery(input)  → TripDetails (→ delivered; semnătura destinatarului e obligatorie)
// Implementare MOCK. În Supabase: upload poze/semnături în Storage, apoi insert în signatures/remarks/photos
// și update pe trips.status + ecmrs.status (ideal într-o funcție RPC, atomic).
import { delay, mutateDb, newId, type MockDb } from "../mock/store";
import type { SignatureParty, Stage } from "../types";
import type { PhotoInput, RemarkInput, SignatureInput, SubmitDeliveryInput, SubmitLoadingInput, TripDetails } from "./models";
import { detailsFromDb } from "../mock/joins";

function addSignature(db: MockDb, ecmrId: string, party: SignatureParty, s: SignatureInput, driverId: string) {
  db.signatures = db.signatures.filter((x) => !(x.ecmrId === ecmrId && x.party === party)); // o semnătură pe parte
  db.signatures.push({
    id: newId("s"),
    ecmrId,
    party,
    signerName: s.signerName.trim(),
    signatureUrl: s.signatureDataUrl,
    signedAt: s.signedAt,
    latitude: s.latitude,
    longitude: s.longitude,
    collectedBy: driverId,
  });
}

function addRemarksAndPhotos(
  db: MockDb,
  ecmrId: string,
  stage: Stage,
  driverId: string,
  remarks: RemarkInput[] = [],
  photos: PhotoInput[] = [],
) {
  const now = new Date().toISOString();
  const remarkIds = remarks.map((r) => {
    const id = newId("r");
    db.remarks.push({ id, ecmrId, stage, category: r.category, details: r.details?.trim() || undefined, createdBy: driverId, createdAt: now });
    return id;
  });
  for (const p of photos) {
    db.photos.push({
      id: newId("ph"),
      ecmrId,
      remarkId: p.remarkIndex !== undefined ? remarkIds[p.remarkIndex] : undefined,
      stage,
      url: p.dataUrl,
      takenAt: p.takenAt,
      uploadedBy: driverId,
    });
  }
}

function loadTripForDriver(db: MockDb, tripId: string, driverId: string) {
  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip) throw new Error("Cursa nu există.");
  if (trip.driverId !== driverId) throw new Error("Cursa nu îți este alocată.");
  const ecmr = db.ecmrs.find((e) => e.tripId === tripId)!;
  return { trip, ecmr };
}

export async function submitLoading(input: SubmitLoadingInput): Promise<TripDetails> {
  await delay(300);
  return mutateDb((db) => {
    const { trip, ecmr } = loadTripForDriver(db, input.tripId, input.driverId);
    if (input.sender) addSignature(db, ecmr.id, "sender", input.sender, input.driverId);
    addRemarksAndPhotos(db, ecmr.id, "loading", input.driverId, input.remarks, input.photos);
    trip.status = "loaded";
    ecmr.status = "loaded";
    return detailsFromDb(db, trip.id)!;
  });
}

export async function submitDelivery(input: SubmitDeliveryInput): Promise<TripDetails> {
  await delay(400);
  if (!input.consignee.signerName.trim()) throw new Error("Lipsește numele destinatarului.");
  return mutateDb((db) => {
    const { trip, ecmr } = loadTripForDriver(db, input.tripId, input.driverId);
    addSignature(db, ecmr.id, "consignee", input.consignee, input.driverId);
    // Dacă marfa e OK, ignorăm observațiile; pozele se păstrează oricum (dovadă).
    addRemarksAndPhotos(db, ecmr.id, "delivery", input.driverId, input.goodsOk ? [] : input.remarks, input.photos);
    trip.status = "delivered";
    ecmr.status = "delivered";
    return detailsFromDb(db, trip.id)!;
  });
}
