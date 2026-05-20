import type { UserProfile } from "@/models/types";

type VerificationSource = Partial<
  Pick<UserProfile, "ward" | "baptismYear" | "memberVerified">
> | null | undefined;

export function hasMembershipVerificationData(profile: VerificationSource) {
  if (!profile) {
    return false;
  }

  const ward = typeof profile.ward === "string" ? profile.ward.trim() : "";
  const baptismYear = profile.baptismYear;

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

export function getMembershipYears(profile: VerificationSource) {
  if (!profile) {
    return undefined;
  }

  const baptismYear = profile.baptismYear;
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
