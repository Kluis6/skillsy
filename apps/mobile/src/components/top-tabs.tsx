import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type TopTabsProps<T extends string> = {
  tabs: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Material 3 primary tabs: equal-width labels with an underline indicator. */
export function TopTabs<T extends string>({ tabs, value, onChange }: TopTabsProps<T>) {
  return (
    <View className="flex-row" accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            accessibilityRole="tab"
            aria-selected={selected}
            className="h-12 flex-1 items-center justify-end active:bg-accent">
            <Text
              className={cn(
                'pb-3 text-sm font-semibold',
                selected ? 'text-primary' : 'text-muted-foreground'
              )}>
              {tab.label}
            </Text>
            <View className={cn('h-0.5 w-full', selected ? 'bg-primary' : 'bg-transparent')} />
          </Pressable>
        );
      })}
    </View>
  );
}
