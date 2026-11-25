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
  runTransaction,
  serverTimestamp,
  Timestamp,
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
  const publicRef = doc(db, 'public_profiles', user.uid);
  const wardRef = doc(db, 'member_wards', user.uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Perfil não encontrado.');

    const { privatePatch, privateProfile, galleryToValidate } = profileDocuments.prepareProfileUpdate({
      uid: user.uid,
      current: snapshot.data(),
      changes,
      authUser: user,
    });
    if (galleryToValidate) {
      transaction.set(doc(ref, 'profile_validation', 'gallery'), { gallery: galleryToValidate, validatedAt: serverTimestamp() });
    }

    transaction.update(ref, privatePatch);
    const isPublic = shouldSyncPublicProfile(privateProfile) && !privateProfile.isDeleted;
    const ward = privateProfile.ward?.trim();
    if (isPublic && ward) transaction.set(wardRef, { uid: user.uid, ward });
    else transaction.delete(wardRef);

    if (!isPublic) {
      transaction.delete(publicRef);
      return;
    }

    const publicData = buildPublicProfileData(privateProfile);
    transaction.set(publicRef, {
      ...publicData,
      ward: deleteField(),
      companyLogoImageName: publicData.companyLogoImageName ?? deleteField(),
      companyBannerImageName: publicData.companyBannerImageName ?? deleteField(),
    }, { merge: true });
  });
}
