// Building users/{uid} and public_profiles/{uid} so firestore.rules accept
// them. Shared by the site (services/user-service.ts) and the app, which use
// different copies of the Firebase SDK: the few Firestore values needed
// (timestamps, deleteField, serverTimestamp) come in through an adapter.
import type { UserProfile } from "./types";
import { AVAILABILITY_OPTIONS, PROVIDER_CATEGORIES } from "./profile-options";
import { deriveMemberVerification } from "./member-verification";
import { toSearchTokens } from "./search";

/** Firestore pieces this module needs, from the caller's SDK. */
export type FirestoreAdapter = {
  isTimestamp: (value: unknown) => boolean;
  timestamp: (seconds: number, nanoseconds: number) => unknown;
  timestampFromDate: (date: Date) => unknown;
  deleteField: () => unknown;
  serverTimestamp: () => unknown;
};

/** Fields users/{uid} may hold (firestore.rules: isValidUser / isValidUserUpdate). */
export const USER_PROFILE_FIELDS: ReadonlySet<string> = new Set([
  "id",
  "uid",
  "name",
  "email",
  "photoURL",
  "bannerURL",
  "bio",
  "category",
  "isProvider",
  "hasPublicProfile",
  "role",
  "contacts",
  "whatsapp",
  "instagram",
  "facebook",
  "linkedin",
  "website",
  "serviceType",
  "phone",
  "phones",
  "location",
  "ward",
  "companyName",
  "gallery",
  "rating",
  "reviewCount",
  "experienceYears",
  "baptismYear",
  "memberVerified",
  "membershipYears",
  "communityFriend",
  "isBlocked",
  "isDeleted",
  "deletedByUser",
  "deletedAt",
  "createdAt",
  "socialLinks",
  "availability",
  "serviceHours",
  "businessAddress",
  "businessAddressNumber",
  "businessNeighborhood",
  "businessState",
  "showPublicLocation",
  "businessComplement",
]);

/** Fields an owner can never change through a profile update. */
export const IMMUTABLE_PROFILE_FIELDS: ReadonlySet<string> = new Set([
  "uid",
  "email",
  "role",
  "createdAt",
  "isBlocked",
  "rating",
  "reviewCount",
]);

export function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object" && isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, removeUndefinedDeep(nestedValue)]),
    ) as T;
  }

  return value;
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function normalizeOptionalFirestoreString(value: unknown) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getPublicCity(location: unknown) {
  if (typeof location !== "string") return "";
  return location.split(",")[0]?.trim().slice(0, 100) || "";
}

export function getPublicState(
  source: Partial<UserProfile>,
): string | undefined {
  const explicitState = source.businessState?.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(explicitState || "")) return explicitState;

  const locationState =
    typeof source.location === "string"
      ? source.location.split(",").at(-1)?.trim().toUpperCase()
      : "";
  // Must stay `undefined` (never ""): the public profile schema validates
  // publicState against /^[A-Z]{2}$/ when the field is present at all, so an
  // empty string would fail that check and the whole write would be denied.
  return /^[A-Z]{2}$/.test(locationState || "") ? locationState : undefined;
}

export function normalizeBoundedString(value: unknown, maxLength: number) {
  const normalized = normalizeOptionalFirestoreString(value);

  if (typeof normalized !== "string") {
    return undefined;
  }

  return normalized.length <= maxLength ? normalized : undefined;
}

export function normalizeBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

export function normalizeFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export function normalizeEmail(value: unknown) {
  const normalized = normalizeBoundedString(value, 320);

  if (typeof normalized !== "string") {
    return undefined;
  }

  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalized)
    ? normalized
    : undefined;
}

export function normalizeRole(value: unknown) {
  return value === "admin" || value === "user" ? value : undefined;
}

export function normalizeStringArray(value: unknown, maxItems?: number) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const next = value.filter((item): item is string => typeof item === "string");
  if (maxItems !== undefined && next.length > maxItems) {
    return next.slice(0, maxItems);
  }

  return next;
}

