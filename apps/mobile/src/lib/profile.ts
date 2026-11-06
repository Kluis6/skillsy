import {
  buildPublicProfileData,
  createProfileDocuments,
  shouldSyncPublicProfile,
} from '@skillsy/shared/profile-documents';
import type { UserProfile } from '@skillsy/shared/types';
import type { User } from '@firebase/auth';
import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
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
  // public profile) get it; everyone else has it removed. The ward goes to
  // member_wards (signed-in members only) and is deleted from the public doc.
  const publicRef = doc(db, 'public_profiles', user.uid);
  const wardRef = doc(db, 'member_wards', user.uid);
  const isPublic = shouldSyncPublicProfile(privateProfile) && !privateProfile.isDeleted;
  const ward = typeof privateProfile.ward === 'string' ? privateProfile.ward.trim() : '';
  const batch = writeBatch(db);
  if (isPublic && ward) batch.set(wardRef, { uid: user.uid, ward });
  else batch.delete(wardRef);
  if (!isPublic) {
    batch.delete(publicRef);
  } else {
    batch.set(publicRef, { ...buildPublicProfileData(privateProfile), ward: deleteField() }, { merge: true });
  }
  await batch.commit();
}
