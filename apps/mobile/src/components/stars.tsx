import { Star } from '@/lib/icons';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/utils';

type StarsProps = {
  value: number;
  size?: number;
  /** Makes the stars tappable (48dp each) to pick a score. */
  onChange?: (score: number) => void;
};

export function Stars({ value, size = 16, onChange }: StarsProps) {
  return (
    <View
      className="flex-row"
      accessibilityLabel={onChange ? undefined : `${value} de 5 estrelas`}
      accessibilityRole={onChange ? 'radiogroup' : 'image'}>
      {[1, 2, 3, 4, 5].map((score) => {
        const filled = score <= value;
        const icon = (
          <Star
            size={size}
            className={filled ? 'text-highlight' : 'text-muted-foreground'}
            fill={filled ? 'currentColor' : 'transparent'}
          />
        );
        return onChange ? (
          <Pressable
            key={score}
            onPress={() => onChange(score)}
            accessibilityRole="radio"
            aria-checked={score === value}
            accessibilityLabel={`${score} ${score === 1 ? 'estrela' : 'estrelas'}`}
            className={cn('size-12 items-center justify-center active:bg-accent')}>
            {icon}
          </Pressable>
        ) : (
          <View key={score}>{icon}</View>
        );
      })}
    </View>
  );
}
