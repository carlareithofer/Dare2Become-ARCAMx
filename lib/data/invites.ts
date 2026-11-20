// Coduri de invitație pentru șoferi (6 caractere).
//   getInvites(companyId)                       → DriverInvite[]
//   createInvite({ companyId, fullName, phone }) → DriverInvite (valabil 7 zile)
//   redeemInvite(code)                          → Profile (șoferul; îl creează dacă e nou)
// ATENȚIE: DriverInvite NU e încă în schema din lib/types.ts. Răzvan: dacă îl adaugi în DB
// (ex. tabelul `driver_invites`), mutăm tipul în lib/types.ts.
// Implementare MOCK.
import { clone, delay, mutateDb, newId, readDb, type DriverInvite } from "../mock/store";
import type { Profile } from "../types";

export type { DriverInvite };

// Fără 0/O și 1/I/L, ca să nu se confunde la citit de pe telefon.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 6;

function randomCode(): string {
  return Array.from({ length: INVITE_CODE_LENGTH }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
}

export function normalizeInviteCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function getInvites(companyId: string): Promise<DriverInvite[]> {
  await delay();
  return clone(
    readDb()
      .invites.filter((i) => i.companyId === companyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function createInvite(input: { companyId: string; fullName: string; phone: string }): Promise<DriverInvite> {
  await delay(250);
  return mutateDb((db) => {
    let code = randomCode();
    while (db.invites.some((i) => i.code === code)) code = randomCode();
    const now = new Date();
    const invite: DriverInvite = {
      id: newId("i"),
      companyId: input.companyId,
      code,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(),
    };
    db.invites.push(invite);
    return clone(invite);
  });
}

export async function redeemInvite(code: string): Promise<Profile> {
  await delay(300);
  const normalized = normalizeInviteCode(code);
  return mutateDb((db) => {
    const invite = db.invites.find((i) => i.code === normalized);
    if (!invite) throw new Error("Codul nu există. Verifică-l sau cere unul nou de la firmă.");
    if (new Date(invite.expiresAt) < new Date()) throw new Error("Codul a expirat. Cere unul nou de la firmă.");
    // În mock lăsăm codul refolosibil pe același profil, ca demo-ul să poată fi repetat.
    let profile = invite.profileId ? db.profiles.find((p) => p.id === invite.profileId) : undefined;
    if (!profile) {
      profile = {
        id: newId("d"),
        companyId: invite.companyId,
        role: "driver",
        fullName: invite.fullName,
        phone: invite.phone,
        language: "ro",
      };
      db.profiles.push(profile);
      invite.profileId = profile.id;
    }
    invite.usedAt ??= new Date().toISOString();
    return clone(profile);
  });
}
