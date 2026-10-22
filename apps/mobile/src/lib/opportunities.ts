import { toPlainValue } from '@skillsy/shared/firestore-plain';
import {
  buildOpportunityFields,
  getOpportunityStatus,
  OPPORTUNITY_DURATION_MS,
  sortOpportunities,
  type OpportunityFormInput,
} from '@skillsy/shared/opportunities';
import type { Opportunity } from '@skillsy/shared/types';
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
  type QueryConstraint,
} from 'firebase/firestore';

import { db } from './firebase';

// Same reads and writes as services/opportunity-service.ts on the site; the
// document fields come from @skillsy/shared, so both pass the same rules.

const toOpportunity = (id: string, data: object) =>
  ({ id, ...toPlainValue(data) }) as Opportunity;

export async function getActiveOpportunities(filters: { category?: string; state?: string }) {
  const constraints: QueryConstraint[] = [where('status', '==', 'active')];
  if (filters.category) constraints.push(where('category', '==', filters.category));
  if (filters.state) constraints.push(where('state', '==', filters.state));
  const snapshot = await getDocs(
    query(collection(db, 'opportunities'), ...constraints, orderBy('createdAt', 'desc'), limit(60))
  );
  return sortOpportunities(
    snapshot.docs
      .map((item) => toOpportunity(item.id, item.data()))
      .filter((item) => getOpportunityStatus(item) === 'active')
  );
}

export async function getMyOpportunities(uid: string) {
  const snapshot = await getDocs(
    query(
      collection(db, 'opportunities'),
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
  );
  return snapshot.docs.map((item) => toOpportunity(item.id, item.data()));
}

export async function createOpportunity(
  uid: string,
  data: OpportunityFormInput,
  author: { name: string; whatsapp?: string }
) {
  await addDoc(collection(db, 'opportunities'), {
    authorId: uid,
    ...buildOpportunityFields(data, author),
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + OPPORTUNITY_DURATION_MS),
  });
}

export async function setOpportunityStatus(id: string, status: 'active' | 'closed') {
  await updateDoc(doc(db, 'opportunities', id), {
    status,
    ...(status === 'closed'
      ? { closedAt: serverTimestamp() }
      : {
          reactivatedAt: serverTimestamp(),
          expiresAt: Timestamp.fromMillis(Date.now() + OPPORTUNITY_DURATION_MS),
        }),
  });
}

export async function answerFollowUp(
  id: string,
  answers: { receivedResponse: boolean; platformSatisfied: boolean; closeRequest: boolean }
) {
  await updateDoc(doc(db, 'opportunities', id), {
    receivedResponse: answers.receivedResponse,
    platformSatisfied: answers.platformSatisfied,
    followUpAnsweredAt: serverTimestamp(),
    ...(answers.closeRequest ? { status: 'closed', closedAt: serverTimestamp() } : {}),
  });
}
