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
  getCountFromServer,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toPlainValue } from "@/lib/firestore-plain";
import {
  CommunityRecommendation,
  Rating,
  SupportMessage,
  UserProfile,
  UserReport,
} from "@/models/types";
import { NotificationService } from "./notification-service";
import { TERMS_VERSION } from "@skillsy/shared/terms";
import {
  isActiveProvider,
  pickSearchResults,
  planProviderSearch,
  sortProvidersByFeaturedRanking,
  toPublicProfileModel,
} from "@skillsy/shared/providers";
import {
  applyDerivedVerificationFields,
  buildPublicProfileData,
  createProfileDocuments,
  removeUndefinedDeep,
  shouldSyncPublicProfile,
} from "@skillsy/shared/profile-documents";

const profileDocuments = createProfileDocuments({
  isTimestamp: (value) => value instanceof Timestamp,
  timestamp: (seconds, nanoseconds) => new Timestamp(seconds, nanoseconds),
  timestampFromDate: (date) => Timestamp.fromDate(date),
  deleteField,
  serverTimestamp,
});

export { isActiveProvider };

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

/** Personal data a member's own cancellation erases from users/{uid}. */
const CANCELLED_ACCOUNT_REMOVED_FIELDS = [
  "photoURL", "bannerURL", "bio", "category", "contacts", "location",
  "whatsapp", "instagram", "facebook", "linkedin", "website", "serviceType",
  "phone", "phones", "ward", "companyName", "businessAddress",
  "businessAddressNumber", "businessNeighborhood", "businessState",
  "businessComplement", "gallery", "availability", "serviceHours",
  "membershipYears", "socialLinks",
] as const;

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

