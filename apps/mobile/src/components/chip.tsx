import { Check, ChevronDown } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type ChipProps = {
  label: string;
  selected?: boolean;
  /** Shows a chevron: the chip opens a list of options. */
  menu?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  className?: string;
};

/** Material 3 filter chip in the platform's shape (square corners). 40px tall
 * with hitSlop for a 48dp touch target. */
export function Chip({
  label,
  selected = false,
  menu = false,
  onPress,
  accessibilityLabel,
  className,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      aria-selected={selected}
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn(
        'h-10 flex-row items-center gap-1.5 border px-3',
        selected
          ? 'border-primary bg-primary/10 active:bg-primary/20'
          : 'border-border bg-card active:bg-accent',
        className
      )}>
      {selected ? <Check size={16} className="text-primary" /> : null}
      <Text
        numberOfLines={1}
        className={cn(
          'shrink text-sm font-medium',
          menu && 'flex-1',
          selected ? 'text-primary' : 'text-foreground'
        )}>
        {label}
      </Text>
      {menu ? (
        <ChevronDown size={16} className={selected ? 'text-primary' : 'text-muted-foreground'} />
      ) : null}
    </Pressable>
  );
}
