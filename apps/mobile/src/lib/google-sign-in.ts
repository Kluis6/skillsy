import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { auth } from './firebase';
import { ensureMemberProfile } from './members';

// Web OAuth client of the Firebase project (client_type 3 in
// google-services.json): Google issues the ID token for it, and Firebase
// Auth accepts tokens for that audience.
GoogleSignin.configure({
  webClientId: '781735734604-s7icsdkj1qhjgl7mu6m8lb3gs60fsr6o.apps.googleusercontent.com',
});

/** Android: the system account picker, no browser. Returns false if the
 * person closes the picker. */
export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response) || !response.data.idToken) return false;
    const { user } = await signInWithCredential(
      auth,
      GoogleAuthProvider.credential(response.data.idToken)
    );
    await ensureMemberProfile(user);
    return true;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) return false;
    throw error;
  }
}

export async function signOutOfGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google: nothing to clear.
  }
}