// Recommendations are the platform's main trust signal, so they rank first;
// the star rating only breaks ties.

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
      // Signing up accepts the current Terms of Use (the sign-up screens say
      // so). Admins creating someone else's account don't accept for them.
      const acceptsTerms = auth.currentUser?.uid === profile.uid;
      const nextPrivateProfile = applyDerivedVerificationFields({
        ...profile,
        hasPublicProfile:
          typeof profile.hasPublicProfile === "boolean"
            ? profile.hasPublicProfile
            : profile.isProvider === true,
        createdAt,
        ...(acceptsTerms
          ? { termsVersion: TERMS_VERSION, termsAcceptedAt: createdAt }
          : {}),
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
        link: "/admin/usuarios",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      const currentSnapshot = await getDoc(docRef);
      if (!currentSnapshot.exists()) {
        throw new Error("Perfil não encontrado para atualização");
      }

      // Normalization, merge and the patch live in @skillsy/shared so the
      // app saves profiles exactly like the site.
      const { privatePatch, privateProfile } =
        profileDocuments.prepareProfileUpdate({
          uid,
          current: currentSnapshot.data() as Record<string, unknown>,
          changes: data,
          authUser: auth.currentUser,
        });
      await updateDoc(docRef, privatePatch);

      try {
        await syncPublicProfileDocument(uid, privateProfile);
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
      // Featured providers rank by recommendations, but Firestore can't order
      // by recommendationCount: older public profiles don't have the field and
      // orderBy would drop them. So fetch a wider pool and rank it here.
      const q = query(
        collection(db, "public_profiles"),
        where("isProvider", "==", true),
        where("isBlocked", "==", false),
        where("isDeleted", "==", false),
        orderBy("reviewCount", "desc"),
        limit(Math.max(limitCount * 5, 30)),
      );
      const querySnapshot = await getDocs(q);
      return sortProvidersByFeaturedRanking(
        querySnapshot.docs
          .map((doc) =>
            toPublicProfileModel(toPlainValue(doc.data() as UserProfile)),
          )
          .filter(isActiveProvider),
      ).slice(0, limitCount);
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
      const plan = planProviderSearch(term, location, category);
      const constraints: QueryConstraint[] = [
        where("isProvider", "==", true),
        where("isBlocked", "==", false),
        where("isDeleted", "==", false),
      ];

      if (plan.category) constraints.push(where("category", "==", plan.category));
      if (plan.state) constraints.push(where("publicState", "==", plan.state));
      if (plan.anchor)
        constraints.push(where("searchTokens", "array-contains", plan.anchor));
      constraints.push(limit(60));

      const q = query(collection(db, "public_profiles"), ...constraints);
      const querySnapshot = await getDocs(q);
      return pickSearchResults(
        querySnapshot.docs.map((doc) => toPlainValue(doc.data())),
        plan,
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

  /**
   * Admin-only: rebuilds ratingSum, reviewCount, rating and recommendationCount
   * from the ratings and recommendations themselves. Run once to migrate
   * profiles rated before ratingSum existed, and whenever the numbers drift.
   * Writes only documents whose values changed.
   */
  async recalculateProviderStats(): Promise<{ profiles: number; updated: number }> {
    const path = "public_profiles";
    try {
      const [ratingsSnapshot, profilesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, "ratings")),
        getDocs(collection(db, "public_profiles")),
        getDocs(collection(db, "users")),
      ]);

      const ratingTotals = new Map<string, { sum: number; count: number }>();
      ratingsSnapshot.forEach((item) => {
        const { toId, score } = item.data() as Partial<Rating>;
        if (typeof toId !== "string" || typeof score !== "number") return;
        const totals = ratingTotals.get(toId) || { sum: 0, count: 0 };
        ratingTotals.set(toId, { sum: totals.sum + score, count: totals.count + 1 });
      });
      const userIds = new Set(usersSnapshot.docs.map((item) => item.id));

      const writes: Array<{ ref: ReturnType<typeof doc>; data: Record<string, number> }> = [];
      for (const profileDoc of profilesSnapshot.docs) {
        const uid = profileDoc.id;
        const current = profileDoc.data() as Partial<UserProfile>;
        const totals = ratingTotals.get(uid) || { sum: 0, count: 0 };
        const recommendations = await getCountFromServer(
          collection(db, "public_profiles", uid, "recommendations"),
        );
        const rating =
          totals.count > 0 ? Math.round((totals.sum / totals.count) * 10) / 10 : 0;
        const next = {
          ratingSum: totals.sum,
          reviewCount: totals.count,
          rating,
          recommendationCount: recommendations.data().count,
        };
        const changed = (Object.keys(next) as Array<keyof typeof next>).some(
          (key) => (current[key] ?? null) !== next[key],
        );
        if (!changed) continue;

        writes.push({ ref: doc(db, "public_profiles", uid), data: next });
        if (userIds.has(uid)) {
          writes.push({
            ref: doc(db, "users", uid),
            data: { rating, reviewCount: totals.count },
          });
        }
      }

      for (let index = 0; index < writes.length; index += 450) {
        const batch = writeBatch(db);
        writes
          .slice(index, index + 450)
          .forEach((write) => batch.update(write.ref, write.data));
        await batch.commit();
      }

      return {
        profiles: profilesSnapshot.size,
        updated: writes.filter((write) => write.ref.parent.id === "public_profiles").length,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { profiles: 0, updated: 0 };
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

      // The stored data as is: toPlainValue would turn its Timestamps
      // (createdAt, termsAcceptedAt…) into plain maps, and writing those back
      // changes their type (firestore.rules keepsSafeCreatedAt rejects it).
      const currentData = currentSnapshot.data() as UserProfile;
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

  /** Blocks (with the reason shown to the member on /blocked) or unblocks an
   * account. Writes only these fields, and hides or shows the public profile. */
  async adminSetBlocked(
    uid: string,
    blocked: boolean,
    reason = "",
  ): Promise<void> {
    const path = `users/${uid}`;
    try {
      const batch = writeBatch(db);
      batch.update(
        doc(db, "users", uid),
        blocked
          ? {
              isBlocked: true,
              blockedReason: reason.trim().slice(0, 500),
              blockedAt: serverTimestamp(),
            }
          : {
              isBlocked: false,
              blockedReason: deleteField(),
              blockedAt: deleteField(),
            },
      );
      const publicRef = doc(db, "public_profiles", uid);
      if ((await getDoc(publicRef)).exists()) {
        batch.update(publicRef, { isBlocked: blocked });
      }
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

      const currentData = currentSnapshot.data() as UserProfile;
      const placeholderName =
        currentData.role === "admin"
          ? "Conta administrativa desativada"
          : "Conta desativada";

      // Only the deactivation flags are written; personal data is deleted
      // rather than blanked. Rewriting ~30 fields as "" went over the 1000
      // expressions firestore.rules may evaluate, so cancelling always failed.
      const patch: Record<string, unknown> = {
        name: placeholderName,
        email,
        isProvider: false,
        hasPublicProfile: false,
        memberVerified: false,
        isDeleted: true,
        deletedByUser: true,
        deletedAt: serverTimestamp(),
      };
      for (const key of CANCELLED_ACCOUNT_REMOVED_FIELDS) {
        if (key in currentData) patch[key] = deleteField();
      }

      const batch = writeBatch(db);
      batch.update(docRef, patch);
      // isDeleted: the public profile is removed (syncPublicProfileBatch).
      syncPublicProfileBatch(batch, uid, { ...currentData, isDeleted: true });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
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

        const currentCount = publicProfileData.reviewCount || 0;
        if (currentCount > 0 && typeof publicProfileData.ratingSum !== "number") {
          throw new Error(
            "As avaliações deste perfil estão sendo atualizadas. Tente novamente mais tarde.",
          );
        }

        // The rules check that ratingSum grows by exactly this score, found
        // through the deterministic rating id.
        transaction.set(voteRef, {
          providerId: toId,
          votedAt: serverTimestamp(),
        });

        const ratingRef = doc(db, "ratings", `${fromId}_${toId}`);
        transaction.set(ratingRef, {
          toId,
          fromId,
          authorName,
          score,
          ...(normalizedComment ? { comment: normalizedComment } : {}),
          createdAt: serverTimestamp(),
        });

        transaction.update(publicProfileRef, {
          ratingSum: (publicProfileData.ratingSum || 0) + score,
          reviewCount: currentCount + 1,
        });
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

  async getSupportMessages(): Promise<SupportMessage[]> {
    const path = "support_messages";
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((messageDoc) =>
        toPlainValue({
          id: messageDoc.id,
          read: false,
          ...messageDoc.data(),
        } as SupportMessage),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async setSupportMessageRead(messageId: string, read: boolean): Promise<void> {
    const path = `support_messages/${messageId}`;
    try {
      await updateDoc(doc(db, "support_messages", messageId), { read });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
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
