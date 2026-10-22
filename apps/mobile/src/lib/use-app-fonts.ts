// On Android and iOS, Inter and Outfit are embedded in the build by the
// expo-font plugin (app.json), so there is nothing to load at runtime.
export function useAppFonts() {
  return true;
}
