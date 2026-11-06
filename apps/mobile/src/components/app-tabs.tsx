import { NativeTabs } from 'expo-router/native-tabs';

import { useAuth } from '@/lib/auth';
import { useAppearance } from '@/lib/appearance';
import { THEME } from '@/lib/theme';
import { useT } from '@/lib/i18n';

// Android bottom navigation (Material). The web version is app-tabs.web.tsx.
// Like GetNinjas, the account tab reads "Entrar" until the member signs in.
export default function AppTabs() {
  const colors = THEME[useAppearance().scheme];
  const { user } = useAuth();
  const t = useT();

  return (
    <NativeTabs
      backgroundColor={colors.card}
      indicatorColor={colors.accent}
      // Material 3: every tab shows its label, not only the selected one.
      labelVisibilityMode="labeled"
      iconColor={{ default: colors.mutedForeground, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.mutedForeground },
        selected: { color: colors.primary },
      }}>
      <NativeTabs.Trigger name="(inicio)">
        <NativeTabs.Trigger.Label>{t("app.tabs.home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="home" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(buscar)">
        <NativeTabs.Trigger.Label>{t("app.tabs.search")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="search" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(oportunidades)">
        <NativeTabs.Trigger.Label>{t("app.tabs.opportunities")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="work" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(perfil)">
        <NativeTabs.Trigger.Label>{user ? t("app.tabs.profile") : t("app.tabs.signIn")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="person" selectedColor={colors.primary} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
