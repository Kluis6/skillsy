import { Search } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';

/** Looks like the search field and opens Buscar, as on GetNinjas' home. */
export function SearchLauncher({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel="Buscar profissionais"
      className="mx-4 h-14 flex-row items-center gap-3 border border-input bg-background px-4 active:bg-accent">
      <Search size={22} className="text-foreground" />
      <Text className="text-base text-muted-foreground">O que você procura?</Text>
    </Pressable>
  );
}
