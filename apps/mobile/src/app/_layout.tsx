import '../../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AppTabs />
      <PortalHost />
    </ThemeProvider>
  );
}
