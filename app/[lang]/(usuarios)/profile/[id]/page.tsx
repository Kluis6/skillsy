import type { Metadata } from 'next';
import { cache } from 'react';
import { ProfileDetailClient } from '@/components/profile-detail-client';
import { createPublicMetadata } from '@/lib/public-metadata';
import { UserService } from '@/services/user-service';
import { getMessages, getT } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/provider';

// Deduplicates the fetch shared by generateMetadata and the page in one request.
const getPublicProfile = cache((id: string) => UserService.getPublicProfile(id));

// Public data, regenerated at most once an hour (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 3600;

// Profiles are rendered on their first request and then cached.
export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getT();
  try {
    const profile = await getPublicProfile(id);
    if (!profile) return { title: t('profile.notFound') };

    const title = `${profile.name} | ${profile.serviceType || t('profile.metaMember')}`;
    const description =
      profile.bio ||
      t('profile.metaDescription', {
        name: profile.name,
        service: profile.serviceType || t('profile.metaVariousServices'),
      });

    return createPublicMetadata({
      title,
      description,
      path: `/profile/${profile.uid}`,
      imageTitle: profile.name,
      imageDescription: description,
      imageLabel: profile.category || t('profile.metaImageLabel'),
      useRouteOgImage: true,
    });
  } catch (error) {
    return { title: t('profile.metaTitle') };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const [initialProfile, messages] = await Promise.all([
    getPublicProfile(id),
    getMessages('profile'),
  ]);

  return (
    <I18nProvider messages={messages}>
      <ProfileDetailClient id={id} initialProfile={initialProfile} />
    </I18nProvider>
  );
}
