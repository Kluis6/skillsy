import { toPlainValue } from '@skillsy/shared/firestore-plain';
import {
  pickSearchResults,
  planProviderSearch,
  toPublicProfileModel,
} from '@skillsy/shared/providers';
import type { UserProfile } from '@skillsy/shared/types';
import { byOrigin } from '@skillsy/shared/i18n/origin';
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

export type ProviderSearch = {
  term: string;
  state?: string;
  category?: string;
  /** Words of the app's language → Portuguese (buildSearchSynonyms). */
  synonyms?: Record<string, string>;
  /** App language: the visitor's country only, this language first. */
  language?: string;
};

// Same query as UserService.searchProviders on the site; the filtering and
// ranking come from @skillsy/shared so both list the same professionals.
export async function searchProviders({ term, state, category, synonyms, language = 'pt' }: ProviderSearch) {
  const plan = planProviderSearch(term, { state }, category, synonyms);
  const constraints: QueryConstraint[] = [
    where('isProvider', '==', true),
    where('isBlocked', '==', false),
    where('isDeleted', '==', false),
  ];
  if (plan.category) constraints.push(where('category', '==', plan.category));
  if (plan.state) constraints.push(where('publicState', '==', plan.state));
  if (plan.anchor) constraints.push(where('searchTokens', 'array-contains', plan.anchor));
  else if (plan.anchorAny) constraints.push(where('searchTokens', 'array-contains-any', plan.anchorAny));
  constraints.push(limit(60));

  const snapshot = await getDocs(query(collection(db, 'public_profiles'), ...constraints));
  return byOrigin(
    pickSearchResults(
      snapshot.docs.map((doc) => toPlainValue(doc.data())),
      plan
    ),
    { language }
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