export function normalizeAvailabilityForRules(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const next = value.filter(
    (item): item is (typeof AVAILABILITY_OPTIONS)[number] =>
      typeof item === "string" &&
      (AVAILABILITY_OPTIONS as readonly string[]).includes(item),
  );

  return next.slice(0, 7);
}

export function normalizeGalleryForRules(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const next = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const maybeItem = item as { url?: unknown; description?: unknown };
      const url = normalizeBoundedString(maybeItem.url, 1000000);
      if (!url) {
        return null;
      }

      const description = normalizeBoundedString(maybeItem.description, 200);
      return description ? { url, description } : { url };
    })
    .filter(
      (item): item is { url: string; description?: string } => item !== null,
    )
    .slice(0, 5);

  return next;
}

export function isTimestampLike(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "seconds" in (value as Record<string, unknown>) ||
    "toDate" in (value as Record<string, unknown>) ||
    "toMillis" in (value as Record<string, unknown>)
  );
}

export function hasValidVerificationShape(source: Partial<UserProfile>) {
  return Boolean(
    typeof source.ward === "string" &&
    source.ward.trim().length > 0 &&
    typeof source.baptismYear === "number" &&
    Number.isFinite(source.baptismYear) &&
    source.baptismYear >= 1830 &&
    source.baptismYear <= 2100,
  );
}

export function assertRuleCompatibleProfile(
  source: Partial<UserProfile>,
  mode: "private" | "public",
) {
  const label = mode === "private" ? "Perfil privado" : "Perfil público";

  if (!source.uid || typeof source.uid !== "string") {
    throw new Error(`${label}: uid ausente ou invalido.`);
  }

  if (
    !source.name ||
    typeof source.name !== "string" ||
    source.name.length > 100
  ) {
    throw new Error(`${label}: nome ausente ou invalido.`);
  }

  if (mode === "private") {
    if (!source.email || typeof source.email !== "string") {
      throw new Error("Perfil privado: email ausente ou invalido.");
    }

    if (source.role !== "admin" && source.role !== "user") {
      throw new Error("Perfil privado: role invalido.");
    }
  }

  if (typeof source.isProvider !== "boolean") {
    throw new Error(`${label}: isProvider invalido.`);
  }

  if (!isTimestampLike(source.createdAt)) {
    throw new Error(`${label}: createdAt invalido.`);
  }

  if (
    "deletedAt" in source &&
    source.deletedAt !== undefined &&
    !isTimestampLike(source.deletedAt)
  ) {
    throw new Error(`${label}: deletedAt invalido.`);
  }

  if (source.category === "") {
    throw new Error(`${label}: category vazia nao e aceita pelas regras.`);
  }

  const hasValidVerification = hasValidVerificationShape(source);
  if (hasValidVerification && source.memberVerified !== true) {
    throw new Error(
      `${label}: memberVerified precisa ser true quando ward e baptismYear sao validos.`,
    );
  }

  if (!hasValidVerification && source.memberVerified === true) {
    throw new Error(
      `${label}: memberVerified nao pode ser true sem ward e baptismYear validos.`,
    );
  }

  if (
    source.membershipYears !== undefined &&
    (typeof source.membershipYears !== "number" ||
      !Number.isFinite(source.membershipYears) ||
      source.membershipYears < 0 ||
      source.membershipYears > 300)
  ) {
    throw new Error(`${label}: membershipYears invalido.`);
  }
}

