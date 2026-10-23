import {
  formatRating,
  formatRecommendationCount,
  formatReviewCount,
  nameInitial,
  providerRoleLabel,
} from '@skillsy/shared/format';
import { whatsappUrl } from '@skillsy/shared/contact';
import type { UserProfile } from '@skillsy/shared/types';
import { Image } from 'expo-image';
import { MapPin, Star, ThumbsUp } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { WhatsAppButton } from '@/components/whatsapp-button';

type ProviderCardProps = { provider: UserProfile; onPress?: () => void };

export function ProviderCard({ provider, onPress }: ProviderCardProps) {
  const reviewCount = provider.reviewCount || 0;
  const recommendationCount = provider.recommendationCount || 0;
  const place = [provider.publicCity, provider.publicState].filter(Boolean).join(' · ');
  const whatsapp = whatsappUrl(provider.whatsapp || '');

  return (
    <View className="border border-border-subtle bg-card shadow-sm shadow-black/5">
      {/* Only this part opens the profile, so the WhatsApp button below is
          not nested inside another button (invalid on the web). */}
      <Pressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityHint="Abre o perfil completo"
        className="gap-3 p-4 active:bg-accent">
        <View className="flex-row items-center gap-3">
          {provider.photoURL ? (
            <Image
              source={{ uri: provider.photoURL }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="size-12 items-center justify-center rounded-full bg-primary">
              <Text className="text-base font-bold text-primary-foreground">
                {nameInitial(provider.name)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-bold leading-tight" numberOfLines={1}>
              {provider.companyName || provider.name}
            </Text>
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              {providerRoleLabel(provider)}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
          {reviewCount > 0 ? (
            <View className="flex-row items-center gap-1">
              <Star size={14} className="text-highlight" fill="currentColor" />
              <Text className="text-sm font-semibold">{formatRating(provider.rating)}</Text>
              <Text className="text-sm text-muted-foreground">
                ({formatReviewCount(reviewCount)})
              </Text>
            </View>
          ) : null}
          {recommendationCount > 0 ? (
            <View className="flex-row items-center gap-1.5">
              <ThumbsUp size={14} className="text-primary" />
              <Text className="text-sm font-semibold text-primary">
                {formatRecommendationCount(recommendationCount)}
              </Text>
            </View>
          ) : null}
          {reviewCount === 0 && recommendationCount === 0 ? (
            <Text className="text-sm text-muted-foreground">Novo na comunidade</Text>
          ) : null}
          {place ? (
            <View className="flex-row items-center gap-1">
              <MapPin size={14} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">{place}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {whatsapp ? (
        <View className="px-4 pb-4">
          <WhatsAppButton url={whatsapp} />
        </View>
      ) : null}
    </View>
  );
}

export function ProviderCardSkeleton() {
  return (
    <View className="gap-3 border border-border-subtle bg-card p-4">
      <View className="flex-row items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </View>
      </View>
      <Skeleton className="h-3 w-1/2" />
    </View>
  );
}
