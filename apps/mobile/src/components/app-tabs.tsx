import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { THEME } from '@/lib/theme';

// Android bottom navigation (Material). The web version is app-tabs.web.tsx.
export default function AppTabs() {
  const colors = THEME[useColorScheme() === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.card}
      indicatorColor={colors.accent}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Buscar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="search" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="oportunidades">
        <NativeTabs.Trigger.Label>Oportunidades</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="work" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="contatos">
        <NativeTabs.Trigger.Label>Contatos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="contacts" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="person" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
