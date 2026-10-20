import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from '@firebase/auth';

// Keeps the session between app launches. The web build uses firebase-auth.web.ts.
export function createAuth(app: FirebaseApp) {
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}
