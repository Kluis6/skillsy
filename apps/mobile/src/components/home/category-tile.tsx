import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type CategoryTileProps = { label: string; icon: LucideIcon; onPress: () => void };

/** Outlined square with the category icon and the name below (home shortcuts). */
export function CategoryTile({ label, icon: Icon, onPress }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-1 items-center gap-2 active:opacity-70">
      <View className="aspect-square w-full items-center justify-center border border-border bg-card">
        <Icon size={28} className="text-primary" />
      </View>
      <Text className="text-center text-sm" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Card for the "Todas as categorias" grid: icon on top, name below. */
export function CategoryGridCard({ label, icon: Icon, onPress }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-28 flex-1 justify-between gap-3 border border-border-subtle bg-card p-4 shadow-sm shadow-black/5 active:bg-accent">
      <View className="size-10 items-center justify-center bg-primary/10">
        <Icon size={22} className="text-primary" />
      </View>
      <Text className="font-medium" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}
