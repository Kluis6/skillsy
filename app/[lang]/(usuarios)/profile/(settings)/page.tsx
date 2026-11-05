import type { Metadata } from 'next';
import { ProfileSettingsClient } from '@/components/profile-settings-client';
import { createPrivateMetadata } from '@/lib/public-metadata';
import { getMessages, getT } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/provider';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t('settings.metaTitle'),
    description: t('settings.metaDescription'),
  });
}

export default async function ProfilePage() {
  return (
    <I18nProvider messages={await getMessages('settings')}>
      <ProfileSettingsClient />
    </I18nProvider>
  );
}
