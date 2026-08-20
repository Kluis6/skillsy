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
import { Opportunity, OpportunityStatus, OpportunityUrgency } from '@/models/types';
import { toPlainValue } from '@/lib/firestore-plain';

const OPPORTUNITIES = 'opportunities';

export type OpportunityInput = Pick<
  Opportunity,
  'category' | 'title' | 'description' | 'city' | 'neighborhood' | 'state'
>;

export type OpportunityFormInput = OpportunityInput & {
  urgency: OpportunityUrgency;
};

const OPPORTUNITY_URGENCIES: OpportunityUrgency[] = ['normal', 'soon', 'urgent'];

function normalize(value: string) {
  return value.trim();
}

function ensureInput(data: OpportunityFormInput) {
  const fields: Array<[keyof OpportunityInput, number, number]> = [
    ['category', 1, 100],
    ['title', 5, 120],
    ['description', 20, 2000],
    ['city', 2, 100],
    ['neighborhood', 2, 100],
    ['state', 2, 2],
  ];

  for (const [field, min, max] of fields) {
    const value = normalize(data[field]);
    if (value.length < min || value.length > max) {
      throw new Error(`Preencha ${field} com ${min} a ${max} caracteres.`);
    }
  }

  if (!OPPORTUNITY_URGENCIES.includes(data.urgency)) {
    throw new Error('Escolha a urgência da oportunidade.');
  }
}

function toOpportunity(id: string, value: Record<string, unknown>): Opportunity {
  return { id, ...toPlainValue(value) } as Opportunity;
}

export function getOpportunityStatus(opportunity: Opportunity): OpportunityStatus {
  if (opportunity.status !== 'active') return opportunity.status;
  const expiresAt = opportunity.expiresAt;
  const expiresAtDate =
    expiresAt && typeof expiresAt === 'object' && 'seconds' in expiresAt
      ? new Date(Number(expiresAt.seconds) * 1000)
      : expiresAt instanceof Date
        ? expiresAt
        : null;

  return expiresAtDate && expiresAtDate.getTime() <= Date.now()
    ? 'expired'
    : 'active';
}

export function needsOpportunityFollowUp(opportunity: Opportunity) {
  if (getOpportunityStatus(opportunity) !== 'active') return false;
  const createdAt = opportunity.createdAt;
  if (!createdAt || typeof createdAt !== 'object' || !('seconds' in createdAt)) return false;
  return Date.now() >= Number(createdAt.seconds) * 1000 + 20 * 24 * 60 * 60 * 1000;
}

export const OpportunityService = {
  async createForProfile(data: OpportunityFormInput, author: { name: string; whatsapp?: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Faça login para criar uma oportunidade.');
    ensureInput(data);
    const phone = author.whatsapp?.replace(/\D/g, '');
    if (!phone) throw new Error('Cadastre um WhatsApp no seu perfil antes de publicar a oportunidade.');

    const expiresAt = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await addDoc(collection(db, OPPORTUNITIES), {
      authorId: user.uid,
      authorName: normalize(author.name).slice(0, 100),
      authorWhatsApp: phone,
      category: normalize(data.category),
      title: normalize(data.title),
      description: normalize(data.description),
      city: normalize(data.city),
      neighborhood: normalize(data.neighborhood),
      state: normalize(data.state).toUpperCase(),
      urgency: data.urgency,
      status: 'active',
      createdAt: serverTimestamp(),
      expiresAt,
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
            expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
