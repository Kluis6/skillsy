import {
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy,
  limit, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  addDoc,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { toPlainValue } from '@/lib/firestore-plain';
import { UserProfile, UserReport } from '@/models/types';
import { AVAILABILITY_OPTIONS, PROVIDER_CATEGORIES } from '@/lib/profile-form';
import { NotificationService } from './notification-service';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object' && isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, removeUndefinedDeep(nestedValue)]),
    ) as T;
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeOptionalFirestoreString(value: unknown) {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeBoundedString(value: unknown, maxLength: number) {
  const normalized = normalizeOptionalFirestoreString(value);

  if (typeof normalized !== 'string') {
    return undefined;
  }

  return normalized.length <= maxLength ? normalized : undefined;
}

function normalizeBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined;
}

function normalizeFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeEmail(value: unknown) {
  const normalized = normalizeBoundedString(value, 320);

  if (typeof normalized !== 'string') {
    return undefined;
  }

  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalized)
    ? normalized
    : undefined;
}

function normalizeRole(value: unknown) {
  return value === 'admin' || value === 'user' ? value : undefined;
}

function normalizeStringArray(value: unknown, maxItems?: number) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const next = value.filter((item): item is string => typeof item === 'string');
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
      typeof item === 'string' &&
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
      if (!item || typeof item !== 'object') {
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
    .filter((item): item is { url: string; description?: string } => item !== null)
    .slice(0, 5);

  return next;
}

function normalizeUserDocumentForRules(source: Record<string, unknown>) {
  const normalized = removeUndefinedDeep({ ...source }) as Record<string, unknown>;

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
  normalized.serviceHours = normalizeBoundedString(normalized.serviceHours, 200);
  normalized.businessAddress = normalizeBoundedString(normalized.businessAddress, 200);
  normalized.businessAddressNumber = normalizeBoundedString(
    normalized.businessAddressNumber,
    20,
  );
  normalized.businessNeighborhood = normalizeBoundedString(
    normalized.businessNeighborhood,
    100,
  );
  normalized.businessState = normalizeBoundedString(normalized.businessState, 100);
  normalized.businessComplement = normalizeBoundedString(
    normalized.businessComplement,
    100,
  );

  const category = normalizeBoundedString(normalized.category, 100);
  normalized.category =
    typeof category === 'string' &&
    (PROVIDER_CATEGORIES as readonly string[]).includes(category)
      ? category
      : undefined;

  normalized.contacts = normalizeStringArray(normalized.contacts);
  normalized.phones = normalizeStringArray(normalized.phones);
  normalized.availability = normalizeAvailabilityForRules(normalized.availability);
  normalized.gallery = normalizeGalleryForRules(normalized.gallery);

  normalized.rating = normalizeFiniteNumber(normalized.rating);
  normalized.reviewCount = normalizeFiniteNumber(normalized.reviewCount);
  normalized.experienceYears = normalizeFiniteNumber(normalized.experienceYears);

  const baptismYear = normalizeFiniteNumber(normalized.baptismYear);
  normalized.baptismYear =
    baptismYear !== undefined && baptismYear >= 1830 && baptismYear <= new Date().getFullYear()
      ? baptismYear
      : undefined;

  normalized.verifiedMember = normalizeBoolean(normalized.verifiedMember);
  normalized.isBlocked = normalizeBoolean(normalized.isBlocked);
  normalized.isDeleted = normalizeBoolean(normalized.isDeleted);
  normalized.deletedByUser = normalizeBoolean(normalized.deletedByUser);
  normalized.isProvider = normalizeBoolean(normalized.isProvider);

  return removeUndefinedDeep(normalized);
}

