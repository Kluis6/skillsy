import {
  formatRating,
  formatRecommendationCount,
  formatReviewCount,
  nameInitial,
  providerRoleLabel,
} from '@skillsy/shared/format';
import { whatsappUrl } from '@skillsy/shared/contact';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Clock, MapPin, MessageCircle, Star, ThumbsUp } from 'lucide-react-native';
import { ActivityIndicator, Linking, ScrollView, useColorScheme, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getPublicProfile } from '@/lib/providers';
import { THEME } from '@/lib/theme';

export default function ProfissionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = THEME[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const { data: provider, isPending } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getPublicProfile(id),
  });

  if (isPending) {
    return <ActivityIndicator className="mt-12" />;
  }
  if (!provider) {
    return (
      <Text className="p-8 text-center text-muted-foreground">
        Este perfil não está disponível.
      </Text>
    );
  }

  const title = provider.companyName || provider.name;
  const reviewCount = provider.reviewCount || 0;
  const recommendationCount = provider.recommendationCount || 0;
  const place = [provider.publicCity, provider.publicState].filter(Boolean).join(' · ');
  const whatsapp = whatsappUrl(provider.whatsapp || '');
  const gallery = (provider.gallery || []).filter((item) => item.url);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-8">
      <Stack.Screen options={{ title }} />
      {provider.bannerURL ? (
        <Image source={{ uri: provider.bannerURL }} style={{ height: 128 }} contentFit="cover" />
      ) : (
        <View className="h-32 bg-primary" />
      )}

      <View className="-mt-12 gap-4 px-4">
        {provider.photoURL ? (
          <Image
            source={{ uri: provider.photoURL }}
            style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: colors.card }}
            contentFit="cover"
          />
        ) : (
          <View className="size-24 items-center justify-center rounded-full border-4 border-card bg-primary">
            <Text className="text-3xl font-bold text-primary-foreground">
              {nameInitial(provider.name)}
            </Text>
          </View>
        )}

        <View className="gap-1">
          <Text className="text-2xl font-bold leading-tight">{title}</Text>
          {provider.companyName ? (
            <Text className="text-sm text-muted-foreground">{provider.name}</Text>
          ) : null}
          <Text className="text-base text-muted-foreground">{providerRoleLabel(provider)}</Text>
        </View>

        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
          {reviewCount > 0 ? (
            <View className="flex-row items-center gap-1">
              <Star size={16} className="text-highlight" fill="currentColor" />
              <Text className="font-semibold">{formatRating(provider.rating)}</Text>
              <Text className="text-muted-foreground">({formatReviewCount(reviewCount)})</Text>
            </View>
          ) : (
            <Text className="text-muted-foreground">Novo na comunidade</Text>
          )}
          {recommendationCount > 0 ? (
            <View className="flex-row items-center gap-1.5">
              <ThumbsUp size={16} className="text-primary" />
              <Text className="font-semibold text-primary">
                {formatRecommendationCount(recommendationCount)}
              </Text>
            </View>
          ) : null}
          {place ? (
            <View className="flex-row items-center gap-1">
              <MapPin size={16} className="text-muted-foreground" />
              <Text className="text-muted-foreground">{place}</Text>
            </View>
          ) : null}
        </View>

        {whatsapp ? (
          <Button size="lg" onPress={() => Linking.openURL(whatsapp)}>
            <MessageCircle size={18} className="text-primary-foreground" />
            <Text>Falar no WhatsApp</Text>
          </Button>
        ) : (
          <Text className="text-sm text-muted-foreground">
            Este profissional ainda não informou um WhatsApp.
          </Text>
        )}

        {provider.bio ? (
          <Section title="Sobre">
            <Text className="leading-6 text-muted-foreground">{provider.bio}</Text>
          </Section>
        ) : null}

        {provider.serviceHours || provider.availability?.length || provider.experienceYears ? (
          <Section title="Atendimento">
            {provider.availability?.length ? (
              <View className="flex-row flex-wrap gap-2">
                {provider.availability.map((day) => (
                  <Badge key={day} variant="secondary">
                    <Text>{day}</Text>
                  </Badge>
                ))}
              </View>
            ) : null}
            {provider.serviceHours ? (
              <View className="flex-row items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <Text className="text-muted-foreground">{provider.serviceHours}</Text>
              </View>
            ) : null}
            {provider.experienceYears ? (
              <Text className="text-muted-foreground">
                {provider.experienceYears}{' '}
                {Number(provider.experienceYears) === 1 ? 'ano' : 'anos'} de experiência
              </Text>
            ) : null}
          </Section>
        ) : null}

        {gallery.length ? (
          <Section title="Galeria">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
              {gallery.map((item, index) => (
                <View key={`${index}-${item.url.slice(-12)}`} className="w-44 gap-1">
                  <Image source={{ uri: item.url }} style={{ width: 176, height: 132 }} contentFit="cover" />
                  {item.description ? (
                    <Text className="text-xs text-muted-foreground" numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </Section>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3 border border-border-subtle bg-card p-4">
      <Text className="text-lg font-bold">{title}</Text>
      {children}
    </View>
  );
}
