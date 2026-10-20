import type { Persistence } from '@firebase/auth';

// @firebase/auth lists its browser types first, so TypeScript never sees the
// React Native build that Metro actually loads (the "react-native" export).
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
