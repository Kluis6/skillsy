import type { LucideIcon } from '@/lib/icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type FabProps = { icon: LucideIcon; label: string; onPress: () => void };

/** Extended floating action button for the screen's main action (Material 3),
 * in the platform's shape: square, primary color, gray shadow. */
export function Fab({ icon: Icon, label, onPress }: FabProps) {
  return (
    <View pointerEvents="box-none" className="absolute bottom-4 right-4">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-14 flex-row items-center gap-3 bg-primary px-5 shadow-lg shadow-black/20 active:bg-primary/90">
        <Icon size={22} className="text-primary-foreground" />
        <Text className="font-semibold text-primary-foreground">{label}</Text>
      </Pressable>
    </View>
  );
}
