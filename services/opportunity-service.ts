import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Opportunity } from '@/models/types';
import { toPlainValue } from '@/lib/firestore-plain';
import {
  buildOpportunityFields,
  getOpportunityStatus,
  needsOpportunityFollowUp,
  OPPORTUNITY_DURATION_MS,
  type OpportunityFormInput,
  type OpportunityInput,
} from '@skillsy/shared/opportunities';

export { getOpportunityStatus, needsOpportunityFollowUp };
export type { OpportunityFormInput, OpportunityInput };

const OPPORTUNITIES = 'opportunities';

function toOpportunity(id: string, value: Record<string, unknown>): Opportunity {
  return { id, ...toPlainValue(value) } as Opportunity;
}

export const OpportunityService = {
  async createForProfile(data: OpportunityFormInput, author: { name: string; whatsapp?: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Faça login para criar uma oportunidade.');
    await addDoc(collection(db, OPPORTUNITIES), {
      authorId: user.uid,
      ...buildOpportunityFields(data, author),
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + OPPORTUNITY_DURATION_MS),
    });
  },

  async getActive(filters?: { category?: string; state?: string }) {
    const constraints = [where('status', '==', 'active')];
    if (filters?.category) constraints.push(where('category', '==', filters.category));
    if (filters?.state) constraints.push(where('state', '==', filters.state));
    const snapshot = await getDocs(query(collection(db, OPPORTUNITIES), ...constraints, orderBy('createdAt', 'desc'), limit(60)));
    return snapshot.docs
      .map((item) => toOpportunity(item.id, item.data()))
      .filter((item) => getOpportunityStatus(item) === 'active');
  },

  async getByAuthor(authorId: string) {
    const snapshot = await getDocs(query(collection(db, OPPORTUNITIES), where('authorId', '==', authorId), orderBy('createdAt', 'desc'), limit(50)));
    return snapshot.docs.map((item) => toOpportunity(item.id, item.data()));
  },

  async setStatus(id: string, status: 'active' | 'closed') {
    const user = auth.currentUser;
    if (!user) throw new Error('Faça login para atualizar sua oportunidade.');
    await updateDoc(doc(db, OPPORTUNITIES, id), {
      status,
      ...(status === 'closed'
        ? { closedAt: serverTimestamp() }
        : {
            reactivatedAt: serverTimestamp(),
            expiresAt: Timestamp.fromMillis(Date.now() + OPPORTUNITY_DURATION_MS),
          }),
    });
  },

  async answerFollowUp(
    id: string,
    answers: { receivedResponse: boolean; platformSatisfied: boolean; closeRequest: boolean },
  ) {
    const user = auth.currentUser;
    if (!user) throw new Error('Faça login para responder.');
    await updateDoc(doc(db, OPPORTUNITIES, id), {
      receivedResponse: answers.receivedResponse,
      platformSatisfied: answers.platformSatisfied,
      followUpAnsweredAt: serverTimestamp(),
      ...(answers.closeRequest ? { status: 'closed', closedAt: serverTimestamp() } : {}),
    });
  },
};
