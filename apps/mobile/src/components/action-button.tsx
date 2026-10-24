import type { LucideIcon } from '@/lib/icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type ActionButtonProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** Icon-over-label action, like the action row on a Google Maps place:
 * square tonal container (filled when active), 48dp+ touch target. */
export function ActionButton({ icon: Icon, label, active, disabled, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      aria-selected={Boolean(active)}
      aria-disabled={Boolean(disabled)}
      // A done action (e.g. "Avaliado") stays solid; only unavailable ones fade.
      className={cn(
        'flex-1 items-center gap-1.5 py-1 active:bg-accent',
        disabled && !active && 'opacity-50'
      )}>
      <View
        className={cn(
          'size-12 items-center justify-center',
          active ? 'bg-primary' : 'bg-primary/10'
        )}>
        <Icon size={22} className={active ? 'text-primary-foreground' : 'text-primary'} />
      </View>
      <Text className={cn('text-xs font-medium', active && 'text-primary')}>{label}</Text>
    </Pressable>
  );
}
