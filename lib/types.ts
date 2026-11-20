// Tipurile comune ale platformei.
// Urmează schema bazei de date propusă (Supabase / PostgreSQL), cu numele în camelCase.
// NU modifica fără să anunți și cealaltă parte a echipei (UI ↔ bază de date).

export type Role = 'admin' | 'dispatcher' | 'driver';
export type TripStatus = 'planned' | 'in_progress' | 'loaded' | 'delivered' | 'invoiced' | 'cancelled';
export type EcmrStatus = 'draft' | 'issued' | 'loaded' | 'delivered' | 'closed';
export type SignatureParty = 'sender' | 'carrier' | 'consignee';
export type RemarkCategory = 'missing_packages' | 'damaged_packaging' | 'damaged_goods' | 'delay' | 'other';
export type Stage = 'loading' | 'delivery';
export type BodyType = 'tarp' | 'reefer' | 'tanker' | 'box' | 'flatbed' | 'other';

export interface Company {
  id: string;
  name: string;
  vatCode: string;
  regNumber: string;
  address: string;
  country: string;
  plan: 'trial' | 'basic' | 'pro';
}

export interface Profile {
  id: string;
  companyId: string;
  role: Role;
  fullName: string;
  phone: string;
  language: string;
}

export interface Invite {
  id: string;
  companyId: string;
  code: string;
  role: Role;
  expiresAt: string;
  usedBy?: string;
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
  clientId: string;
  senderId: string;
  consigneeId: string;
  loadingAddress: string;
  loadingDate: string; // ISO
  deliveryAddress: string;
  plannedDeliveryDate: string; // ISO
  price: number;
  currency: string;
  status: TripStatus;
  createdAt: string;
}

export interface Ecmr {
  id: string;
  tripId: string;
  number: string;
  status: EcmrStatus;
  snapshot: Record<string, unknown>; // datele „înghețate” la emitere
  carrierReservations?: string; // căsuța 18
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
  packagingType: string;
  weightKg: number;
  volumeM3: number;
  marks?: string;
}

export interface Signature {
  id: string;
  ecmrId: string;
  party: SignatureParty;
  signerName: string;
  signatureUrl: string; // în mock: imagine dataURL
  signedAt: string;
  latitude?: number;
  longitude?: number;
  documentHash?: string;
  collectedBy: string;
}

export interface Remark {
  id: string;
  ecmrId: string;
  stage: Stage;
  category: RemarkCategory;
  details?: string;
  createdBy: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  ecmrId: string;
  remarkId?: string;
  stage: Stage;
  url: string; // în mock: imagine dataURL
  takenAt: string;
  uploadedBy: string;
}

// ---- Tipuri „compuse” folosite de interfață (o cursă cu tot ce ține de ea) ----

export interface TripDetail extends Trip {
  driver?: Profile;
  vehicle?: Vehicle;
  client?: Partner;
  sender?: Partner;
  consignee?: Partner;
  ecmr?: Ecmr;
  goods: EcmrGoods[];
  signatures: Signature[];
  remarks: Remark[];
  photos: Photo[];
}

export interface NewTripInput {
  driverId: string;
  vehicleId: string;
  clientId: string;
  senderId: string;
  consigneeId: string;
  loadingAddress: string;
  loadingDate: string;
  deliveryAddress: string;
  plannedDeliveryDate: string;
  price: number;
  currency: string;
  goods: Omit<EcmrGoods, 'id' | 'ecmrId'>[];
}

export interface SignatureInput {
  signerName: string;
  signatureUrl: string;
  latitude?: number;
  longitude?: number;
}

export interface DeliveryInput {
  goodsOk: boolean;
  remarks: { category: RemarkCategory; details?: string }[];
  photos: string[]; // dataURL
  consignee: SignatureInput;
}
