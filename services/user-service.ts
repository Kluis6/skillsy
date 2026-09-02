import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  QueryConstraint,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  addDoc,
  runTransaction,
  writeBatch,
  deleteDoc,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toPlainValue } from "@/lib/firestore-plain";
import {
  CommunityRecommendation,
  Rating,
  UserProfile,
  UserReport,
} from "@/models/types";
import { AVAILABILITY_OPTIONS, PROVIDER_CATEGORIES } from "@/lib/profile-form";
import { NotificationService } from "./notification-service";
import { deriveMemberVerification } from "@/lib/member-verification";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

function isPermissionDeniedError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("missing or insufficient permissions") ||
    message.includes("permission_denied")
  );
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function removeUndefinedDeep<T>(value: T): T {
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeOptionalFirestoreString(value: unknown) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toSearchTokens(...values: Array<unknown>) {
  const words = values
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .split(/[^a-z0-9]+/),
    )
    .filter((word) => word.length >= 2);

  const tokens = new Set<string>();
  for (const word of words) {
    tokens.add(word);
    for (let length = 3; length < word.length; length += 1)
      tokens.add(word.slice(0, length));
  }
  return [...tokens].slice(0, 80);
}

function getPublicCity(location: unknown) {
  if (typeof location !== "string") return "";
  return location.split(",")[0]?.trim().slice(0, 100) || "";
}

function getPublicState(source: Partial<UserProfile>): string | undefined {
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

function normalizeBoundedString(value: unknown, maxLength: number) {
  const normalized = normalizeOptionalFirestoreString(value);

  if (typeof normalized !== "string") {
    return undefined;
  }

  return normalized.length <= maxLength ? normalized : undefined;
}

function normalizeBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeTimestampValue(value: unknown) {
  if (value instanceof Timestamp) {
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
      return new Timestamp(seconds, nanoseconds);
    }
  }

  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return Timestamp.fromDate(date);
    }
  }

  return undefined;
}

function normalizeEmail(value: unknown) {
  const normalized = normalizeBoundedString(value, 320);

  if (typeof normalized !== "string") {
    return undefined;
  }

  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalized)
    ? normalized
    : undefined;
}

function normalizeRole(value: unknown) {
  return value === "admin" || value === "user" ? value : undefined;
}

function normalizeStringArray(value: unknown, maxItems?: number) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const next = value.filter((item): item is string => typeof item === "string");
  if (maxItems !== undefined && next.length > maxItems) {
    return next.slice(0, maxItems);
  }

  return next;
}

function normalizeAvailabilityForRules(value: unknown) {
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

function normalizeGalleryForRules(value: unknown) {
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

function isTimestampLike(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "seconds" in (value as Record<string, unknown>) ||
    "toDate" in (value as Record<string, unknown>) ||
    "toMillis" in (value as Record<string, unknown>)
  );
}

function hasValidVerificationShape(source: Partial<UserProfile>) {
  return Boolean(
    typeof source.ward === "string" &&
    source.ward.trim().length > 0 &&
    typeof source.baptismYear === "number" &&
    Number.isFinite(source.baptismYear) &&
    source.baptismYear >= 1830 &&
    source.baptismYear <= 2100,
  );
}

function assertRuleCompatibleProfile(
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

function summarizeDebugValue(value: unknown): unknown {
  if (typeof value === "string") {
    return {
      type: "string",
      length: value.length,
      preview: value.slice(0, 120),
    };
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return {
      type: "array",
      size: value.length,
      sample: value.slice(0, 2).map((item) => summarizeDebugValue(item)),
    };
  }

  if (isTimestampLike(value)) {
    return {
      type: "timestamp-like",
      keys: Object.keys(value as Record<string, unknown>),
    };
  }

  if (value && typeof value === "object") {
    return {
      type: "object",
      keys: Object.keys(value as Record<string, unknown>),
    };
  }

  return typeof value;
}

function summarizeProfileForDebug(source: Partial<UserProfile>) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      summarizeDebugValue(value),
    ]),
  );
}

