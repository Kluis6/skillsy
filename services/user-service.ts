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

  async createProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!profile.uid) throw new Error('UID is required');
    const path = `users/${profile.uid}`;
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, data);
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
      const q = query(collection(db, 'users'), where('isProvider', '==', true));
      const querySnapshot = await getDocs(q);
      const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      return all.filter((p: UserProfile) => {
        const matchesSearch = !term || 
          p.name.toLowerCase().includes(term.toLowerCase()) || 
          p.category?.toLowerCase().includes(term.toLowerCase()) ||
          p.bio?.toLowerCase().includes(term.toLowerCase());
        
        const matchesLocation = !location || 
          (p.location && (
            p.location.toLowerCase().includes(location.city.toLowerCase()) ||
            p.location.toLowerCase().includes(location.state.toLowerCase())
          ));
          
        return matchesSearch && matchesLocation;
      });
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
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async submitRating(fromId: string, toId: string, score: number, comment?: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const voteRef = doc(db, 'users', fromId, 'private_data', 'votes', toId);
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
  }
};
