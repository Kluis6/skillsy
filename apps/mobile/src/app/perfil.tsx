import { User } from 'lucide-react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function PerfilScreen() {
  return (
    <ScreenPlaceholder
      icon={User}
      title="Perfil"
      description="Entre na sua conta para editar seu perfil e ver suas avaliações."
    />
  );
}
