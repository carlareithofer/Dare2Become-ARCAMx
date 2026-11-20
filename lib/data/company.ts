// Firma, șoferi, camioane, parteneri (date de referință pentru formulare).
//   getCompany(companyId)   → Company | null
//   getDrivers(companyId)   → Profile[] (doar rol „driver”)
//   getProfile(profileId)   → Profile | null
//   getVehicles(companyId)  → Vehicle[]
//   getPartners(companyId)  → Partner[]
// Implementare MOCK.
import { clone, delay, readDb } from "../mock/store";
import type { Company, Partner, Profile, Vehicle } from "../types";

export async function getCompany(companyId: string): Promise<Company | null> {
  await delay();
  return clone(readDb().companies.find((c) => c.id === companyId) ?? null);
}

export async function getDrivers(companyId: string): Promise<Profile[]> {
  await delay();
  return clone(
    readDb()
      .profiles.filter((p) => p.companyId === companyId && p.role === "driver")
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "ro")),
  );
}

export async function getProfile(profileId: string): Promise<Profile | null> {
  await delay(50);
  return clone(readDb().profiles.find((p) => p.id === profileId) ?? null);
}

export async function getVehicles(companyId: string): Promise<Vehicle[]> {
  await delay();
  return clone(readDb().vehicles.filter((v) => v.companyId === companyId));
}

export async function getPartners(companyId: string): Promise<Partner[]> {
  await delay();
  return clone(
    readDb()
      .partners.filter((p) => p.companyId === companyId)
      .sort((a, b) => a.name.localeCompare(b.name, "ro")),
  );
}
