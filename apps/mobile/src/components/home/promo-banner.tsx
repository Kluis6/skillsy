import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ServiceImage } from '@/lib/service-catalog';
import { cn } from '@/lib/utils';

type PromoBannerProps = {
  title: string;
  description: string;
  /** With a label, shows a button; without it, the whole banner is tappable with an arrow. */
  actionLabel?: string;
  onPress: () => void;
  tone?: 'primary' | 'brand';
  image?: ServiceImage;
};

/** Call-to-action banner (GetNinjas' "Acesse agora" / "Seja profissional"),
 * in the platform's colors and square shape. */
export function PromoBanner({
  title,
  description,
  actionLabel,
  onPress,
  tone = 'primary',
  image,
}: PromoBannerProps) {
  const background = tone === 'brand' ? 'bg-brand' : 'bg-primary';
  const content = (
    <View className="flex-row items-center gap-4 p-5">
      <View className="flex-1 gap-1">
        <Text className="font-heading text-xl font-bold text-primary-foreground">{title}</Text>
        <Text className="text-primary-foreground/90">{description}</Text>
        {actionLabel ? (
          <Button variant="secondary" className="mt-3 self-start bg-card" onPress={onPress}>
            <Text className="text-primary">{actionLabel}</Text>
          </Button>
        ) : null}
      </View>
      {actionLabel ? null : (
        <View className="size-12 items-center justify-center bg-primary-foreground/15">
          <ArrowRight size={22} className="text-primary-foreground" />
        </View>
      )}
    </View>
  );

  return (
    <View className={cn('mx-4 overflow-hidden', background)}>
      {image ? (
        <Image source={image} style={{ width: '100%', aspectRatio: 2.4 }} contentFit="cover" />
      ) : null}
      {actionLabel ? (
        content
      ) : (
        <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-90">
          {content}
        </Pressable>
      )}
    </View>
  );
}
