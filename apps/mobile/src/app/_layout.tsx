import '../../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { SnackbarProvider } from '@/components/snackbar';
import { AppearanceProvider, useAppearance } from '@/lib/appearance';
import { AuthProvider } from '@/lib/auth';
import { useAppFonts } from '@/lib/use-app-fonts';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const fontsReady = useAppFonts();
  // Cached lists are reused for 5 minutes, so switching tabs does not read
  // Firestore again.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } } })
  );

  if (!fontsReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppearanceProvider>
          <Navigation />
        </AppearanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Navigation() {
  const { scheme } = useAppearance();
  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <SnackbarProvider>
        {/* Every screen draws its own AppHeader, so tabs and stacked screens
            share the same bar, title size and back arrow. */}
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </SnackbarProvider>
    </ThemeProvider>
  );
}
