import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { ServiceImage } from '@/lib/service-catalog';

type ServiceCardProps = {
  title: string;
  image: ServiceImage;
  onPress: () => void;
  width?: number;
};

/** Photo + service name, for horizontal carousels (GetNinjas' service cards
 * in the platform's shape: square corners, gray shadow). */
export function ServiceCard({ title, image, onPress, width = 168 }: ServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ width }}
      className="border border-border-subtle bg-card shadow-sm shadow-black/5 active:opacity-80">
      <Image source={image} style={{ width, height: width * 0.75 }} contentFit="cover" />
      <View className="h-16 justify-center px-3">
        <Text className="font-semibold leading-5" numberOfLines={2}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

type FeaturedServiceCardProps = {
  title: string;
  description: string;
  image: ServiceImage;
  onPress: () => void;
};

/** Full-width highlight with photo, description and an arrow button. */
export function FeaturedServiceCard({
  title,
  description,
  image,
  onPress,
}: FeaturedServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="mx-4 border border-border-subtle bg-card shadow-sm shadow-black/5 active:opacity-80">
      <Image source={image} style={{ width: '100%', aspectRatio: 16 / 9 }} contentFit="cover" />
      <View className="flex-row items-center gap-4 p-4">
        <View className="flex-1 gap-1">
          <Text className="font-heading text-lg font-semibold">{title}</Text>
          <Text className="text-muted-foreground">{description}</Text>
        </View>
        <View className="size-12 items-center justify-center bg-primary">
          <ArrowRight size={22} className="text-primary-foreground" />
        </View>
      </View>
    </Pressable>
  );
}
