import {
  buildPublicProfileData,
  createProfileDocuments,
  shouldSyncPublicProfile,
} from '@skillsy/shared/profile-documents';
import type { UserProfile } from '@skillsy/shared/types';
import type { User } from '@firebase/auth';
import {
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from './firebase';

// Same documents as UserService.updateProfile on the site: the normalization,
// merge and patch come from @skillsy/shared; this file only reads and writes.
const profileDocuments = createProfileDocuments({
  isTimestamp: (value) => value instanceof Timestamp,
  timestamp: (seconds, nanoseconds) => new Timestamp(seconds, nanoseconds),
  timestampFromDate: (date) => Timestamp.fromDate(date),
  deleteField,
  serverTimestamp,
});

export async function saveProfile(user: User, changes: Partial<UserProfile>) {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('Perfil não encontrado.');

  const { privatePatch, privateProfile } = profileDocuments.prepareProfileUpdate({
    uid: user.uid,
    current: snapshot.data(),
    changes,
    authUser: user,
  });
  await updateDoc(ref, privatePatch);

  // Mirror public_profiles like the site: providers (or members who chose a
  // public profile) get it; everyone else has it removed.
  const publicRef = doc(db, 'public_profiles', user.uid);
  if (!shouldSyncPublicProfile(privateProfile) || privateProfile.isDeleted) {
    await deleteDoc(publicRef);
  } else {
    await setDoc(publicRef, buildPublicProfileData(privateProfile), { merge: true });
  }
}