export function buildPublicProfileData(source: Partial<UserProfile>) {
  const publicCity = getPublicCity(source.location);
  const publicState = getPublicState(source);

  return removeUndefinedDeep({
    uid: source.uid,
    name: source.name,
    photoURL: source.photoURL || "",
    bannerURL: source.bannerURL || "",
    bio: source.bio || "",
    category: normalizeBoundedString(source.category, 100),
    isProvider: source.isProvider ?? false,
    serviceType: source.serviceType || "",
    publicCity,
    publicState,
    ward: source.ward || "",
    memberVerified: source.memberVerified ?? false,
    communityFriend: source.communityFriend ?? false,
    searchTokens: toSearchTokens(
      source.name,
      source.category,
      source.serviceType,
      source.companyName,
      publicCity,
      publicState,
      // Last, so a long bio can never push the fields above out of the cap.
      source.bio,
    ),
    companyName: source.companyName || "",
    gallery: source.gallery || [],
    // Aggregates (ratingSum, reviewCount, recommendationCount) are only changed
    // by the rating/recommendation flows the rules validate; merge writes keep them.
    experienceYears: source.experienceYears,
    availability: source.availability || [],
    serviceHours: source.serviceHours || "",
    whatsapp: source.whatsapp || "",
    instagram: source.instagram || "",
    facebook: source.facebook || "",
    linkedin: source.linkedin || "",
    website: source.website || "",
    phone: source.phone || "",
    phones: source.phones || [],
    isBlocked: source.isBlocked ?? false,
    isDeleted: source.isDeleted ?? false,
    createdAt: source.createdAt,
  });
}

export function applyDerivedVerificationFields(source: Partial<UserProfile>) {
  const verification = deriveMemberVerification(source);

  return removeUndefinedDeep({
    ...source,
    memberVerified: verification.memberVerified,
    membershipYears: verification.membershipYears,
  });
}

export function shouldSyncPublicProfile(
  source: Partial<UserProfile> | Record<string, unknown> | null | undefined,
) {
  if (!source) {
    return false;
  }

  if (typeof source.hasPublicProfile === "boolean") {
    return source.hasPublicProfile;
  }

  return source.isProvider === true;
}

