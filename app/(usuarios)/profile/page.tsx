import { Metadata } from 'next';
import { ProfileSettingsClient } from '@/components/profile-settings-client';

export const metadata: Metadata = {
  title: 'Configurações do Perfil',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ProfileSettingsClient />;
}