export const UserService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? toPlainValue(docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return toPlainValue(querySnapshot.docs[0].data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return null;
    }
  },

  async createProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!profile.uid) throw new Error('UID is required');
    const path = `users/${profile.uid}`;
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: serverTimestamp(),
      });

      // Notify admins about the new user
      await NotificationService.createNotification({
        title: 'Novo Usuário Cadastrado',
        message: `${profile.name || 'Um novo membro'} acabou de se juntar à plataforma Skillsy.`,
        type: 'new_user',
        read: false,
        link: '/admin/users'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const allowedUserFields = new Set([
        'id',
        'uid',
        'name',
        'email',
        'photoURL',
        'bannerURL',
        'bio',
        'category',
        'isProvider',
        'role',
        'contacts',
        'whatsapp',
        'instagram',
        'facebook',
        'linkedin',
        'website',
        'serviceType',
        'phone',
        'phones',
        'location',
        'ward',
        'companyName',
        'gallery',
        'rating',
        'reviewCount',
        'experienceYears',
        'verifiedMember',
        'baptismYear',
        'isBlocked',
        'isDeleted',
        'deletedByUser',
        'deletedAt',
        'createdAt',
        'socialLinks',
        'availability',
        'serviceHours',
        'businessAddress',
        'businessAddressNumber',
        'businessNeighborhood',
        'businessState',
        'businessComplement',
      ]);

      const immutableKeys = new Set([
        'uid',
        'email',
        'role',
        'createdAt',
        'verifiedMember',
        'isBlocked',
        'rating',
        'reviewCount',
      ]);

      const sanitizeData = (source: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(source).filter(
            ([key, value]) =>
              allowedUserFields.has(key) &&
              key !== 'id' &&
              value !== undefined,
          ),
        );

      const currentSnapshot = await getDoc(docRef);
      if (!currentSnapshot.exists()) {
        throw new Error('Perfil não encontrado para atualização');
      }

      const currentData = normalizeUserDocumentForRules(
        sanitizeData(currentSnapshot.data() as Record<string, unknown>),
      );
      const incomingData = normalizeUserDocumentForRules(
        sanitizeData(data as Record<string, unknown>),
      );

      const safeIncomingData = Object.fromEntries(
        Object.entries(incomingData).filter(
          ([key, value]) =>
            !immutableKeys.has(key) &&
            value !== undefined,
        ),
      );

      const createdAt =
        currentData.createdAt !== undefined ? currentData.createdAt : serverTimestamp();

      const nextData = {
        uid,
        name:
          normalizeBoundedString(safeIncomingData.name, 100) ??
          normalizeBoundedString(currentData.name, 100) ??
          auth.currentUser?.displayName ??
          'Membro Skillsy',
        email:
          normalizeEmail(currentData.email) ??
          normalizeEmail(safeIncomingData.email) ??
          auth.currentUser?.email ??
          '',
        isProvider:
          (safeIncomingData.isProvider as boolean | undefined) ??
          (currentData.isProvider as boolean | undefined) ??
          false,
        role: normalizeRole(currentData.role) ?? 'user',
        contacts: (currentData.contacts as string[] | undefined) ?? [],
        createdAt,
        ...currentData,
        ...safeIncomingData,
      };

      await setDoc(docRef, removeUndefinedDeep(nextData));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async toggleContact(uid: string, contactId: string, isAdding: boolean): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        contacts: isAdding ? arrayUnion(contactId) : arrayRemove(contactId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getProviders(limitCount: number = 10): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('isProvider', '==', true), limit(limitCount));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => toPlainValue(doc.data() as UserProfile))
        .filter((profile) => !profile.isDeleted)
        .slice(0, limitCount);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async searchProviders(
    term: string,
    location?: { city?: string; state?: string },
  ): Promise<UserProfile[]> {
    const path = 'users';
    try {
      // Fetch all users to allow finding people by name even if not marked as provider
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const all = querySnapshot.docs
        .map((doc) => toPlainValue(doc.data() as UserProfile))
        .filter((profile) => !profile.isDeleted);

      const searchTokens = term.toLowerCase().split(' ').filter(t => t.length > 0);

      return all.filter((p: UserProfile) => {
        const matchesSearch = searchTokens.length === 0 || searchTokens.every(token => {
          return (
            p.name.toLowerCase().includes(token) || 
            (p.category && p.category.toLowerCase().includes(token)) ||
            (p.serviceType && p.serviceType.toLowerCase().includes(token)) ||
            (p.companyName && p.companyName.toLowerCase().includes(token)) ||
            (p.bio && p.bio.toLowerCase().includes(token)) ||
            (p.email && p.email.toLowerCase().includes(token))
          );
        });
        
        const normalizedLocation = p.location?.toLowerCase() || '';
        const cityFilter = location?.city?.toLowerCase().trim();
        const stateFilter = location?.state?.toLowerCase().trim();
        const hasLocationFilter = Boolean(cityFilter || stateFilter);

        const matchesCity = !cityFilter || normalizedLocation.includes(cityFilter);
        const matchesState = !stateFilter || normalizedLocation.includes(stateFilter);
        const matchesLocation =
          !hasLocationFilter ||
          (normalizedLocation && matchesCity && matchesState) ||
          (!normalizedLocation && searchTokens.length > 0); // If searching by name specifically, ignore empty location
          
        return matchesSearch && matchesLocation;
      }).sort((a, b) => {
        // Prioritize providers and verified members
        if (a.isProvider && !b.isProvider) return -1;
        if (!a.isProvider && b.isProvider) return 1;
        if (a.verifiedMember && !b.verifiedMember) return -1;
        if (!a.verifiedMember && b.verifiedMember) return 1;
        return 0;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getAllProviders(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('isProvider', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => toPlainValue(doc.data() as UserProfile))
        .filter((profile) => !profile.isDeleted);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getContacts(uids: string[]): Promise<UserProfile[]> {
    if (!uids || uids.length === 0) return [];
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('uid', 'in', uids.slice(0, 10)));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => toPlainValue(doc.data() as UserProfile))
        .filter((profile) => !profile.isDeleted);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => toPlainValue(doc.data() as UserProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async adminUpdateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      // Remove 'id' if it exists in the data to avoid Firestore rule violations
      const { id, ...updateData } = data as any;
      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async cancelOwnAccount(uid: string, email: string): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const currentSnapshot = await getDoc(docRef);

      if (!currentSnapshot.exists()) {
        throw new Error('Perfil não encontrado para cancelamento');
      }

      const currentData = toPlainValue(currentSnapshot.data() as UserProfile);
      const placeholderName =
        currentData.role === 'admin'
          ? 'Conta administrativa desativada'
          : 'Conta desativada';

      const nextData = removeUndefinedDeep({
        ...currentData,
        uid,
        email,
        name: placeholderName,
        photoURL: '',
        bannerURL: '',
        bio: '',
        category: '',
        isProvider: false,
        contacts: [],
        location: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        website: '',
        serviceType: '',
        phone: '',
        phones: [],
        ward: '',
        companyName: '',
        businessAddress: '',
        businessAddressNumber: '',
        businessNeighborhood: '',
        businessState: '',
        businessComplement: '',
        gallery: [],
        availability: [],
        serviceHours: '',
        isDeleted: true,
        deletedByUser: true,
        deletedAt: serverTimestamp(),
      });

      await setDoc(docRef, nextData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async seedUsers(): Promise<void> {
    const fakeUsers: Partial<UserProfile>[] = [
      {
        uid: 'fake_1',
        name: 'Ricardo Oliveira',
        email: 'ricardo.manutencao@example.com',
        isProvider: true,
        category: 'Manutenção',
        serviceType: 'Eletricista e Encanador',
        location: 'São Paulo, SP',
        ward: 'Ala Jardins',
        companyName: 'Oliveira Reparos',
        bio: 'Profissional com 15 anos de experiência em manutenção residencial e predial.',
        whatsapp: '11988887777',
        rating: 4.8,
        reviewCount: 12,
        role: 'user',
        verifiedMember: true,
        photoURL: 'https://picsum.photos/seed/ricardo/200',
        bannerURL: 'https://picsum.photos/seed/ricardo_banner/800/200'
      },
      {
        uid: 'fake_2',
        name: 'Ana Cláudia Santos',
        email: 'ana.doces@example.com',
        isProvider: true,
        category: 'Cozinha',
        serviceType: 'Bolos e Doces Gourmet',
        location: 'Curitiba, PR',
        ward: 'Ala Portão',
        companyName: 'Ana Doces',
        bio: 'Faço bolos para casamentos, aniversários e eventos especiais com ingredientes de primeira.',
        whatsapp: '41999998888',
        rating: 5.0,
        reviewCount: 25,
        role: 'user',
        verifiedMember: true,
        photoURL: 'https://picsum.photos/seed/ana/200',
        bannerURL: 'https://picsum.photos/seed/ana_banner/800/200'
      },
      {
        uid: 'fake_3',
        name: 'Marcos Vinícius',
        email: 'marcos.tech@example.com',
        isProvider: true,
        category: 'Tecnologia',
        serviceType: 'Desenvolvedor Web Fullstack',
        location: 'Belo Horizonte, MG',
        ward: 'Ala Pampulha',
        companyName: 'MV Tech Solutions',
        bio: 'Especialista em React, Node.js e aplicativos mobile. Ajudo sua empresa a crescer digitalmente.',
        whatsapp: '31977776666',
        rating: 4.9,
        reviewCount: 8,
        role: 'user',
        verifiedMember: false,
        photoURL: 'https://picsum.photos/seed/marcos/200',
        bannerURL: 'https://picsum.photos/seed/marcos_banner/800/200'
      },
      {
        uid: 'fake_4',
        name: 'Juliana Ferreira',
        email: 'juliana.limpeza@example.com',
        isProvider: true,
        category: 'Limpeza',
        serviceType: 'Limpeza Pós-Obra e Residencial',
        location: 'Rio de Janeiro, RJ',
        ward: 'Ala Barra',
        companyName: 'Brilho Total',
        bio: 'Serviço de limpeza detalhado e confiável para sua casa ou escritório.',
        whatsapp: '21966665555',
        rating: 4.7,
        reviewCount: 15,
        role: 'user',
        verifiedMember: true,
        photoURL: 'https://picsum.photos/seed/juliana/200',
        bannerURL: 'https://picsum.photos/seed/juliana_banner/800/200'
      },
      {
        uid: 'fake_5',
        name: 'Paulo Souza',
        email: 'paulo.reformas@example.com',
        isProvider: true,
        category: 'Reformas',
        serviceType: 'Pintura e Drywall',
        location: 'Porto Alegre, RS',
        ward: 'Ala Moinhos',
        companyName: 'Souza Pinturas',
        bio: 'Pintura residencial e comercial com acabamento impecável e rapidez.',
        whatsapp: '51955554444',
        rating: 4.6,
        reviewCount: 10,
        role: 'user',
        verifiedMember: false,
        photoURL: 'https://picsum.photos/seed/paulo/200',
        bannerURL: 'https://picsum.photos/seed/paulo_banner/800/200'
      }
    ];

    try {
      for (const user of fakeUsers) {
        const docRef = doc(db, 'users', user.uid!);
        await setDoc(docRef, {
          ...user,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/seed');
    }
  },

  async submitRating(fromId: string, toId: string, score: number, comment?: string): Promise<void> {
    try {
      const normalizedComment = comment?.trim();

      await runTransaction(db, async (transaction) => {
        const voteRef = doc(db, 'users', fromId, 'votes', toId);
        const voteSnap = await transaction.get(voteRef);
        
        if (voteSnap.exists()) {
          throw new Error('Você já avaliou este profissional. As avaliações são anônimas e únicas.');
        }

        const userRef = doc(db, 'users', toId);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('Usuário não encontrado');
        
        const userData = userSnap.data() as UserProfile;
        const currentRating = userData.rating || 0;
        const currentCount = userData.reviewCount || 0;
        
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + score) / newCount;
        
        transaction.set(voteRef, {
          providerId: toId,
          votedAt: serverTimestamp()
        });

        const ratingRef = doc(collection(db, 'ratings'));
        transaction.set(ratingRef, {
          toId,
          score,
          ...(normalizedComment ? { comment: normalizedComment } : {}),
          createdAt: serverTimestamp()
        });
        
        transaction.update(userRef, {
          rating: Number(newRating.toFixed(1)),
          reviewCount: newCount
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transaction/rating');
    }
  },

  async getRatings(toId: string): Promise<any[]> {
    const path = 'ratings';
    try {
      const q = query(collection(db, 'ratings'), where('toId', '==', toId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) =>
        toPlainValue({ id: doc.id, ...doc.data() }),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async submitSupportMessage(data: { name: string; email: string; message: string }): Promise<void> {
    const path = 'support_messages';
    try {
      await addDoc(collection(db, 'support_messages'), {
        ...data,
        read: false,
        createdAt: serverTimestamp()
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
    const path = 'reports';
    if (!auth.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await addDoc(collection(db, 'reports'), {
        reportedUserId: data.reportedUserId,
        reportedUserName: data.reportedUserName || '',
        reporterId: auth.currentUser.uid,
        reporterEmail: auth.currentUser.email || '',
        reason: data.reason,
        details: data.details || '',
        status: 'new',
        createdAt: serverTimestamp(),
      });

      await NotificationService.createNotification({
        title: 'Nova denúncia de perfil',
        message: `${auth.currentUser.email || 'Um usuário'} denunciou o perfil de ${data.reportedUserName || data.reportedUserId}.`,
        type: 'report',
        read: false,
        link: '/admin/usuarios',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getAllReports(): Promise<UserReport[]> {
    const path = 'reports';
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((reportDoc) =>
        toPlainValue({ id: reportDoc.id, ...reportDoc.data() } as UserReport),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }
};