function buildUserProfileUpdatePatch(
  current: Record<string, unknown>,
  rawCurrent: Record<string, unknown>,
  next: Record<string, unknown>,
  immutableKeys: Set<string>,
  allowedKeys: Set<string>,
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
        patch[key] = deleteField();
      }
      continue;
    }

    if (immutableKeys.has(key)) {
      continue;
    }

    if (!(key in next) || next[key] === undefined) {
      if (key in current) {
        patch[key] = deleteField();
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
  normalized.bannerURL = normalizeBoundedString(normalized.bannerURL, 1000000);
  normalized.bio = normalizeBoundedString(normalized.bio, 2000);
  normalized.whatsapp = normalizeBoundedString(normalized.whatsapp, 30);
  normalized.phone = normalizeBoundedString(normalized.phone, 30);
  normalized.instagram = normalizeBoundedString(normalized.instagram, 100);
  normalized.facebook = normalizeBoundedString(normalized.facebook, 100);
  normalized.linkedin = normalizeBoundedString(normalized.linkedin, 100);
  normalized.website = normalizeBoundedString(normalized.website, 200);
  normalized.serviceType = normalizeBoundedString(normalized.serviceType, 200);
  normalized.location = normalizeBoundedString(normalized.location, 200);
  normalized.ward = normalizeBoundedString(normalized.ward, 200);
  normalized.companyName = normalizeBoundedString(normalized.companyName, 200);
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

const publicProfileDefaults: Pick<UserProfile, "email" | "role" | "contacts"> =
  {
    email: "",
    role: "user",
    contacts: [],
  };

function toPublicProfileModel(
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
    searchTokens: raw.searchTokens || [],
    companyName: raw.companyName || "",
    gallery: raw.gallery || [],
    rating: raw.rating,
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

function buildPublicProfileData(source: Partial<UserProfile>) {
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
    searchTokens: toSearchTokens(
      source.name,
      source.category,
      source.serviceType,
      source.companyName,
      publicCity,
      publicState,
    ),
    companyName: source.companyName || "",
    gallery: source.gallery || [],
    rating: source.rating ?? 0,
    reviewCount: source.reviewCount ?? 0,
    recommendationCount: source.recommendationCount,
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

function applyDerivedVerificationFields(source: Partial<UserProfile>) {
  const verification = deriveMemberVerification(source);

  return removeUndefinedDeep({
    ...source,
    memberVerified: verification.memberVerified,
    membershipYears: verification.membershipYears,
  });
}

function shouldSyncPublicProfile(
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

function syncPublicProfileBatch(
  batch: ReturnType<typeof writeBatch>,
  uid: string,
  source: Partial<UserProfile>,
) {
  const publicDocRef = doc(db, "public_profiles", uid);

  if (!shouldSyncPublicProfile(source) || source.isDeleted) {
    batch.delete(publicDocRef);
    return;
  }

  batch.set(publicDocRef, buildPublicProfileData(source), { merge: true });
}

async function syncPublicProfileDocument(
  uid: string,
  source: Partial<UserProfile>,
) {
  const publicDocRef = doc(db, "public_profiles", uid);

  if (!shouldSyncPublicProfile(source) || source.isDeleted) {
    await deleteDoc(publicDocRef);
    return;
  }

  await setDoc(publicDocRef, buildPublicProfileData(source), { merge: true });
}

function isSerializedFirestoreError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  try {
    const parsed = JSON.parse(error.message) as Partial<FirestoreErrorInfo>;
    return (
      typeof parsed.operationType === "string" &&
      typeof parsed.path === "string"
    );
  } catch {
    return false;
  }
}

function sortProvidersByFeaturedRanking(profiles: UserProfile[]) {
  return [...profiles].sort((a, b) => {
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

function filterVisibleProviders(profiles: Array<UserProfile | null>) {
  return profiles.filter(
    (profile): profile is UserProfile =>
      profile !== null &&
      profile.isProvider === true &&
      !profile.isDeleted &&
      !profile.isBlocked,
  );
}

export const UserService = {
  async getPublicProfile(uid: string): Promise<UserProfile | null> {
    const path = `public_profiles/${uid}`;
    try {
      const docRef = doc(db, "public_profiles", uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists()
        ? toPublicProfileModel(toPlainValue(docSnap.data() as UserProfile))
        : null;
    } catch (error) {
      if (isPermissionDeniedError(error)) {
        return null;
      }

      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists()
        ? toPlainValue(docSnap.data() as UserProfile)
        : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const path = "users";
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email),
        limit(1),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return toPlainValue(querySnapshot.docs[0].data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return null;
    }
  },

  async createProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!profile.uid) throw new Error("UID is required");
    const path = `users/${profile.uid}`;
    try {
      const createdAt = serverTimestamp();
      const privateDocRef = doc(db, "users", profile.uid);
      const batch = writeBatch(db);
      const nextPrivateProfile = applyDerivedVerificationFields({
        ...profile,
        hasPublicProfile:
          typeof profile.hasPublicProfile === "boolean"
            ? profile.hasPublicProfile
            : profile.isProvider === true,
        createdAt,
      });

      batch.set(privateDocRef, nextPrivateProfile);
      syncPublicProfileBatch(batch, profile.uid, {
        ...nextPrivateProfile,
        uid: profile.uid,
      });
      await batch.commit();

      // Notify admins about the new user
      await NotificationService.createNotification({
        title: "Novo Usuário Cadastrado",
        message: `${profile.name || "Um novo membro"} acabou de se juntar à plataforma Skillsy.`,
        type: "new_user",
        read: false,
        link: "/admin/users",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      const allowedUserFields = new Set([
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

      const immutableKeys = new Set([
        "uid",
        "email",
        "role",
        "createdAt",
        "isBlocked",
        "rating",
        "reviewCount",
      ]);

      const sanitizeData = (source: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(source).filter(
            ([key, value]) =>
              allowedUserFields.has(key) && key !== "id" && value !== undefined,
          ),
        );

      const currentSnapshot = await getDoc(docRef);
      if (!currentSnapshot.exists()) {
        throw new Error("Perfil não encontrado para atualização");
      }

      const rawCurrentData = currentSnapshot.data() as Record<string, unknown>;
      const currentData = normalizeUserDocumentForRules(
        sanitizeData(rawCurrentData),
      );
      const incomingData = normalizeUserDocumentForRules(
        sanitizeData(data as Record<string, unknown>),
      );

      const safeIncomingData = Object.fromEntries(
        Object.entries(incomingData).filter(
          ([key, value]) => !immutableKeys.has(key) && value !== undefined,
        ),
      );

      const createdAt =
        currentData.createdAt !== undefined
          ? currentData.createdAt
          : serverTimestamp();

      const nextData: Partial<UserProfile> = {
        ...currentData,
        ...safeIncomingData,
        uid,
        name:
          normalizeBoundedString(safeIncomingData.name, 100) ??
          normalizeBoundedString(currentData.name, 100) ??
          auth.currentUser?.displayName ??
          "Membro Skillsy",
        email:
          normalizeEmail(currentData.email) ??
          normalizeEmail(safeIncomingData.email) ??
          auth.currentUser?.email ??
          "",
        isProvider:
          (safeIncomingData.isProvider as boolean | undefined) ??
          (currentData.isProvider as boolean | undefined) ??
          false,
        hasPublicProfile:
          typeof safeIncomingData.hasPublicProfile === "boolean"
            ? (safeIncomingData.hasPublicProfile as boolean)
            : Object.prototype.hasOwnProperty.call(
                  safeIncomingData,
                  "isProvider",
                )
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
      await updateDoc(docRef, privatePatch);

      try {
        await syncPublicProfileDocument(
          uid,
          sanitizedPrivateProfile as Partial<UserProfile>,
        );
      } catch (error) {
        // The private profile above is the source of truth for the signed-in
        // user's own session and already saved successfully. Don't let a
        // failure to mirror it into public_profiles (e.g. a transient quota
        // error) throw here — that would stop the caller from refreshing
        // local state, making the update (a new avatar photo, for example)
        // look like it "didn't take" anywhere in the app even though it did.
        // The next successful save retries this sync automatically.
        console.error(
          `Failed to sync public_profiles/${uid} after a profile update:`,
          error,
        );
      }
    } catch (error) {
      if (isSerializedFirestoreError(error)) {
        throw error;
      }
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async toggleContact(
    uid: string,
    contactId: string,
    isAdding: boolean,
  ): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        contacts: isAdding ? arrayUnion(contactId) : arrayRemove(contactId),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getProviders(limitCount: number = 10): Promise<UserProfile[]> {
    const path = "public_profiles";
    try {
      const q = query(
        collection(db, "public_profiles"),
        where("isProvider", "==", true),
        where("isBlocked", "==", false),
        where("isDeleted", "==", false),
        orderBy("reviewCount", "desc"),
        limit(limitCount),
      );
      const querySnapshot = await getDocs(q);
      return sortProvidersByFeaturedRanking(
        querySnapshot.docs
          .map((doc) =>
            toPublicProfileModel(toPlainValue(doc.data() as UserProfile)),
          )
          .filter((profile): profile is UserProfile => profile !== null),
      );
    } catch (error) {
      if (isPermissionDeniedError(error)) {
        return [];
      }

      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async searchProviders(
    term: string,
    location?: { city?: string; state?: string },
    category?: string,
  ): Promise<UserProfile[]> {
    const path = "public_profiles";
    try {
      const normalizedTerms = toSearchTokens(term).filter(
        (token) => token.length >= 3,
      );
      const cityTokens = toSearchTokens(location?.city || "").filter(
        (token) => token.length >= 3,
      );
      const searchAnchor = [...normalizedTerms, ...cityTokens].sort(
        (a, b) => b.length - a.length,
      )[0];
      const constraints: QueryConstraint[] = [
        where("isProvider", "==", true),
        where("isBlocked", "==", false),
        where("isDeleted", "==", false),
      ];

      if (category) constraints.push(where("category", "==", category));
      if (location?.state)
        constraints.push(
          where("publicState", "==", location.state.trim().toUpperCase()),
        );
      if (searchAnchor)
        constraints.push(where("searchTokens", "array-contains", searchAnchor));
      constraints.push(limit(60));

      const q = query(collection(db, "public_profiles"), ...constraints);
      const querySnapshot = await getDocs(q);
      const candidates = querySnapshot.docs
        .map((doc) =>
          toPublicProfileModel(toPlainValue(doc.data() as UserProfile)),
        )
        .filter(
          (profile): profile is UserProfile =>
            profile !== null &&
            profile.isProvider === true &&
            !profile.isDeleted &&
            !profile.isBlocked,
        );

      return sortProvidersByFeaturedRanking(
        candidates.filter((profile) => {
          const profileTokens = profile.searchTokens || [];
          const matchesTerms =
            normalizedTerms.length === 0 ||
            normalizedTerms.every((token) => profileTokens.includes(token));
          const matchesCity =
            cityTokens.length === 0 ||
            cityTokens.every((token) => profileTokens.includes(token));
          return matchesTerms && matchesCity;
        }),
      );
    } catch (error) {
      if (isPermissionDeniedError(error)) {
        return [];
      }

      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getAllProviders(): Promise<UserProfile[]> {
    return this.getProviders(500);
  },

  async getContacts(uids: string[]): Promise<UserProfile[]> {
    if (!uids || uids.length === 0) return [];
    const path = "public_profiles";
    try {
      const q = query(
        collection(db, "public_profiles"),
        where("uid", "in", uids.slice(0, 10)),
      );
      const querySnapshot = await getDocs(q);
      const publicProfiles = querySnapshot.docs
        .map((doc) =>
          toPublicProfileModel(toPlainValue(doc.data() as UserProfile)),
        )
        .filter(
          (profile): profile is UserProfile =>
            profile !== null && !profile.isDeleted && !profile.isBlocked,
        );
      return publicProfiles;
    } catch (error) {
      if (isPermissionDeniedError(error)) {
        return [];
      }

      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getCommunityRecommendation(
    professionalId: string,
    recommenderId: string,
  ): Promise<CommunityRecommendation | null> {
    const path = `public_profiles/${professionalId}/recommendations/${recommenderId}`;
    try {
      const snapshot = await getDoc(
        doc(
          db,
          "public_profiles",
          professionalId,
          "recommendations",
          recommenderId,
        ),
      );
      return snapshot.exists()
        ? toPlainValue(snapshot.data() as CommunityRecommendation)
        : null;
    } catch (error) {
      if (isPermissionDeniedError(error)) return null;
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getCommunityRecommendations(
    professionalId: string,
    maxItems = 8,
  ): Promise<CommunityRecommendation[]> {
    const path = `public_profiles/${professionalId}/recommendations`;
    try {
      const recommendationsQuery = query(
        collection(db, "public_profiles", professionalId, "recommendations"),
        orderBy("createdAt", "desc"),
        limit(maxItems),
      );
      const snapshot = await getDocs(recommendationsQuery);
      const recommendations = snapshot.docs.map((item) =>
        toPlainValue(item.data() as CommunityRecommendation),
      );

      const hydrated = await Promise.all(
        recommendations.map(async (recommendation) => {
          if (recommendation.recommenderName) return recommendation;

          try {
            const recommenderSnapshot = await getDoc(
              doc(db, "public_profiles", recommendation.recommenderId),
            );
            const recommenderProfile = recommenderSnapshot.exists()
              ? toPublicProfileModel(
                  toPlainValue(recommenderSnapshot.data() as UserProfile),
                )
              : null;

            return {
              ...recommendation,
              recommenderName:
                recommenderProfile?.name || recommendation.recommenderName,
              recommenderPhotoURL:
                recommenderProfile?.photoURL ||
                recommendation.recommenderPhotoURL,
            };
          } catch {
            return recommendation;
          }
        }),
      );

      return hydrated;
    } catch (error) {
      if (isPermissionDeniedError(error)) return [];
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async toggleCommunityRecommendation(
    recommenderId: string,
    professionalId: string,
    recommender?: Pick<UserProfile, "name" | "photoURL">,
  ): Promise<boolean> {
    if (recommenderId === professionalId) {
      throw new Error("Você não pode indicar o próprio perfil.");
    }

    const path = `public_profiles/${professionalId}/recommendations/${recommenderId}`;
    try {
      const publicProfileRef = doc(db, "public_profiles", professionalId);
      const recommendationRef = doc(
        db,
        "public_profiles",
        professionalId,
        "recommendations",
        recommenderId,
      );

      return await runTransaction(db, async (transaction) => {
        const [profileSnapshot, recommendationSnapshot] = await Promise.all([
          transaction.get(publicProfileRef),
          transaction.get(recommendationRef),
        ]);

        if (!profileSnapshot.exists()) {
          throw new Error("Perfil público não encontrado.");
        }

        const profile = profileSnapshot.data() as Partial<UserProfile>;
        if (
          profile.isProvider !== true ||
          profile.isBlocked === true ||
          profile.isDeleted === true
        ) {
          throw new Error(
            "Este profissional não está disponível para indicações.",
          );
        }

        const count = Math.max(0, profile.recommendationCount ?? 0);
        if (recommendationSnapshot.exists()) {
          transaction.delete(recommendationRef);
          transaction.update(publicProfileRef, {
            recommendationCount: Math.max(0, count - 1),
          });
          return false;
        }

        transaction.set(recommendationRef, {
          recommenderId,
          recommenderName: recommender?.name || "Membro Skillsy",
          recommenderPhotoURL: recommender?.photoURL || "",
          createdAt: serverTimestamp(),
        });
        transaction.update(publicProfileRef, {
          recommendationCount: count + 1,
        });
        return true;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return false;
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const path = "users";
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) =>
        toPlainValue(doc.data() as UserProfile),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async adminUpdateUser(
    uid: string,
    data: Partial<UserProfile>,
  ): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      const currentSnapshot = await getDoc(docRef);
      if (!currentSnapshot.exists()) {
        throw new Error(
          "Perfil não encontrado para atualização administrativa",
        );
      }

      const currentData = toPlainValue(currentSnapshot.data() as UserProfile);
      const { id, ...updateData } = data as any;
      const nextPrivateProfile = applyDerivedVerificationFields(
        removeUndefinedDeep({
          ...currentData,
          ...updateData,
          hasPublicProfile:
            typeof updateData.hasPublicProfile === "boolean"
              ? updateData.hasPublicProfile
              : typeof currentData.hasPublicProfile === "boolean"
                ? currentData.hasPublicProfile
                : currentData.isProvider === true,
        }),
      );

      const batch = writeBatch(db);
      batch.set(docRef, nextPrivateProfile);
      syncPublicProfileBatch(
        batch,
        uid,
        nextPrivateProfile as Partial<UserProfile>,
      );
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async cancelOwnAccount(uid: string, email: string): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      const currentSnapshot = await getDoc(docRef);

      if (!currentSnapshot.exists()) {
        throw new Error("Perfil não encontrado para cancelamento");
      }

      const currentData = toPlainValue(currentSnapshot.data() as UserProfile);
      const placeholderName =
        currentData.role === "admin"
          ? "Conta administrativa desativada"
          : "Conta desativada";

      const nextData = applyDerivedVerificationFields(
        removeUndefinedDeep({
          ...currentData,
          uid,
          email,
          name: placeholderName,
          photoURL: "",
          bannerURL: "",
          bio: "",
          category: "",
          isProvider: false,
          hasPublicProfile: false,
          contacts: [],
          location: "",
          whatsapp: "",
          instagram: "",
          facebook: "",
          linkedin: "",
          website: "",
          serviceType: "",
          phone: "",
          phones: [],
          ward: "",
          companyName: "",
          businessAddress: "",
          businessAddressNumber: "",
          businessNeighborhood: "",
          businessState: "",
          businessComplement: "",
          gallery: [],
          availability: [],
          serviceHours: "",
          memberVerified: false,
          membershipYears: undefined,
          isDeleted: true,
          deletedByUser: true,
          deletedAt: serverTimestamp(),
        }),
      );

      const batch = writeBatch(db);
      batch.set(docRef, nextData);
      syncPublicProfileBatch(batch, uid, nextData as Partial<UserProfile>);
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async seedUsers(): Promise<void> {
    const fakeUsers: Partial<UserProfile>[] = [
      {
        uid: "fake_1",
        name: "Ricardo Oliveira",
        email: "ricardo.manutencao@example.com",
        isProvider: true,
        category: "Manutenção",
        serviceType: "Eletricista e Encanador",
        location: "São Paulo, SP",
        ward: "Ala Jardins",
        companyName: "Oliveira Reparos",
        bio: "Profissional com 15 anos de experiência em manutenção residencial e predial.",
        whatsapp: "11988887777",
        baptismYear: 2008,
        rating: 4.8,
        reviewCount: 12,
        role: "user",
        photoURL: "https://picsum.photos/seed/ricardo/200",
        bannerURL: "https://picsum.photos/seed/ricardo_banner/800/200",
      },
      {
        uid: "fake_2",
        name: "Ana Cláudia Santos",
        email: "ana.doces@example.com",
        isProvider: true,
        category: "Cozinha",
        serviceType: "Bolos e Doces Gourmet",
        location: "Curitiba, PR",
        ward: "Ala Portão",
        companyName: "Ana Doces",
        bio: "Faço bolos para casamentos, aniversários e eventos especiais com ingredientes de primeira.",
        whatsapp: "41999998888",
        baptismYear: 2012,
        rating: 5.0,
        reviewCount: 25,
        role: "user",
        photoURL: "https://picsum.photos/seed/ana/200",
        bannerURL: "https://picsum.photos/seed/ana_banner/800/200",
      },
      {
        uid: "fake_3",
        name: "Marcos Vinícius",
        email: "marcos.tech@example.com",
        isProvider: true,
        category: "Tecnologia",
        serviceType: "Desenvolvedor Web Fullstack",
        location: "Belo Horizonte, MG",
        ward: "Ala Pampulha",
        companyName: "MV Tech Solutions",
        bio: "Especialista em React, Node.js e aplicativos mobile. Ajudo sua empresa a crescer digitalmente.",
        whatsapp: "31977776666",
        rating: 4.9,
        reviewCount: 8,
        role: "user",
        photoURL: "https://picsum.photos/seed/marcos/200",
        bannerURL: "https://picsum.photos/seed/marcos_banner/800/200",
      },
      {
        uid: "fake_4",
        name: "Juliana Ferreira",
        email: "juliana.limpeza@example.com",
        isProvider: true,
        category: "Limpeza",
        serviceType: "Limpeza Pós-Obra e Residencial",
        location: "Rio de Janeiro, RJ",
        ward: "Ala Barra",
        companyName: "Brilho Total",
        bio: "Serviço de limpeza detalhado e confiável para sua casa ou escritório.",
        whatsapp: "21966665555",
        baptismYear: 2005,
        rating: 4.7,
        reviewCount: 15,
        role: "user",
        photoURL: "https://picsum.photos/seed/juliana/200",
        bannerURL: "https://picsum.photos/seed/juliana_banner/800/200",
      },
      {
        uid: "fake_5",
        name: "Paulo Souza",
        email: "paulo.reformas@example.com",
        isProvider: true,
        category: "Reformas",
        serviceType: "Pintura e Drywall",
        location: "Porto Alegre, RS",
        ward: "Ala Moinhos",
        companyName: "Souza Pinturas",
        bio: "Pintura residencial e comercial com acabamento impecável e rapidez.",
        whatsapp: "51955554444",
        rating: 4.6,
        reviewCount: 10,
        role: "user",
        photoURL: "https://picsum.photos/seed/paulo/200",
        bannerURL: "https://picsum.photos/seed/paulo_banner/800/200",
      },
    ];

    try {
      const batch = writeBatch(db);
      for (const user of fakeUsers) {
        const docRef = doc(db, "users", user.uid!);
        const createdAt = serverTimestamp();
        const nextPrivateProfile = applyDerivedVerificationFields({
          ...user,
          hasPublicProfile:
            typeof user.hasPublicProfile === "boolean"
              ? user.hasPublicProfile
              : user.isProvider === true,
          createdAt,
        });

        batch.set(docRef, nextPrivateProfile);
        syncPublicProfileBatch(
          batch,
          user.uid!,
          nextPrivateProfile as Partial<UserProfile>,
        );
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "users/seed");
    }
  },

  async submitRating(
    fromId: string,
    toId: string,
    score: number,
    comment?: string,
  ): Promise<void> {
    try {
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new Error("A nota deve ser um numero inteiro entre 1 e 5.");
      }

      const normalizedComment = comment?.trim();

      await runTransaction(db, async (transaction) => {
        const voteRef = doc(db, "users", fromId, "votes", toId);
        const voteSnap = await transaction.get(voteRef);

        if (voteSnap.exists()) {
          throw new Error(
            "Você já avaliou este profissional. Cada membro pode registrar uma avaliação.",
          );
        }

        const authorRef = doc(db, "users", fromId);
        const userRef = doc(db, "users", toId);
        const publicProfileRef = doc(db, "public_profiles", toId);
        const [authorSnapshot, publicProfileSnap] = await Promise.all([
          transaction.get(authorRef),
          transaction.get(publicProfileRef),
        ]);

        if (!authorSnapshot.exists()) {
          throw new Error(
            "Seu perfil não foi encontrado para identificar a avaliação.",
          );
        }

        const authorName = (
          authorSnapshot.data() as Partial<UserProfile>
        ).name?.trim();
        if (!authorName) {
          throw new Error("Informe seu nome no perfil antes de avaliar.");
        }

        if (!publicProfileSnap.exists()) {
          throw new Error("Perfil público não encontrado");
        }

        const publicProfileData =
          publicProfileSnap.data() as Partial<UserProfile>;
        if (
          publicProfileData.isProvider !== true ||
          publicProfileData.isBlocked === true ||
          publicProfileData.isDeleted === true
        ) {
          throw new Error("Este perfil não está disponível para avaliações.");
        }

        const currentRating = publicProfileData.rating || 0;
        const currentCount = publicProfileData.reviewCount || 0;

        const newCount = currentCount + 1;
        const newRating = (currentRating * currentCount + score) / newCount;

        transaction.set(voteRef, {
          providerId: toId,
          votedAt: serverTimestamp(),
        });

        const ratingRef = doc(collection(db, "ratings"));
        transaction.set(ratingRef, {
          toId,
          fromId,
          authorName,
          score,
          ...(normalizedComment ? { comment: normalizedComment } : {}),
          createdAt: serverTimestamp(),
        });

        transaction.update(userRef, {
          rating: Number(newRating.toFixed(1)),
          reviewCount: newCount,
        });

        if (publicProfileSnap.exists()) {
          transaction.set(
            publicProfileRef,
            {
              rating: Number(newRating.toFixed(1)),
              reviewCount: newCount,
            },
            { merge: true },
          );
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "transaction/rating");
    }
  },

  async getRatings(toId: string): Promise<Rating[]> {
    const path = "ratings";
    try {
      const q = query(collection(db, "ratings"), where("toId", "==", toId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => toPlainValue({ id: doc.id, ...doc.data() }) as Rating)
        .sort((a, b) => {
          const aSeconds =
            a.createdAt &&
            typeof a.createdAt === "object" &&
            "seconds" in a.createdAt
              ? a.createdAt.seconds
              : 0;
          const bSeconds =
            b.createdAt &&
            typeof b.createdAt === "object" &&
            "seconds" in b.createdAt
              ? b.createdAt.seconds
              : 0;

          return bSeconds - aSeconds;
        });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async submitSupportMessage(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> {
    const path = "support_messages";
    try {
      await addDoc(collection(db, "support_messages"), {
        ...data,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async submitUserReport(data: {
    reportedUserId: string;
    reportedUserName?: string;
    reason: string;
    details?: string;
  }): Promise<void> {
    const path = "reports";
    if (!auth.currentUser) {
      throw new Error("Usuário não autenticado");
    }

    try {
      await addDoc(collection(db, "reports"), {
        reportedUserId: data.reportedUserId,
        reportedUserName: data.reportedUserName || "",
        reporterId: auth.currentUser.uid,
        reporterEmail: auth.currentUser.email || "",
        reason: data.reason,
        details: data.details || "",
        status: "new",
        createdAt: serverTimestamp(),
      });

      await NotificationService.createNotification({
        title: "Nova denúncia de perfil",
        message: `${auth.currentUser.email || "Um usuário"} denunciou o perfil de ${data.reportedUserName || data.reportedUserId}.`,
        type: "report",
        read: false,
        link: "/admin/usuarios",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getAllReports(): Promise<UserReport[]> {
    const path = "reports";
    try {
      const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((reportDoc) =>
        toPlainValue({ id: reportDoc.id, ...reportDoc.data() } as UserReport),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateUserReport(
    reportId: string,
    updates: Pick<
      UserReport,
      | "status"
      | "priority"
      | "assignedAdminId"
      | "assignedAdminName"
      | "resolution"
    >,
  ): Promise<void> {
    const path = `reports/${reportId}`;
    try {
      const status =
        updates.status === "reviewed" ? "in_review" : updates.status;
      await updateDoc(doc(db, "reports", reportId), {
        ...updates,
        status,
        updatedAt: serverTimestamp(),
        ...(status === "in_review" ? { reviewedAt: serverTimestamp() } : {}),
        ...(status === "resolved" || status === "dismissed"
          ? { resolvedAt: serverTimestamp() }
          : {}),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },
};
