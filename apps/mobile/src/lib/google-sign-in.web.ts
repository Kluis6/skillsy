import { GoogleAuthProvider, signInWithPopup } from '@firebase/auth';
import { FirebaseError } from 'firebase/app';

import { auth } from './firebase';
import { ensureMemberProfile } from './members';

/** Browser preview: Google's popup (the emulator shows test accounts). */
export async function signInWithGoogle() {
  try {
    const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    await ensureMemberProfile(user);
    return true;
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
    ) {
      return false;
    }
    throw error;
  }
}

export async function signOutOfGoogle() {}
