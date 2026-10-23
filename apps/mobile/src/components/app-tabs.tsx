import { NativeTabs } from 'expo-router/native-tabs';

import { useAuth } from '@/lib/auth';
import { useAppearance } from '@/lib/appearance';
import { THEME } from '@/lib/theme';

// Android bottom navigation (Material). The web version is app-tabs.web.tsx.
// Like GetNinjas, the account tab reads "Entrar" until the member signs in.
export default function AppTabs() {
  const colors = THEME[useAppearance().scheme];
  const { user } = useAuth();

  return (
    <NativeTabs
      backgroundColor={colors.card}
      indicatorColor={colors.accent}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="home" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="buscar">
        <NativeTabs.Trigger.Label>Buscar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="search" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="oportunidades">
        <NativeTabs.Trigger.Label>Oportunidades</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="work" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>{user ? 'Perfil' : 'Entrar'}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="person" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
