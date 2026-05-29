import type { Metadata } from 'next';
import { ProfileDetailClient } from '@/components/profile-detail-client';
import { createPublicMetadata } from '@/lib/public-metadata';
import { UserService } from '@/services/user-service';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const profile = await UserService.getPublicProfile(id);
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
      socialImagePath: `/profile/${profile.uid}/opengraph-image`,
    });
  } catch (error) {
    return { title: 'Perfil' };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const initialProfile = await UserService.getPublicProfile(id);
  
  return <ProfileDetailClient id={id} initialProfile={initialProfile} />;
}
