import type { BodyType, RemarkCategory, SignatureParty, TripStatus } from '@/lib/types';

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
export const fmtDateLong = (iso: string) =>
  new Date(iso).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
export const fmtDateTime = (iso: string) => `${fmtDate(iso)}, ${fmtTime(iso)}`;
export const fmtMoney = (v: number, c: string) =>
  `${v.toLocaleString('ro-RO')} ${c}`;

export const city = (address: string) => {
  const parts = address.split(',').map((s) => s.trim());
  const last = parts[parts.length - 1];
  return /^[A-Z]{2}$/.test(last) && parts.length > 1 ? parts[parts.length - 2] : last;
};

export const statusLabel: Record<TripStatus, string> = {
  planned: 'Planificată',
  in_progress: 'În curs',
  loaded: 'Încărcată',
  delivered: 'Livrată',
  invoiced: 'Facturată',
  cancelled: 'Anulată',
};

export const remarkLabel: Record<RemarkCategory, string> = {
  missing_packages: 'Lipsă colete',
  damaged_packaging: 'Ambalaj deteriorat',
  damaged_goods: 'Marfă deteriorată',
  delay: 'Întârziere',
  other: 'Altceva',
};

export const partyLabel: Record<SignatureParty, string> = {
  sender: 'Expeditor',
  carrier: 'Transportator',
  consignee: 'Destinatar',
};

export const bodyTypeLabel: Record<BodyType, string> = {
  tarp: 'Prelată',
  reefer: 'Frigorific',
  tanker: 'Cisternă',
  box: 'Furgon',
  flatbed: 'Platformă',
  other: 'Altul',
};
