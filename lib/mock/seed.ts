// Date fictive pentru demo. Datele calendaristice sunt relative la ziua de azi,
// ca demo-ul să arate mereu „actual”.
import type {
  Company, Ecmr, EcmrGoods, Invite, Partner, Photo, Profile, Remark, Signature, Trip, Vehicle,
} from '@/lib/types';

export interface Db {
  companies: Company[];
  profiles: Profile[];
  invites: Invite[];
  vehicles: Vehicle[];
  partners: Partner[];
  trips: Trip[];
  ecmrs: Ecmr[];
  goods: EcmrGoods[];
  signatures: Signature[];
  remarks: Remark[];
  photos: Photo[];
}

const day = (offset: number, hour = 8) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

// O semnătură „desenată” simplă, ca SVG, pentru cursele deja livrate din demo.
const fakeSignature = (name: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='100'><path d='M10 70 C 40 10, 60 90, 90 50 S 140 20, 160 60 S 220 80, 290 30' stroke='#0F2A4A' stroke-width='3' fill='none'/><text x='10' y='95' font-size='12' fill='#64748B'>${name}</text></svg>`;
  return `data:image/svg+xml;base64,${typeof btoa === 'function' ? btoa(svg) : Buffer.from(svg).toString('base64')}`;
};

export function buildSeed(): Db {
  const companyId = 'c1';
  const companies: Company[] = [{
    id: companyId, name: 'Trans Exemplu SRL', vatCode: 'RO12345678', regNumber: 'J40/1234/2015',
    address: 'Șos. Berceni 104, București', country: 'RO', plan: 'trial',
  }];

  const profiles: Profile[] = [
    { id: 'u-admin', companyId, role: 'admin', fullName: 'Elena Ionescu', phone: '+40 721 000 001', language: 'ro' },
    { id: 'd1', companyId, role: 'driver', fullName: 'Ion Popescu', phone: '+40 722 111 222', language: 'ro' },
    { id: 'd2', companyId, role: 'driver', fullName: 'Mihai Dumitru', phone: '+40 723 333 444', language: 'ro' },
    { id: 'd3', companyId, role: 'driver', fullName: 'Andrei Stan', phone: '+40 724 555 666', language: 'ro' },
  ];

  const invites: Invite[] = [
    { id: 'i1', companyId, code: 'ION123', role: 'driver', expiresAt: day(30), usedBy: 'd1' },
    { id: 'i2', companyId, code: 'MIH456', role: 'driver', expiresAt: day(30), usedBy: 'd2' },
    { id: 'i3', companyId, code: 'AND789', role: 'driver', expiresAt: day(30), usedBy: 'd3' },
  ];

  const vehicles: Vehicle[] = [
    { id: 'v1', companyId, plateNumber: 'B 123 TRX', trailerPlate: 'B 456 REM', bodyType: 'tarp', capacityKg: 24000, volumeM3: 90 },
    { id: 'v2', companyId, plateNumber: 'B 789 TRX', trailerPlate: 'B 321 FRG', bodyType: 'reefer', capacityKg: 22000, volumeM3: 86 },
    { id: 'v3', companyId, plateNumber: 'IF 55 TRX', bodyType: 'box', capacityKg: 12000, volumeM3: 45 },
  ];

  const partners: Partner[] = [
    { id: 'p1', companyId, name: 'AutoParts Pitești SRL', vatCode: 'RO11122233', address: 'Str. Depozitelor 12', city: 'Pitești', country: 'RO', email: 'logistica@autoparts.example' },
    { id: 'p2', companyId, name: 'Kühn Automotive GmbH', vatCode: 'DE811223344', address: 'Industriestraße 8', city: 'Stuttgart', country: 'DE', email: 'wareneingang@kuehn.example' },
    { id: 'p3', companyId, name: 'Fresh Foods Distribuție SA', vatCode: 'RO22233344', address: 'Bd. Industriilor 5', city: 'Cluj-Napoca', country: 'RO', email: 'receptie@freshfoods.example' },
    { id: 'p4', companyId, name: 'Mega Retail Logistics SRL', vatCode: 'RO33344455', address: 'DN1 km 18', city: 'Ploiești', country: 'RO', email: 'depozit@megaretail.example' },
    { id: 'p5', companyId, name: 'Construct Plus SRL', vatCode: 'RO44455566', address: 'Str. Fabricii 3', city: 'Brașov', country: 'RO', email: 'achizitii@constructplus.example' },
    { id: 'p6', companyId, name: 'Magyar Építő Kft.', vatCode: 'HU12345678', address: 'Ipari út 22', city: 'Budapest', country: 'HU', email: 'raktar@magyarepito.example' },
  ];

  type T = Omit<Trip, 'companyId' | 'createdAt' | 'currency'> & { currency?: string };
  const tripRows: T[] = [
    { id: 't1', driverId: 'd1', vehicleId: 'v1', clientId: 'p1', senderId: 'p1', consigneeId: 'p2', loadingAddress: 'Str. Depozitelor 12, Pitești', loadingDate: day(0, 7), deliveryAddress: 'Industriestraße 8, Stuttgart, DE', plannedDeliveryDate: day(2, 10), price: 2400, currency: 'EUR', status: 'planned' },
    { id: 't2', driverId: 'd1', vehicleId: 'v1', clientId: 'p4', senderId: 'p4', consigneeId: 'p3', loadingAddress: 'DN1 km 18, Ploiești', loadingDate: day(-1, 6), deliveryAddress: 'Bd. Industriilor 5, Cluj-Napoca', plannedDeliveryDate: day(0, 15), price: 4200, currency: 'RON', status: 'loaded' },
    { id: 't3', driverId: 'd1', vehicleId: 'v1', clientId: 'p5', senderId: 'p5', consigneeId: 'p6', loadingAddress: 'Str. Fabricii 3, Brașov', loadingDate: day(-6, 8), deliveryAddress: 'Ipari út 22, Budapest, HU', plannedDeliveryDate: day(-5, 12), price: 1350, currency: 'EUR', status: 'delivered' },
    { id: 't4', driverId: 'd2', vehicleId: 'v2', clientId: 'p3', senderId: 'p3', consigneeId: 'p4', loadingAddress: 'Bd. Industriilor 5, Cluj-Napoca', loadingDate: day(0, 9), deliveryAddress: 'DN1 km 18, Ploiești', plannedDeliveryDate: day(1, 8), price: 3900, currency: 'RON', status: 'in_progress' },
    { id: 't5', driverId: 'd2', vehicleId: 'v2', clientId: 'p4', senderId: 'p4', consigneeId: 'p1', loadingAddress: 'DN1 km 18, Ploiești', loadingDate: day(3, 7), deliveryAddress: 'Str. Depozitelor 12, Pitești', plannedDeliveryDate: day(3, 14), price: 1800, currency: 'RON', status: 'planned' },
    { id: 't6', driverId: 'd3', vehicleId: 'v3', clientId: 'p1', senderId: 'p1', consigneeId: 'p4', loadingAddress: 'Str. Depozitelor 12, Pitești', loadingDate: day(-3, 8), deliveryAddress: 'DN1 km 18, Ploiești', plannedDeliveryDate: day(-3, 13), price: 1600, currency: 'RON', status: 'invoiced' },
    { id: 't7', driverId: 'd3', vehicleId: 'v3', clientId: 'p5', senderId: 'p5', consigneeId: 'p3', loadingAddress: 'Str. Fabricii 3, Brașov', loadingDate: day(-2, 9), deliveryAddress: 'Bd. Industriilor 5, Cluj-Napoca', plannedDeliveryDate: day(-1, 11), price: 2700, currency: 'RON', status: 'delivered' },
    { id: 't8', driverId: 'd3', vehicleId: 'v3', clientId: 'p2', senderId: 'p1', consigneeId: 'p2', loadingAddress: 'Str. Depozitelor 12, Pitești', loadingDate: day(5, 6), deliveryAddress: 'Industriestraße 8, Stuttgart, DE', plannedDeliveryDate: day(7, 9), price: 2550, currency: 'EUR', status: 'planned' },
  ];
  const trips: Trip[] = tripRows.map((t) => ({ ...t, currency: t.currency ?? 'RON', companyId, createdAt: day(-8) }));

  const ecmrStatus: Record<Trip['status'], Ecmr['status']> = {
    planned: 'issued', in_progress: 'issued', loaded: 'loaded', delivered: 'delivered', invoiced: 'closed', cancelled: 'draft',
  };
  const ecmrs: Ecmr[] = trips.map((t, i) => ({
    id: `e${i + 1}`, tripId: t.id, number: `ECMR-2026-${String(1041 + i).padStart(5, '0')}`,
    status: ecmrStatus[t.status], snapshot: {}, issuedAt: t.createdAt,
    closedAt: t.status === 'invoiced' ? day(-2) : undefined,
    documentHash: ['loaded', 'delivered', 'invoiced'].includes(t.status) ? `sha256:${(0x9f3a12c + i * 7919).toString(16)}e4b7…` : undefined,
  }));

  const goodsData: Record<string, Omit<EcmrGoods, 'id' | 'ecmrId'>[]> = {
    t1: [{ description: 'Piese auto (discuri de frână)', packagesCount: 18, packagingType: 'Europaleți', weightKg: 9200, volumeM3: 32, marks: 'AP-2026-118' }],
    t2: [{ description: 'Bunuri de larg consum', packagesCount: 26, packagingType: 'Europaleți', weightKg: 11800, volumeM3: 48 }],
    t3: [{ description: 'Materiale de construcții (adeziv gresie)', packagesCount: 22, packagingType: 'Paleți', weightKg: 19800, volumeM3: 30 }],
    t4: [{ description: 'Produse lactate refrigerate (2–6 °C)', packagesCount: 20, packagingType: 'Europaleți', weightKg: 10400, volumeM3: 44 }],
    t5: [{ description: 'Ambalaje carton', packagesCount: 30, packagingType: 'Paleți', weightKg: 4100, volumeM3: 60 }],
    t6: [{ description: 'Piese auto (filtre)', packagesCount: 8, packagingType: 'Cutii pe palet', weightKg: 2300, volumeM3: 12 }],
    t7: [{ description: 'Gips-carton', packagesCount: 14, packagingType: 'Paleți', weightKg: 9600, volumeM3: 22 }, { description: 'Profile metalice', packagesCount: 6, packagingType: 'Baloți', weightKg: 1800, volumeM3: 6 }],
    t8: [{ description: 'Piese auto (amortizoare)', packagesCount: 16, packagingType: 'Europaleți', weightKg: 8700, volumeM3: 30 }],
  };
  const goods: EcmrGoods[] = [];
  ecmrs.forEach((e) => (goodsData[e.tripId] ?? []).forEach((g, j) => goods.push({ ...g, id: `g-${e.id}-${j}`, ecmrId: e.id })));

  const signatures: Signature[] = [];
  const remarks: Remark[] = [];
  const name = (id: string) => partners.find((p) => p.id === id)?.name ?? '';
  const driverName = (id: string) => profiles.find((p) => p.id === id)?.fullName ?? '';
  trips.forEach((t, i) => {
    const e = ecmrs[i];
    if (['loaded', 'delivered', 'invoiced'].includes(t.status)) {
      signatures.push({ id: `s-${e.id}-1`, ecmrId: e.id, party: 'sender', signerName: `Gheorghe Marin (${name(t.senderId)})`, signatureUrl: fakeSignature('Gheorghe Marin'), signedAt: t.loadingDate, latitude: 44.8565, longitude: 24.8692, documentHash: e.documentHash, collectedBy: t.driverId });
      signatures.push({ id: `s-${e.id}-2`, ecmrId: e.id, party: 'carrier', signerName: driverName(t.driverId), signatureUrl: fakeSignature(driverName(t.driverId)), signedAt: t.loadingDate, documentHash: e.documentHash, collectedBy: t.driverId });
    }
    if (['delivered', 'invoiced'].includes(t.status)) {
      signatures.push({ id: `s-${e.id}-3`, ecmrId: e.id, party: 'consignee', signerName: `Ana Varga (${name(t.consigneeId)})`, signatureUrl: fakeSignature('Ana Varga'), signedAt: t.plannedDeliveryDate, latitude: 47.4979, longitude: 19.0402, documentHash: e.documentHash, collectedBy: t.driverId });
    }
  });
  // O livrare cu observație, ca exemplu în dashboard.
  remarks.push({ id: 'r1', ecmrId: 'e7', stage: 'delivery', category: 'damaged_packaging', details: '1 palet cu folia ruptă, marfa intactă', createdBy: 'd3', createdAt: day(-1, 11) });

  return { companies, profiles, invites, vehicles, partners, trips, ecmrs, goods, signatures, remarks, photos: [] };
}
