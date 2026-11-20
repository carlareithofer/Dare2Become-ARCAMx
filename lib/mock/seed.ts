// Date fictive realiste pentru demo: 1 firmă, 3 șoferi, 2 camioane, 6 parteneri, 8 curse.
// Datele sunt relative la ziua de azi, ca demo-ul să arate mereu „actual”.
import { buildEcmrSnapshot, formatEcmrNumber } from "../ecmr";
import type {
  Company,
  Ecmr,
  EcmrGoods,
  EcmrStatus,
  Partner,
  Photo,
  Profile,
  Remark,
  Trip,
  TripStatus,
  Vehicle,
} from "../types";
import type { DriverInvite, MockDb } from "./store";

/** Data ISO la `offset` zile față de azi, la ora dată. */
function day(offset: number, hour = 8, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Semnătură demo (SVG ca dataURL), puțin diferită pentru fiecare nume. */
function fakeSignature(name: string): string {
  const n = name.length;
  const path = `M10 ${60 - n} C 40 ${10 + n}, 60 ${90 - n}, 90 40 S 140 ${20 + n}, 160 55 S 210 ${70 - n}, 240 30 M 60 70 L 200 ${68 - (n % 7)}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 90"><path d="${path}" fill="none" stroke="#0F2A4A" stroke-width="3" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Poză demo (SVG ca dataURL) – un palet cu o etichetă. */
function fakePhoto(label: string, tint: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${tint}"/><rect x="110" y="70" width="180" height="150" fill="#C8A26B" stroke="#7A5A2E" stroke-width="4"/><path d="M110 120 H290 M110 170 H290" stroke="#7A5A2E" stroke-width="3"/><path d="M230 70 L260 130 L245 160" stroke="#DC2626" stroke-width="5" fill="none"/><rect x="90" y="220" width="220" height="18" fill="#8B6B3E"/><text x="200" y="275" font-family="Arial" font-size="18" text-anchor="middle" fill="#1C2530">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const COMPANY_ID = "c_transcarpatica";

const company: Company = {
  id: COMPANY_ID,
  name: "TransCarpatica Logistic SRL",
  vatCode: "RO40123456",
  regNumber: "J12/1234/2019",
  address: "Str. Fabricii 12, Cluj-Napoca",
  country: "RO",
  plan: "trial",
};

const profiles: Profile[] = [
  { id: "u_elena", companyId: COMPANY_ID, role: "admin", fullName: "Elena Marin", phone: "+40 744 120 300", language: "ro" },
  { id: "d_ion", companyId: COMPANY_ID, role: "driver", fullName: "Ion Popescu", phone: "+40 722 418 905", language: "ro" },
  { id: "d_mihai", companyId: COMPANY_ID, role: "driver", fullName: "Mihai Dumitru", phone: "+40 733 552 017", language: "ro" },
  { id: "d_andrei", companyId: COMPANY_ID, role: "driver", fullName: "Andrei Stan", phone: "+40 755 901 264", language: "ro" },
];

const vehicles: Vehicle[] = [
  { id: "v_cj12", companyId: COMPANY_ID, plateNumber: "CJ 12 TCL", trailerPlate: "CJ 34 TCL", bodyType: "tarp", capacityKg: 24000, volumeM3: 90 },
  { id: "v_cj56", companyId: COMPANY_ID, plateNumber: "CJ 56 TCL", trailerPlate: "CJ 78 TCL", bodyType: "reefer", capacityKg: 22000, volumeM3: 82 },
];

const partners: Partner[] = [
  { id: "p_mobila", companyId: COMPANY_ID, name: "Mobila Bistrița SA", vatCode: "RO10293847", address: "Str. Industriei 5", city: "Bistrița", country: "RO", email: "logistica@mobila-bistrita.example" },
  { id: "p_agro", companyId: COMPANY_ID, name: "Agro Someș SRL", vatCode: "RO22334455", address: "Str. Câmpului 88", city: "Cluj-Napoca", country: "RO", email: "comenzi@agrosomes.example" },
  { id: "p_lactate", companyId: COMPANY_ID, name: "Lactate Turda SRL", vatCode: "RO31415926", address: "Str. Libertății 21", city: "Turda", country: "RO", email: "expeditie@lactateturda.example" },
  { id: "p_depozit", companyId: COMPANY_ID, name: "Depozit Logistic Ploiești SRL", vatCode: "RO27182818", address: "DN1 km 62", city: "Ploiești", country: "RO", email: "receptie@depozitploiesti.example" },
  { id: "p_hanse", companyId: COMPANY_ID, name: "Hanseatic Möbelhandel GmbH", vatCode: "DE812345678", address: "Hafenstraße 40", city: "Hamburg", country: "DE", email: "wareneingang@hanseatic.example" },
  { id: "p_duna", companyId: COMPANY_ID, name: "Duna Trade Kft", vatCode: "HU12345678", address: "Váci út 120", city: "Budapesta", country: "HU", email: "raktar@dunatrade.example" },
];

const addressOf = (id: string) => {
  const p = partners.find((x) => x.id === id)!;
  return `${p.address}, ${p.city}, ${p.country}`;
};

interface TripSeed {
  n: number; // nr. secvență eCMR
  status: TripStatus;
  driverId: string;
  vehicleId: string;
  clientId: string;
  senderId: string;
  consigneeId: string;
  load: [number, number]; // [zi, oră]
  deliver: [number, number];
  price: number;
  currency: string;
  goods: Omit<EcmrGoods, "id" | "ecmrId">[];
}

const TRIPS: TripSeed[] = [
  {
    n: 118, status: "loaded", driverId: "d_ion", vehicleId: "v_cj12",
    clientId: "p_hanse", senderId: "p_mobila", consigneeId: "p_hanse",
    load: [-2, 7], deliver: [0, 14], price: 2350, currency: "EUR",
    goods: [{ description: "Mobilier ambalat (dulapuri, comode)", packagesCount: 26, packagingType: "paleți", weightKg: 8400, volumeM3: 62, marks: "MB-HH-0118" }],
  },
  {
    n: 121, status: "planned", driverId: "d_ion", vehicleId: "v_cj12",
    clientId: "p_agro", senderId: "p_agro", consigneeId: "p_depozit",
    load: [1, 6], deliver: [2, 10], price: 4800, currency: "RON",
    goods: [{ description: "Semințe de porumb în saci", packagesCount: 33, packagingType: "paleți", weightKg: 21000, volumeM3: 48 }],
  },
  {
    n: 112, status: "delivered", driverId: "d_ion", vehicleId: "v_cj12",
    clientId: "p_duna", senderId: "p_lactate", consigneeId: "p_duna",
    load: [-6, 8], deliver: [-5, 13], price: 1150, currency: "EUR",
    goods: [{ description: "Brânzeturi maturate", packagesCount: 18, packagingType: "paleți", weightKg: 9200, volumeM3: 30 }],
  },
  {
    n: 119, status: "in_progress", driverId: "d_mihai", vehicleId: "v_cj56",
    clientId: "p_lactate", senderId: "p_lactate", consigneeId: "p_depozit",
    load: [0, 9], deliver: [1, 8], price: 3900, currency: "RON",
    goods: [{ description: "Produse lactate refrigerate (2–6 °C)", packagesCount: 22, packagingType: "paleți", weightKg: 14500, volumeM3: 44, marks: "LT-PL-119" }],
  },
  {
    n: 115, status: "delivered", driverId: "d_mihai", vehicleId: "v_cj56",
    clientId: "p_depozit", senderId: "p_depozit", consigneeId: "p_agro",
    load: [-4, 7], deliver: [-3, 15], price: 4100, currency: "RON",
    goods: [
      { description: "Îngrășăminte ambalate", packagesCount: 20, packagingType: "paleți", weightKg: 16000, volumeM3: 36 },
      { description: "Folie agricolă", packagesCount: 12, packagingType: "role", weightKg: 1800, volumeM3: 10 },
    ],
  },
  {
    n: 104, status: "invoiced", driverId: "d_andrei", vehicleId: "v_cj12",
    clientId: "p_mobila", senderId: "p_duna", consigneeId: "p_mobila",
    load: [-12, 8], deliver: [-10, 12], price: 980, currency: "EUR",
    goods: [{ description: "Plăci MDF", packagesCount: 14, packagingType: "paleți", weightKg: 19800, volumeM3: 40 }],
  },
  {
    n: 122, status: "planned", driverId: "d_andrei", vehicleId: "v_cj12",
    clientId: "p_duna", senderId: "p_mobila", consigneeId: "p_duna",
    load: [3, 7], deliver: [4, 11], price: 1050, currency: "EUR",
    goods: [{ description: "Scaune și mese din lemn", packagesCount: 30, packagingType: "colete", weightKg: 5200, volumeM3: 55 }],
  },
  {
    n: 120, status: "cancelled", driverId: "d_mihai", vehicleId: "v_cj56",
    clientId: "p_hanse", senderId: "p_agro", consigneeId: "p_hanse",
    load: [2, 6], deliver: [5, 10], price: 2100, currency: "EUR",
    goods: [{ description: "Fructe congelate", packagesCount: 24, packagingType: "paleți", weightKg: 18000, volumeM3: 50 }],
  },
];

/** Ce status are eCMR-ul pentru fiecare status al cursei. */
const ECMR_FOR_TRIP: Record<TripStatus, EcmrStatus> = {
  planned: "issued",
  in_progress: "issued",
  loaded: "loaded",
  delivered: "delivered",
  invoiced: "closed",
  cancelled: "issued",
};

export function buildSeed(): MockDb {
  const db: MockDb = {
    companies: [company],
    profiles: [...profiles],
    vehicles: [...vehicles],
    partners: [...partners],
    trips: [],
    ecmrs: [],
    goods: [],
    signatures: [],
    remarks: [],
    photos: [],
    invites: [],
  };

  for (const s of TRIPS) {
    const tripId = `t_${s.n}`;
    const ecmrId = `e_${s.n}`;
    const createdAt = day(s.load[0] - 2, 16);
    const trip: Trip = {
      id: tripId,
      companyId: COMPANY_ID,
      driverId: s.driverId,
      vehicleId: s.vehicleId,
      clientId: s.clientId,
      senderId: s.senderId,
      consigneeId: s.consigneeId,
      loadingAddress: addressOf(s.senderId),
      loadingDate: day(...s.load),
      deliveryAddress: addressOf(s.consigneeId),
      plannedDeliveryDate: day(...s.deliver),
      price: s.price,
      currency: s.currency,
      status: s.status,
      createdAt,
    };
    const find = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id)!;
    const ecmr: Ecmr = {
      id: ecmrId,
      tripId,
      number: formatEcmrNumber(new Date().getFullYear(), s.n),
      status: ECMR_FOR_TRIP[s.status],
      snapshot: buildEcmrSnapshot({
        trip,
        carrier: company,
        client: find(partners, s.clientId),
        sender: find(partners, s.senderId),
        consignee: find(partners, s.consigneeId),
        driver: find(profiles, s.driverId),
        vehicle: find(vehicles, s.vehicleId),
        goods: s.goods,
      }),
      issuedAt: createdAt,
      closedAt: s.status === "invoiced" ? day(s.deliver[0] + 1, 10) : undefined,
    };
    db.trips.push(trip);
    db.ecmrs.push(ecmr);
    s.goods.forEach((g, i) => db.goods.push({ ...g, id: `g_${s.n}_${i}`, ecmrId }));

    // Semnături: expeditorul la încărcare, destinatarul la livrare.
    const loadedOrLater = ["loaded", "delivered", "invoiced"].includes(s.status);
    const deliveredOrLater = ["delivered", "invoiced"].includes(s.status);
    if (loadedOrLater) {
      const signer = s.n === 104 ? "Szabó Péter" : s.n === 112 ? "Maria Rus" : s.n === 115 ? "Cristian Pop" : "Gheorghe Moldovan";
      db.signatures.push({
        id: `s_${s.n}_sender`, ecmrId, party: "sender", signerName: signer,
        signatureUrl: fakeSignature(signer), signedAt: day(s.load[0], s.load[1] + 1, 20),
        latitude: 47.1357, longitude: 24.4876, collectedBy: s.driverId,
      });
    }
    if (deliveredOrLater) {
      const signer = s.n === 104 ? "Ana Bălan" : s.n === 112 ? "Kovács Anna" : "Florin Câmpean";
      db.signatures.push({
        id: `s_${s.n}_consignee`, ecmrId, party: "consignee", signerName: signer,
        signatureUrl: fakeSignature(signer), signedAt: day(s.deliver[0], s.deliver[1], 35),
        latitude: 46.7712, longitude: 23.6236, collectedBy: s.driverId,
      });
    }
  }

  // Cursa 115: livrată cu observații + poze.
  const remark: Remark = {
    id: "r_115_1", ecmrId: "e_115", stage: "delivery", category: "damaged_packaging",
    details: "2 paleți cu folie ruptă", createdBy: "d_mihai", createdAt: day(-3, 15, 30),
  };
  db.remarks.push(remark, {
    id: "r_115_2", ecmrId: "e_115", stage: "delivery", category: "delay",
    createdBy: "d_mihai", createdAt: day(-3, 15, 31),
  });
  const photos: Photo[] = [
    { id: "ph_115_1", ecmrId: "e_115", remarkId: remark.id, stage: "delivery", url: fakePhoto("Palet 7 – folie ruptă (demo)", "#E2E8F0"), takenAt: day(-3, 15, 28), uploadedBy: "d_mihai" },
    { id: "ph_115_2", ecmrId: "e_115", remarkId: remark.id, stage: "delivery", url: fakePhoto("Palet 12 – folie ruptă (demo)", "#F1F5F9"), takenAt: day(-3, 15, 29), uploadedBy: "d_mihai" },
  ];
  db.photos.push(...photos);

  // Coduri de invitație: unul pentru Ion (demo login), unul pentru un șofer nou.
  const invites: DriverInvite[] = [
    { id: "i_ion", companyId: COMPANY_ID, code: "K7M2QX", fullName: "Ion Popescu", phone: "+40 722 418 905", profileId: "d_ion", createdAt: day(-1, 9), expiresAt: day(7, 23) },
    { id: "i_vasile", companyId: COMPANY_ID, code: "P4R8TZ", fullName: "Vasile Ilie", phone: "+40 766 310 442", createdAt: day(0, 8), expiresAt: day(7, 23) },
  ];
  db.invites.push(...invites);

  return db;
}

/** Id-urile folosite în demo (alegerea rolului). */
export const DEMO_COMPANY_ID = COMPANY_ID;
export const DEMO_ADMIN_ID = "u_elena";
