// Sesiunea curentă – SIMULATĂ în localStorage pentru demo.
//   getCurrentDriverId() / setCurrentDriverId(id) / clearCurrentDriver()
//   getCurrentCompanyUser() → { companyId, profileId }
//   resetDemoData()
// În Supabase: Auth (supabase.auth.getUser()) + profilul din tabela profiles.
import { DEMO_ADMIN_ID, DEMO_COMPANY_ID } from "../mock/seed";
import { resetDb } from "../mock/store";

const DRIVER_KEY = "facturcmr:driverId";

export function getCurrentDriverId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DRIVER_KEY);
}

export function setCurrentDriverId(id: string) {
  window.localStorage.setItem(DRIVER_KEY, id);
}

export function clearCurrentDriver() {
  window.localStorage.removeItem(DRIVER_KEY);
}

/** În demo, dashboard-ul firmei e mereu deschis ca Elena Marin (admin). */
export function getCurrentCompanyUser(): { companyId: string; profileId: string } {
  return { companyId: DEMO_COMPANY_ID, profileId: DEMO_ADMIN_ID };
}

/** Șterge tot ce s-a modificat în demo și reîncarcă datele fictive. */
export function resetDemoData() {
  resetDb();
  clearCurrentDriver();
}
