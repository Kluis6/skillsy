import type { User } from '@firebase/auth';
import { newMemberNotification, newMemberProfile } from '@skillsy/shared/members';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from './firebase';

/**
 * Creates users/{uid} the first time someone signs in through the app (with
 * Google, the account may not exist on the site yet), exactly as the site's
 * useAuth does, and tells the admins about the new member.
 */
export async function ensureMemberProfile(user: User) {
  const ref = doc(db, 'users', user.uid);
  if ((await getDoc(ref)).exists()) return;

  const profile = newMemberProfile({
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  });
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  try {
    await addDoc(collection(db, 'admin_notifications'), {
      ...newMemberNotification(profile.name),
      createdAt: serverTimestamp(),
    });
  } catch {
    // The notice is a courtesy to the admins; the account works without it.
  }
}
