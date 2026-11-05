import type { Metadata } from 'next';
import { ContactsClient } from '@/components/contacts-client';
import { createPrivateMetadata } from '@/lib/public-metadata';
import { getMessages, getT } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/provider';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t('contacts.metaTitle'),
    description: t('contacts.metaDescription'),
  });
}

export default async function ContactsPage() {
  return (
    <I18nProvider messages={await getMessages('contacts')}>
      <ContactsClient />
    </I18nProvider>
  );
}
