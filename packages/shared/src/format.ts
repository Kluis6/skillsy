import type { UserProfile } from "./types";

export function formatReviewCount(count: number) {
  return `${count} ${count === 1 ? "avaliação" : "avaliações"}`;
}

export function formatRecommendationCount(count: number) {
  return `${count} ${count === 1 ? "indicação" : "indicações"}`;
}

/** Average rating with a Brazilian decimal comma: 4.5 → "4,5". */
export function formatRating(rating?: number) {
  return (rating || 0).toFixed(1).replace(".", ",");
}

export function nameInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "S";
}

/** What a professional does, for card subtitles. */
export function providerRoleLabel(provider: Partial<UserProfile>) {
  return (
    provider.serviceType ||
    provider.category ||
    (provider.isProvider ? "Prestador de serviço" : "Membro da comunidade")
  );
}
