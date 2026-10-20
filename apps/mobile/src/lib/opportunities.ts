import { toPlainValue } from '@skillsy/shared/firestore-plain';
import { getOpportunityStatus, sortOpportunities } from '@skillsy/shared/opportunities';
import type { Opportunity } from '@skillsy/shared/types';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';

import { db } from './firebase';

// Same query as OpportunityService.getActive on the site.
export async function getActiveOpportunities(filters: { category?: string; state?: string }) {
  const constraints: QueryConstraint[] = [where('status', '==', 'active')];
  if (filters.category) constraints.push(where('category', '==', filters.category));
  if (filters.state) constraints.push(where('state', '==', filters.state));
  const snapshot = await getDocs(
    query(collection(db, 'opportunities'), ...constraints, orderBy('createdAt', 'desc'), limit(60))
  );
  return sortOpportunities(
    snapshot.docs
      .map((item) => ({ id: item.id, ...toPlainValue(item.data()) }) as Opportunity)
      .filter((item) => getOpportunityStatus(item) === 'active')
  );
}