export function createProfileDocuments(fs: FirestoreAdapter) {
  function normalizeTimestampValue(value: unknown) {
    if (fs.isTimestamp(value)) {
      return value;
    }

    if (
      value &&
      typeof value === "object" &&
      "seconds" in (value as Record<string, unknown>) &&
      "nanoseconds" in (value as Record<string, unknown>)
    ) {
      const seconds = (value as Record<string, unknown>).seconds;
      const nanoseconds = (value as Record<string, unknown>).nanoseconds;

      if (
        typeof seconds === "number" &&
        Number.isFinite(seconds) &&
        typeof nanoseconds === "number" &&
        Number.isFinite(nanoseconds)
      ) {
        return fs.timestamp(seconds, nanoseconds);
      }
    }

    if (typeof value === "string") {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return fs.timestampFromDate(date);
      }
    }

    return undefined;
  }

  function buildUserProfileUpdatePatch(
    current: Record<string, unknown>,
    rawCurrent: Record<string, unknown>,
    next: Record<string, unknown>,
    immutableKeys: ReadonlySet<string>,
    allowedKeys: ReadonlySet<string>,
  ) {
    const patch: Record<string, unknown> = {};
    const keys = new Set([
      ...Object.keys(rawCurrent),
      ...Object.keys(current),
      ...Object.keys(next),
    ]);

    for (const key of keys) {
      if (key === "id") {
        continue;
      }

      if (!allowedKeys.has(key)) {
        if (key in rawCurrent) {
          patch[key] = fs.deleteField();
        }
        continue;
      }

      if (immutableKeys.has(key)) {
        continue;
      }

      if (!(key in next) || next[key] === undefined) {
        if (key in current) {
          patch[key] = fs.deleteField();
        }
        continue;
      }

      patch[key] = next[key];
    }

    return patch;
  }

  function normalizeUserDocumentForRules(source: Record<string, unknown>) {
    const normalized = removeUndefinedDeep({ ...source }) as Record<
      string,
      unknown
    >;

    normalized.uid = normalizeBoundedString(normalized.uid, 128);
    normalized.name = normalizeBoundedString(normalized.name, 100);
    normalized.email = normalizeEmail(normalized.email);
    normalized.role = normalizeRole(normalized.role);
    normalized.photoURL = normalizeBoundedString(normalized.photoURL, 1000000);
    normalized.bannerURL = normalizeBoundedString(
      normalized.bannerURL,
      1000000,
    );
    normalized.bio = normalizeBoundedString(normalized.bio, 2000);
    normalized.whatsapp = normalizeBoundedString(normalized.whatsapp, 30);
    normalized.phone = normalizeBoundedString(normalized.phone, 30);
    normalized.instagram = normalizeBoundedString(normalized.instagram, 100);
    normalized.facebook = normalizeBoundedString(normalized.facebook, 100);
    normalized.linkedin = normalizeBoundedString(normalized.linkedin, 100);
    normalized.website = normalizeBoundedString(normalized.website, 200);
    normalized.serviceType = normalizeBoundedString(
      normalized.serviceType,
      200,
    );
    normalized.location = normalizeBoundedString(normalized.location, 200);
    normalized.ward = normalizeBoundedString(normalized.ward, 200);
    normalized.companyName = normalizeBoundedString(
      normalized.companyName,
      200,
    );
    normalized.serviceHours = normalizeBoundedString(
      normalized.serviceHours,
      200,
    );
    normalized.businessAddress = normalizeBoundedString(
      normalized.businessAddress,
      200,
    );
    normalized.businessAddressNumber = normalizeBoundedString(
      normalized.businessAddressNumber,
      20,
    );
    normalized.businessNeighborhood = normalizeBoundedString(
      normalized.businessNeighborhood,
      100,
    );
    normalized.businessState = normalizeBoundedString(
      normalized.businessState,
      100,
    )?.toUpperCase();
    normalized.businessComplement = normalizeBoundedString(
      normalized.businessComplement,
      100,
    );

    const category = normalizeBoundedString(normalized.category, 100);
    normalized.category =
      typeof category === "string" &&
      (PROVIDER_CATEGORIES as readonly string[]).includes(category)
        ? category
        : undefined;

    normalized.contacts = normalizeStringArray(normalized.contacts);
    normalized.phones = normalizeStringArray(normalized.phones);
    normalized.availability = normalizeAvailabilityForRules(
      normalized.availability,
    );
    normalized.gallery = normalizeGalleryForRules(normalized.gallery);
    normalized.hasPublicProfile = normalizeBoolean(normalized.hasPublicProfile);
    normalized.communityFriend = normalizeBoolean(normalized.communityFriend);

    normalized.rating = normalizeFiniteNumber(normalized.rating);
    normalized.reviewCount = normalizeFiniteNumber(normalized.reviewCount);
    normalized.experienceYears = normalizeFiniteNumber(
      normalized.experienceYears,
    );
    const baptismYear = normalizeFiniteNumber(normalized.baptismYear);
    normalized.baptismYear =
      baptismYear !== undefined &&
      baptismYear >= 1830 &&
      baptismYear <= new Date().getFullYear()
        ? baptismYear
        : undefined;

    normalized.isBlocked = normalizeBoolean(normalized.isBlocked);
    normalized.isDeleted = normalizeBoolean(normalized.isDeleted);
    normalized.deletedByUser = normalizeBoolean(normalized.deletedByUser);
    normalized.isProvider = normalizeBoolean(normalized.isProvider);
    normalized.createdAt = normalizeTimestampValue(normalized.createdAt);
    normalized.deletedAt = normalizeTimestampValue(normalized.deletedAt);

    return removeUndefinedDeep(normalized);
  }

  /**
   * What a profile save writes: the patch for users/{uid} (with deleteField
   * for removed keys) and the full private and public documents. `current` is
   * the stored users/{uid}; `changes` is what the form edited, with
   * `undefined` meaning "cleared".
   */
  function prepareProfileUpdate({
    uid,
    current,
    changes,
    authUser,
  }: {
    uid: string;
    current: Record<string, unknown>;
    changes: Partial<UserProfile>;
    authUser?: { displayName?: string | null; email?: string | null } | null;
  }) {
    const allowedUserFields = USER_PROFILE_FIELDS;
    const immutableKeys = IMMUTABLE_PROFILE_FIELDS;
    const sanitizeData = (source: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(source).filter(
          ([key, value]) =>
            allowedUserFields.has(key) && key !== "id" && value !== undefined,
        ),
      );

    const rawCurrentData = current;
    const currentData = normalizeUserDocumentForRules(
      sanitizeData(rawCurrentData),
    );
    const incomingData = normalizeUserDocumentForRules(
      sanitizeData(changes as Record<string, unknown>),
    );

    const safeIncomingData = Object.fromEntries(
      Object.entries(incomingData).filter(
        ([key, value]) => !immutableKeys.has(key) && value !== undefined,
      ),
    );

    // Keys sent explicitly as `undefined` were emptied in the form (a bio
    // erased, member fields dropped for a community friend). Without this,
    // the merge below would keep the stored value and the field could never
    // be cleared.
    const clearedKeys = new Set(
      Object.entries(changes)
        .filter(
          ([key, value]) =>
            value === undefined &&
            allowedUserFields.has(key) &&
            !immutableKeys.has(key),
        )
        .map(([key]) => key),
    );
    const keptCurrentData = Object.fromEntries(
      Object.entries(currentData).filter(([key]) => !clearedKeys.has(key)),
    );

    const createdAt =
      currentData.createdAt !== undefined
        ? currentData.createdAt
        : fs.serverTimestamp();

    const nextData: Partial<UserProfile> = {
      ...keptCurrentData,
      ...safeIncomingData,
      uid,
      name:
        normalizeBoundedString(safeIncomingData.name, 100) ??
        normalizeBoundedString(currentData.name, 100) ??
        authUser?.displayName ??
        "Membro Skillsy",
      email:
        normalizeEmail(currentData.email) ??
        normalizeEmail(safeIncomingData.email) ??
        authUser?.email ??
        "",
      isProvider:
        (safeIncomingData.isProvider as boolean | undefined) ??
        (currentData.isProvider as boolean | undefined) ??
        false,
      hasPublicProfile:
        typeof safeIncomingData.hasPublicProfile === "boolean"
          ? (safeIncomingData.hasPublicProfile as boolean)
          : Object.prototype.hasOwnProperty.call(safeIncomingData, "isProvider")
            ? ((safeIncomingData.isProvider as boolean | undefined) ?? false)
            : ((currentData.hasPublicProfile as boolean | undefined) ??
              (currentData.isProvider as boolean | undefined) ??
              false),
      role: normalizeRole(currentData.role) ?? "user",
      contacts: (currentData.contacts as string[] | undefined) ?? [],
      createdAt,
    };
    const sanitizedPrivateProfile = applyDerivedVerificationFields(
      removeUndefinedDeep(nextData),
    );
    const publicProfileData = buildPublicProfileData(
      sanitizedPrivateProfile as Partial<UserProfile>,
    );
    assertRuleCompatibleProfile(
      sanitizedPrivateProfile as Partial<UserProfile>,
      "private",
    );
    if (
      shouldSyncPublicProfile(sanitizedPrivateProfile as Partial<UserProfile>)
    ) {
      assertRuleCompatibleProfile(
        publicProfileData as Partial<UserProfile>,
        "public",
      );
    }
    const privatePatch = buildUserProfileUpdatePatch(
      currentData,
      rawCurrentData,
      sanitizedPrivateProfile as Record<string, unknown>,
      immutableKeys,
      allowedUserFields,
    );

    return {
      privatePatch,
      privateProfile: sanitizedPrivateProfile as Partial<UserProfile>,
      publicProfile: publicProfileData as Partial<UserProfile>,
    };
  }

  return {
    normalizeTimestampValue,
    normalizeUserDocumentForRules,
    buildUserProfileUpdatePatch,
    prepareProfileUpdate,
  };
}
