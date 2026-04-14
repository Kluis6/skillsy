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
import { db } from '@/lib/firebase';
import { UserProfile } from '@/models/types';

export const UserService = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  },

  async createProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!profile.uid) throw new Error('UID is required');
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, {
      ...profile,
      createdAt: serverTimestamp(),
    });
  },

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
  },

  async toggleContact(uid: string, contactId: string, isAdding: boolean): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      contacts: isAdding ? arrayUnion(contactId) : arrayRemove(contactId)
    });
  },

  async getProviders(limitCount: number = 10): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'), where('isProvider', '==', true), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  },

  async searchProviders(term: string, location?: { city: string; state: string }): Promise<UserProfile[]> {
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
  },

  async getContacts(uids: string[]): Promise<UserProfile[]> {
    if (!uids || uids.length === 0) return [];
    // Firestore 'in' query limit is 10
    const q = query(collection(db, 'users'), where('uid', 'in', uids.slice(0, 10)));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  },

  async adminUpdateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
  },

  async submitRating(fromId: string, toId: string, score: number, comment?: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
      // 1. Check if already voted (Private record)
      const voteRef = doc(db, 'users', fromId, 'private_data', 'votes', toId);
      const voteSnap = await transaction.get(voteRef);
      
      if (voteSnap.exists()) {
        throw new Error('Você já avaliou este profissional. As avaliações são anônimas e únicas.');
      }

      // 2. Get provider profile to update stats
      const userRef = doc(db, 'users', toId);
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) throw new Error('Usuário não encontrado');
      
      const userData = userSnap.data() as UserProfile;
      const currentRating = userData.rating || 0;
      const currentCount = userData.reviewCount || 0;
      
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + score) / newCount;
      
      // 3. Create private vote record (to prevent double voting)
      transaction.set(voteRef, {
        providerId: toId,
        votedAt: serverTimestamp()
      });

      // 4. Add public anonymous rating doc (NO fromId stored here)
      const ratingRef = doc(collection(db, 'ratings'));
      transaction.set(ratingRef, {
        toId,
        score,
        comment,
        createdAt: serverTimestamp()
      });
      
      // 5. Update user stats
      transaction.update(userRef, {
        rating: Number(newRating.toFixed(1)),
        reviewCount: newCount
      });
    });
  },

  async getRatings(toId: string): Promise<any[]> {
    const q = query(collection(db, 'ratings'), where('toId', '==', toId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
