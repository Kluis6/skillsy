import { Search } from 'lucide-react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function BuscarScreen() {
  return (
    <ScreenPlaceholder
      icon={Search}
      title="Buscar profissionais"
      description="Encontre quem atende o serviço que você precisa na sua região."
    />
  );
}
