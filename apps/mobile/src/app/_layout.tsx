import '../../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { AuthProvider } from '@/lib/auth';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  // Cached lists are reused for 5 minutes, so switching tabs does not read
  // Firestore again.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } } })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={NAV_THEME[scheme]}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <AppTabs />
          <PortalHost />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
