import { Search } from '@/lib/icons';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';

/** Looks like the search field and opens Buscar, as on GetNinjas' home. Same
 * size, border, icon (20px, muted) and text position as the field on Buscar. */
export function SearchLauncher({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel="Buscar profissionais"
      className="mx-4 h-14 flex-row items-center gap-3 border border-input bg-background px-3 shadow-sm shadow-black/5 active:bg-accent dark:bg-input/30">
      <Search size={20} className="text-muted-foreground" />
      <Text className="text-base text-muted-foreground">O que você procura?</Text>
    </Pressable>
  );
}
