import { Stack } from 'expo-router';

// Each tab has its own stack, so screens opened from it (profile, articles,
// contacts) keep the bottom navigation bar. Shared screens live in
// (inicio,buscar,oportunidades,perfil)/.
export const unstable_settings = { initialRouteName: 'perfil' };

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
