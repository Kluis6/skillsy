import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';

// The native splash can only be a solid color with a centered image (Android
// 12+), so it shows the middle color of this gradient with the same white
// wordmark (app.json), and this screen takes over with the gradient.
const GRADIENT = ['#007594', '#00406D'] as const; // primary → brand
const MIN_VISIBLE_MS = 700;
// Never cover the app for longer than this, even if the session restore hangs.
const MAX_VISIBLE_MS = 4000;

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Blue gradient with "Skillsy" in white, over the app until `ready`. */
export function BrandSplash({ ready }: { ready: boolean }) {
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [maxTimeDone, setMaxTimeDone] = useState(false);

  useEffect(() => {
    const min = setTimeout(() => setMinTimeDone(true), MIN_VISIBLE_MS);
    const max = setTimeout(() => setMaxTimeDone(true), MAX_VISIBLE_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, []);

  if ((ready && minTimeDone) || maxTimeDone) return null;

  return (
    <Animated.View exiting={FadeOut.duration(300)} style={StyleSheet.absoluteFill}>
      <StatusBar style="light" />
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        // Swap from the native splash only once this screen is drawn.
        onLayout={() => SplashScreen.hideAsync().catch(() => {})}
        style={styles.fill}>
        <Text className="font-heading text-5xl font-bold text-white">Skillsy</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
