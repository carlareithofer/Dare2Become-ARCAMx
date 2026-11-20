// Tipurile comune FacturCMR – urmează schema bazei de date (Supabase, Răzvan).
// NU le schimba fără acordul amândurora. Toate id-urile sunt string,
// toate datele calendaristice sunt string ISO 8601.

export type Role = "admin" | "dispatcher" | "driver";
export type TripStatus = "planned" | "in_progress" | "loaded" | "delivered" | "invoiced" | "cancelled";
export type EcmrStatus = "draft" | "issued" | "loaded" | "delivered" | "closed";
export type SignatureParty = "sender" | "carrier" | "consignee";
export type RemarkCategory = "missing_packages" | "damaged_packaging" | "damaged_goods" | "delay" | "other";
export type Stage = "loading" | "delivery";
export type CompanyPlan = "trial" | "basic" | "pro";
export type BodyType = "tarp" | "reefer" | "tanker" | "box" | "flatbed" | "other";

export interface Company {
  id: string;
  name: string;
  vatCode: string; // CUI / cod TVA, ex. „RO12345678”
  regNumber: string; // nr. Registrul Comerțului, ex. „J12/345/2020”
  address: string;
  country: string; // cod ISO, ex. „RO”
  plan: CompanyPlan;
}

export interface Profile {
  id: string;
  companyId: string;
  role: Role;
  fullName: string;
  phone: string;
  language: string; // ex. „ro”
}

export interface Vehicle {
  id: string;
  companyId: string;
  plateNumber: string;
  trailerPlate?: string;
  bodyType: BodyType;
  capacityKg: number;
  volumeM3: number;
}

export interface Partner {
  id: string;
  companyId: string;
  name: string;
  vatCode: string;
  address: string;
  city: string;
  country: string;
  email: string;
}

export interface Trip {
  id: string;
  companyId: string;
  driverId: string;
  vehicleId: string;
  clientId: string; // Partner – cine plătește transportul
  senderId: string; // Partner – expeditor
  consigneeId: string; // Partner – destinatar
  loadingAddress: string;
  loadingDate: string;
  deliveryAddress: string;
  plannedDeliveryDate: string;
  price: number;
  currency: string; // ex. „RON”, „EUR”
  status: TripStatus;
  createdAt: string;
}

export interface Ecmr {
  id: string;
  tripId: string;
  number: string; // FCMR-AAAA-NNNNNN
  status: EcmrStatus;
  snapshot: Record<string, unknown>; // copia datelor cursei la emitere
  carrierReservations?: string;
  documentHash?: string;
  pdfUrl?: string;
  issuedAt: string;
  closedAt?: string;
}

export interface EcmrGoods {
  id: string;
  ecmrId: string;
  description: string;
  packagesCount: number;
  packagingType: string; // ex. „paleți”, „colete”
  weightKg: number;
  volumeM3: number;
  marks?: string;
}

export interface Signature {
  id: string;
  ecmrId: string;
  party: SignatureParty;
  signerName: string;
  signatureUrl: string; // dataURL în mock
  signedAt: string;
  latitude?: number;
  longitude?: number;
  documentHash?: string;
  collectedBy: string; // Profile.id (șoferul care a ținut telefonul)
}

export interface Remark {
  id: string;
  ecmrId: string;
  stage: Stage;
  category: RemarkCategory;
  details?: string;
  createdBy: string; // Profile.id
  createdAt: string;
}

export interface Photo {
  id: string;
  ecmrId: string;
  remarkId?: string;
  stage: Stage;
  url: string; // dataURL în mock
  takenAt: string;
  uploadedBy: string; // Profile.id
}
