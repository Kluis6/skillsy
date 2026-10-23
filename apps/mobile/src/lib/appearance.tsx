import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

export type AppearancePreference = 'system' | 'light' | 'dark';
type Scheme = 'light' | 'dark';

const STORAGE_KEY = 'skillsy.appearance';

type AppearanceState = {
  preference: AppearancePreference;
  /** What is on screen: the preference, or the phone's setting for "system". */
  scheme: Scheme;
  setPreference: (preference: AppearancePreference) => void;
};

// Light is the default; dark and "follow the phone" are opt-in in Perfil.
const DEFAULT_PREFERENCE: AppearancePreference = 'light';

const AppearanceContext = createContext<AppearanceState>({
  preference: DEFAULT_PREFERENCE,
  scheme: 'light',
  setPreference: () => {},
});

/**
 * Light (default), dark or the phone's setting, saved on the device. Navigation
 * (headers, tab bar) and the NativeWind classes both follow `scheme`, so they
 * never disagree.
 */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const system: Scheme = useSystemScheme() === 'dark' ? 'dark' : 'light';
  const [preference, setPreferenceState] = useState<AppearancePreference>(DEFAULT_PREFERENCE);
  const scheme = preference === 'system' ? system : preference;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setPreferenceState(saved);
    });
  }, []);

  // Always an explicit value: NativeWind's own "system" mode on the web only
  // removes the dark class, which would leave the screens light in dark mode.
  useEffect(() => {
    colorScheme.set(scheme);
  }, [scheme]);

  const setPreference = (next: AppearancePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <AppearanceContext.Provider value={{ preference, scheme, setPreference }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
