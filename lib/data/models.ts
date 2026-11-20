// Tipuri compuse pe care le întoarce stratul de date (join-uri peste tabelele din lib/types.ts).
// În Supabase: select cu relații (ex. trips + ecmrs + partners) sau un view.
import type {
  Ecmr,
  EcmrGoods,
  Partner,
  Photo,
  Profile,
  RemarkCategory,
  Remark,
  Signature,
  Trip,
  TripStatus,
  Vehicle,
} from "../types";

/** O cursă așa cum apare în liste (șofer, dashboard, calendar). */
export interface TripSummary extends Trip {
  ecmrId: string;
  ecmrNumber: string;
  driverName: string;
  plateNumber: string;
  senderName: string;
  consigneeName: string;
  loadingCity: string;
  deliveryCity: string;
  hasRemarks: boolean;
}

/** Tot ce trebuie pentru ecranul de detalii + documentul eCMR. */
export interface TripDetails {
  trip: Trip;
  ecmr: Ecmr;
  goods: EcmrGoods[];
  signatures: Signature[];
  remarks: Remark[];
  photos: Photo[];
  client: Partner;
  sender: Partner;
  consignee: Partner;
  driver: Profile;
  vehicle: Vehicle;
}

export interface TripFilter {
  status?: TripStatus[];
  from?: string; // ISO – după loadingDate
  to?: string; // ISO
}

export type GoodsInput = Omit<EcmrGoods, "id" | "ecmrId">;

export interface CreateTripInput {
  companyId: string;
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
  goods: GoodsInput[];
}

/** O poză făcută pe telefon, înainte de upload. */
export interface PhotoInput {
  dataUrl: string; // în Supabase: se urcă în Storage, iar Photo.url devine URL-ul fișierului
  takenAt: string;
  /** Indexul observației din `remarks` de care ține poza (opțional). */
  remarkIndex?: number;
}

export interface RemarkInput {
  category: RemarkCategory;
  details?: string;
}

export interface SignatureInput {
  signerName: string;
  signatureDataUrl: string; // PNG din SignaturePad
  signedAt: string;
  latitude?: number;
  longitude?: number;
}

export interface SubmitDeliveryInput {
  tripId: string;
  driverId: string;
  goodsOk: boolean;
  remarks: RemarkInput[];
  photos: PhotoInput[];
  consignee: SignatureInput;
}

export interface SubmitLoadingInput {
  tripId: string;
  driverId: string;
  /** Semnătura expeditorului – opțională în prototip. */
  sender?: SignatureInput;
  remarks?: RemarkInput[];
  photos?: PhotoInput[];
}
