import type { LucideIcon } from '@/lib/icons';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Action = { label: string; onPress: () => void };

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  primary?: Action;
  secondary?: Action;
};

/** Centered illustration, title and up to two actions (GetNinjas' "Você ainda
 * não fez nenhum pedido"), using the section's icon as the illustration. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  primary,
  secondary,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6 py-10">
      <View className="size-28 items-center justify-center bg-primary/10">
        <Icon size={52} strokeWidth={1.5} className="text-primary" />
      </View>
      <View className="items-center gap-1">
        <Text className="text-center font-heading text-xl font-semibold">{title}</Text>
        {description ? (
          <Text className="text-center text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      {primary || secondary ? (
        <View className="w-full gap-3 pt-2">
          {primary ? (
            <Button onPress={primary.onPress}>
              <Text>{primary.label}</Text>
            </Button>
          ) : null}
          {secondary ? (
            <Button variant="outline" onPress={secondary.onPress}>
              <Text>{secondary.label}</Text>
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
