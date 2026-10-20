import type { FirebaseApp } from 'firebase/app';
import { getAuth } from '@firebase/auth';

// Browser preview: the default browser persistence.
export function createAuth(app: FirebaseApp) {
  return getAuth(app);
}
