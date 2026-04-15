import { Metadata } from 'next';
import { ProfileDetailClient } from '@/components/profile-detail-client';
import { UserService } from '@/services/user-service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const profile = await UserService.getProfile(id);
    if (!profile) return { title: 'Perfil não encontrado' };

    const title = `${profile.name} | ${profile.serviceType || 'Membro'} | Skillsy`;
    const description = profile.bio || `Conheça ${profile.name}, profissional na comunidade SUD especializado em ${profile.serviceType || 'serviços diversos'}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [profile.photoURL || 'https://picsum.photos/seed/skillsy-profile/1200/630'],
      },
    };
  } catch (error) {
    return { title: 'Perfil | Skillsy' };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  return <ProfileDetailClient id={id} />;
}
