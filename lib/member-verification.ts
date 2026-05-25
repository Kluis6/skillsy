import type { UserProfile } from "@/models/types";

type VerificationSource = Partial<
  Pick<UserProfile, "ward" | "baptismYear" | "memberVerified">
> | null | undefined;

export function normalizeBaptismYear(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d{4}$/.test(value.trim())) {
    return Number(value.trim());
  }

  return undefined;
}

export function hasMembershipVerificationData(profile: VerificationSource) {
  if (!profile) {
    return false;
  }

  const ward = typeof profile.ward === "string" ? profile.ward.trim() : "";
  const baptismYear = normalizeBaptismYear(profile.baptismYear);

  return Boolean(
    ward &&
      typeof baptismYear === "number" &&
      Number.isFinite(baptismYear) &&
      baptismYear >= 1830 &&
      baptismYear <= new Date().getFullYear(),
  );
}

export function shouldShowVerifiedBadge(profile: VerificationSource) {
  return Boolean(profile?.memberVerified) || hasMembershipVerificationData(profile);
}

export function deriveMemberVerification(profile: VerificationSource) {
  const memberVerified = hasMembershipVerificationData(profile);

  return {
    memberVerified,
    membershipYears: memberVerified ? getMembershipYears(profile) : undefined,
  };
}

export function getMembershipYears(profile: VerificationSource) {
  if (!profile) {
    return undefined;
  }

  const baptismYear = normalizeBaptismYear(profile.baptismYear);
  if (
    typeof baptismYear !== "number" ||
    !Number.isFinite(baptismYear) ||
    baptismYear < 1830 ||
    baptismYear > new Date().getFullYear()
  ) {
    return undefined;
  }

  return new Date().getFullYear() - baptismYear;
}
