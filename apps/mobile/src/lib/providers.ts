import { toPlainValue } from '@skillsy/shared/firestore-plain';
import {
  pickSearchResults,
  planProviderSearch,
  toPublicProfileModel,
} from '@skillsy/shared/providers';
import type { UserProfile } from '@skillsy/shared/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';

import { db } from './firebase';

export type ProviderSearch = { term: string; state?: string; category?: string };

// Same query as UserService.searchProviders on the site; the filtering and
// ranking come from @skillsy/shared so both list the same professionals.
export async function searchProviders({ term, state, category }: ProviderSearch) {
  const plan = planProviderSearch(term, { state }, category);
  const constraints: QueryConstraint[] = [
    where('isProvider', '==', true),
    where('isBlocked', '==', false),
    where('isDeleted', '==', false),
  ];
  if (plan.category) constraints.push(where('category', '==', plan.category));
  if (plan.state) constraints.push(where('publicState', '==', plan.state));
  if (plan.anchor) constraints.push(where('searchTokens', 'array-contains', plan.anchor));
  constraints.push(limit(60));

  const snapshot = await getDocs(query(collection(db, 'public_profiles'), ...constraints));
  return pickSearchResults(
    snapshot.docs.map((doc) => toPlainValue(doc.data())),
    plan
  );
}

export async function getPublicProfile(uid: string) {
  const snapshot = await getDoc(doc(db, 'public_profiles', uid));
  return snapshot.exists()
    ? toPublicProfileModel(toPlainValue(snapshot.data()) as Partial<UserProfile>)
    : null;
}

/** The signed-in user's own profile (private document, readable by its owner). */
export async function getOwnProfile(uid: string) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? (toPlainValue(snapshot.data()) as UserProfile) : null;
}
