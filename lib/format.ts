// Formatare pentru afișare (română).
const dateFmt = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "short", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("ro-RO", { weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("ro-RO", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatShortDate = (iso: string) => shortDateFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`;

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export const formatKg = (kg: number) => `${new Intl.NumberFormat("ro-RO").format(kg)} kg`;

/** „Azi”, „Mâine”, „Ieri” sau data scurtă. */
export function formatRelativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(d) - startOf(today)) / 86_400_000);
  if (diff === 0) return "Azi";
  if (diff === 1) return "Mâine";
  if (diff === -1) return "Ieri";
  return formatShortDate(iso);
}

export function formatCoords(lat?: number, lng?: number): string | null {
  if (lat === undefined || lng === undefined) return null;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
