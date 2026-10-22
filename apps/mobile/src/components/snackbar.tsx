import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

const SnackbarContext = createContext<(message: string) => void>(() => {});

// Bottom navigation bar (80) + extended FAB (56) + margins, so the snackbar
// never covers the screen's main action (Material 3).
const BOTTOM_OFFSET = 80 + 56 + 24;

/** Short confirmations at the bottom of the screen (Material 3 snackbar),
 * above the bottom navigation bar and the FAB. */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((next: string) => {
    clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(null), 4000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      {message ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(150)}
          pointerEvents="none"
          style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + BOTTOM_OFFSET }}>
          <View
            className="min-h-12 justify-center bg-foreground px-4 py-3 shadow-lg shadow-black/20"
            accessibilityLiveRegion="polite"
            accessibilityRole="alert">
            <Text className="text-sm text-background">{message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}
