import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useT } from '@/lib/i18n';

type SectionHeaderProps = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const t = useT();
  actionLabel ??= t('home.seeAll');
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
