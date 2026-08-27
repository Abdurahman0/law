// Mock account-registration service. Simulates persisting a registration draft
// and returns the created account. Replace the body with a real API call later.
import { mockDelay, jitter } from "./mockDelay";
import type { AccountType, ProfessionalProfile, RegistrationDraft } from "@/lib/types";

export type RegisteredAccount = {
  id: string;
  accountType: AccountType;
  name: string;
  phone: string;
};

function genId(): string {
  return "u_" + Math.random().toString(36).slice(2, 10);
}

export async function registerAccount(
  draft: RegistrationDraft,
): Promise<RegisteredAccount> {
  await mockDelay(jitter(1100, 500));
  if (!draft.accountType) throw new Error("account_type_required");
  if (!draft.phoneVerified) throw new Error("phone_not_verified");
  return {
    id: genId(),
    accountType: draft.accountType,
    name: draft.profile.name.trim(),
    phone: draft.phone,
  };
}

// Profile completeness scoring — drives the "complete your profile" nudges.
export function scoreCompleteness(
  accountType: AccountType,
  p: ProfessionalProfile,
): number {
  if (accountType === "client") return p.name ? 100 : 0;
  const checks: boolean[] =
    accountType === "lawyer"
      ? [
          !!p.name,
          !!p.photo,
          !!p.region,
          p.languages.length > 0,
          !!p.education,
          !!p.experienceYears,
          !!p.bio,
          p.services.length > 0,
        ]
      : [
          !!p.name,
          !!p.photo,
          !!p.email,
          !!p.region,
          p.languages.length > 0,
          !!p.licenseNumber,
          !!p.barAssociation,
          !!p.specialization,
          p.practiceAreas.length > 0,
          p.workHistory.length > 0,
          !!p.stats,
          !!p.bio,
        ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
