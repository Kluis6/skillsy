import type { UserProfile } from "./types";
import { toSearchStemGroups, toSearchStems, toSearchTokens } from "./search";

const publicProfileDefaults: Pick<UserProfile, "email" | "role" | "contacts"> =
  {
    email: "",
    role: "user",
    contacts: [],
  };

// Profiles store ratingSum + reviewCount so the rules can validate each new
// rating; the average is derived here. Legacy profiles fall back to rating.
export function getAverageRating(source: Partial<UserProfile>) {
  const count = source.reviewCount || 0;
  if (typeof source.ratingSum === "number" && count > 0) {
    return Math.round((source.ratingSum / count) * 10) / 10;
  }
  return source.rating;
}

export function toPublicProfileModel(
  source: Partial<UserProfile> | Record<string, unknown> | null | undefined,
): UserProfile | null {
  if (!source) {
    return null;
  }

  const raw = source as Partial<UserProfile>;
  if (!raw.uid || !raw.name) {
    return null;
  }

  return {
    uid: raw.uid,
    name: raw.name,
    isProvider: raw.isProvider ?? false,
    createdAt: raw.createdAt ?? null,
    ...publicProfileDefaults,
    photoURL: raw.photoURL || "",
    bannerURL: raw.bannerURL || "",
    bio: raw.bio || "",
    category: raw.category || "",
    serviceType: raw.serviceType || "",
    publicCity: raw.publicCity || "",
    publicState: raw.publicState || "",
    ward: raw.ward || "",
    memberVerified: raw.memberVerified ?? false,
    communityFriend: raw.communityFriend ?? false,
    searchTokens: raw.searchTokens || [],
    companyName: raw.companyName || "",
    gallery: raw.gallery || [],
    rating: getAverageRating(raw),
    reviewCount: raw.reviewCount,
    recommendationCount: raw.recommendationCount ?? 0,
    experienceYears: raw.experienceYears,
    availability: raw.availability || [],
    serviceHours: raw.serviceHours || "",
    whatsapp: raw.whatsapp || "",
    instagram: raw.instagram || "",
    facebook: raw.facebook || "",
    linkedin: raw.linkedin || "",
    website: raw.website || "",
    phone: raw.phone || "",
    phones: raw.phones || [],
    isBlocked: raw.isBlocked,
    isDeleted: raw.isDeleted,
  };
}

export function sortProvidersByFeaturedRanking(profiles: UserProfile[]) {
  return [...profiles].sort((a, b) => {
    const aRecommendations = a.recommendationCount ?? 0;
    const bRecommendations = b.recommendationCount ?? 0;

    if (bRecommendations !== aRecommendations) {
      return bRecommendations - aRecommendations;
    }

    const aRating = typeof a.rating === "number" ? a.rating : 0;
    const bRating = typeof b.rating === "number" ? b.rating : 0;

    if (bRating !== aRating) {
      return bRating - aRating;
    }

    const aReviews = typeof a.reviewCount === "number" ? a.reviewCount : 0;
    const bReviews = typeof b.reviewCount === "number" ? b.reviewCount : 0;

    if (bReviews !== aReviews) {
      return bReviews - aReviews;
    }

    return a.name.localeCompare(b.name, "pt-BR");
  });
}

/**
 * Only profiles actively offering services belong in professional listings
 * (home, search, suggestions): "Quero anunciar" on, not blocked, not deleted.
 */
export function isActiveProvider(
  profile: Partial<UserProfile> | null | undefined,
): profile is UserProfile {
  return (
    profile != null &&
    profile.isProvider === true &&
    profile.isBlocked !== true &&
    profile.isDeleted !== true
  );
}

/**
 * What a professional search asks Firestore for. Firestore can only filter on
 * one array-contains, so the query uses the longest stem as `anchor` and
 * `pickSearchResults` checks the remaining terms and the city afterwards.
 * With `synonyms` (other languages → Portuguese), a word with alternatives is
 * a group in `termGroups`; when the anchor has to be one of those groups,
 * `anchorAny` lists its stems for an array-contains-any query instead.
 */
export type ProviderSearchPlan = {
  terms: string[];
  termGroups?: string[][];
  cityTokens: string[];
  anchor?: string;
  anchorAny?: string[];
  state?: string;
  category?: string;
};

export function planProviderSearch(
  term: string,
  location?: { city?: string; state?: string },
  category?: string,
  synonyms?: Record<string, string>,
): ProviderSearchPlan {
  const cityTokens = toSearchTokens(location?.city || "").filter(
    (token) => token.length >= 3,
  );
  const base = {
    cityTokens,
    state: location?.state ? location.state.trim().toUpperCase() : undefined,
    category: category || undefined,
  };
  const groups = toSearchStemGroups(term, synonyms);

  if (!groups.some((group) => group.length > 1)) {
    // Same plan as before synonyms existed (the app and Portuguese pages).
    const terms = toSearchStems(term);
    return {
      ...base,
      terms,
      anchor: [...terms, ...cityTokens].sort((a, b) => b.length - a.length)[0],
    };
  }

  // Anchor on a single stem when there is one; otherwise on the group with
  // the longest stem, through array-contains-any.
  const singles = [...groups.filter((group) => group.length === 1).map((group) => group[0]), ...cityTokens];
  const anchor = singles.sort((a, b) => b.length - a.length)[0];
  const anchorAny = anchor
    ? undefined
    : [...groups].sort((a, b) => Math.max(...b.map((x) => x.length)) - Math.max(...a.map((x) => x.length)))[0];
  return { ...base, terms: [], termGroups: groups, anchor, anchorAny };
}

/** Turns the documents returned for a plan into the ranked result list. */
export function pickSearchResults(
  documents: unknown[],
  plan: ProviderSearchPlan,
): UserProfile[] {
  const candidates = documents
    .map((document) => toPublicProfileModel(document as Partial<UserProfile>))
    .filter(isActiveProvider);

  return sortProvidersByFeaturedRanking(
    candidates.filter((profile) => {
      const profileTokens = profile.searchTokens || [];
      return (
        plan.terms.every((token) => profileTokens.includes(token)) &&
        (plan.termGroups ?? []).every((group) => group.some((token) => profileTokens.includes(token))) &&
        plan.cityTokens.every((token) => profileTokens.includes(token))
      );
    }),
  );
}
