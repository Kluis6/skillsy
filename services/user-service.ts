import { 
  collection, 
  query, 
  getDocs, 
  where, 
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
import { UserProfile } from '@/models/types';
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

export const UserService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
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
      return querySnapshot.docs[0].data() as UserProfile;
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
      // Remove 'id' if it exists in the data to avoid Firestore rule violations
      const { id, ...updateData } = data as any;
      await updateDoc(docRef, updateData);
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async searchProviders(term: string, location?: { city: string; state: string }): Promise<UserProfile[]> {
    const path = 'users';
    try {
      // Fetch all users to allow finding people by name even if not marked as provider
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

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
        
        const matchesLocation = !location || 
          (p.location && (
            p.location.toLowerCase().includes(location.city.toLowerCase()) ||
            p.location.toLowerCase().includes(location.state.toLowerCase())
          )) || (!p.location && searchTokens.length > 0); // If searching by name specifically, ignore empty location
          
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
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
          comment,
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  }
};
