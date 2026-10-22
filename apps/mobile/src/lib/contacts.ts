import { toPlainValue } from '@skillsy/shared/firestore-plain';
import { toPublicProfileModel } from '@skillsy/shared/providers';
import type { UserProfile } from '@skillsy/shared/types';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebase';

// Contacts live in users/{uid}.contacts, like on the site ("Conectar").

export async function setContact(uid: string, contactId: string, connected: boolean) {
  await updateDoc(doc(db, 'users', uid), {
    contacts: connected ? arrayUnion(contactId) : arrayRemove(contactId),
  });
}

/** Public profiles of the saved contacts, in batches of 30 (the "in" limit). */
export async function getContacts(uids: string[]) {
  const batches: string[][] = [];
  for (let i = 0; i < uids.length; i += 30) batches.push(uids.slice(i, i + 30));
  const results = await Promise.all(
    batches.map((batch) =>
      getDocs(query(collection(db, 'public_profiles'), where('uid', 'in', batch)))
    )
  );
  const profiles = results
    .flatMap((snapshot) => snapshot.docs)
    .map((item) => toPublicProfileModel(toPlainValue(item.data()) as Partial<UserProfile>))
    .filter(
      (profile): profile is UserProfile =>
        Boolean(profile) && !profile!.isBlocked && !profile!.isDeleted
    );
  // Keep the order the member saved them in, newest last on the site.
  return uids
    .map((uid) => profiles.find((profile) => profile.uid === uid))
    .filter((profile): profile is UserProfile => Boolean(profile));
}
