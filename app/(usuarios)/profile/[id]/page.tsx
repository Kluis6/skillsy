import type { Metadata } from 'next';
import { cache } from 'react';
import { ProfileDetailClient } from '@/components/profile-detail-client';
import { createPublicMetadata } from '@/lib/public-metadata';
import { UserService } from '@/services/user-service';

// Deduplicates the fetch shared by generateMetadata and the page in one request.
const getPublicProfile = cache((id: string) => UserService.getPublicProfile(id));

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const profile = await getPublicProfile(id);
    if (!profile) return { title: 'Perfil não encontrado' };

    const title = `${profile.name} | ${profile.serviceType || 'Membro'}`;
    const description = profile.bio || `Conheça ${profile.name}, profissional na comunidade SUD especializado em ${profile.serviceType || 'serviços diversos'}.`;

    return createPublicMetadata({
      title,
      description,
      path: `/profile/${profile.uid}`,
      imageTitle: profile.name,
      imageDescription: description,
      imageLabel: profile.category || 'Perfil público',
      useRouteOgImage: true,
    });
  } catch (error) {
    return { title: 'Perfil' };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const initialProfile = await getPublicProfile(id);
  
  return <ProfileDetailClient id={id} initialProfile={initialProfile} />;
}
