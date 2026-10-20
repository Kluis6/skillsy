import { initializeApp } from 'firebase/app';
// Auth comes from @firebase/auth, not firebase/auth: since Firebase 13 only the
// former resolves to the React Native build (with session persistence). Import
// every auth function from there so the app uses a single copy.
import { connectAuthEmulator } from '@firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

import { createAuth } from './firebase-auth';

// Same public values as the site's firebase-applet-config.json (not secrets:
// access is controlled by firestore.rules).
const firebaseConfig = {
  projectId: 'gen-lang-client-0463625624',
  appId: '1:781735734604:web:bf9c92d9c508a6bd2e33e9',
  apiKey: 'AIzaSyBqRtOiFB0eAqGSI0eIO8kJCB8cRF7KEzw',
  authDomain: 'gen-lang-client-0463625624.firebaseapp.com',
  storageBucket: 'gen-lang-client-0463625624.firebasestorage.app',
  messagingSenderId: '781735734604',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, '(default)');
export const auth = createAuth(app);

// The *:local scripts point the app at the emulators from `npm run dev:local`
// at the repo root. On a phone, `adb reverse` makes 127.0.0.1 reach this computer.
export const usingEmulators = process.env.EXPO_PUBLIC_USE_EMULATORS === '1';
if (usingEmulators) {
  const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || '127.0.0.1';
  connectFirestoreEmulator(db, host, 8080);
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
}
