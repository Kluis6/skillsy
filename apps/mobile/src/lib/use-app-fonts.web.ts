import { useFonts } from 'expo-font';

// Browser preview: load the same faces the native build embeds, under the
// same family names, so `fontWeight` picks the right file.
export function useAppFonts() {
  const [loaded, error] = useFonts([
    {
      fontFamily: 'Inter',
      fontDefinitions: [
        { path: require('../../assets/fonts/Inter_400Regular.ttf'), weight: 400 },
        { path: require('../../assets/fonts/Inter_500Medium.ttf'), weight: 500 },
        { path: require('../../assets/fonts/Inter_600SemiBold.ttf'), weight: 600 },
        { path: require('../../assets/fonts/Inter_700Bold.ttf'), weight: 700 },
      ],
    },
    {
      fontFamily: 'Outfit',
      fontDefinitions: [
        { path: require('../../assets/fonts/Outfit_500Medium.ttf'), weight: 500 },
        { path: require('../../assets/fonts/Outfit_600SemiBold.ttf'), weight: 600 },
        { path: require('../../assets/fonts/Outfit_700Bold.ttf'), weight: 700 },
      ],
    },
  ]);
  // Fall back to the system font instead of a blank screen if loading fails.
  return loaded || Boolean(error);
}
