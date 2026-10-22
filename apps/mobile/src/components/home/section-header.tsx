import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type SectionHeaderProps = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionHeader({ title, actionLabel = 'Ver todas', onAction }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4">
      <Text className="font-heading text-xl font-semibold">{title}</Text>
      {onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          hitSlop={8}
          className="min-h-12 justify-center px-1 active:opacity-70">
          <Text className="font-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
