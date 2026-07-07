import { ProfileSettingsClient } from '@/components/profile-settings-client';
import { createPrivateMetadata } from '@/lib/public-metadata';

export const metadata = createPrivateMetadata({
  title: 'Configurações do Perfil',
  description: 'Área restrita para editar configurações do perfil no Skillsy.',
});

export default function ProfilePage() {
  return <ProfileSettingsClient />;
}
