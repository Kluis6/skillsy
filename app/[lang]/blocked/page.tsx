import type { Metadata } from 'next';
import { BlockedClient } from '@/components/blocked-client';
import { createPrivateMetadata } from '@/lib/public-metadata';
import { getMessages, getT } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/provider';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t('blocked.metaTitle'),
    description: t('blocked.metaDescription'),
  });
}

export default async function BlockedPage() {
  return (
    <I18nProvider messages={await getMessages('blocked')}>
      <BlockedClient />
    </I18nProvider>
  );
}
