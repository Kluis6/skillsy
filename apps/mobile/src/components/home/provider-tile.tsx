import { nameInitial, providerRoleLabel } from '@skillsy/shared/format';
import type { UserProfile } from '@skillsy/shared/types';
import { Image } from 'expo-image';
import { ThumbsUp } from '@/lib/icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

const WIDTH = 168;

/** A real professional in the home carousel: cover (or photo), name, trade. */
export function ProviderTile({
  provider,
  onPress,
}: {
  provider: UserProfile;
  onPress: () => void;
}) {
  // Cover first, then the photo, then the initial if both fail to load.
  const sources = [provider.bannerURL, provider.photoURL].filter(Boolean) as string[];
  const [failed, setFailed] = useState(0);
  const image = sources[failed];
  const recommendations = provider.recommendationCount || 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={provider.companyName || provider.name}
      style={{ width: WIDTH }}
      className="border border-border-subtle bg-card shadow-sm shadow-black/5 active:opacity-80">
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: WIDTH, height: WIDTH * 0.75 }}
          contentFit="cover"
          onError={() => setFailed((count) => count + 1)}
        />
      ) : (
        <View
          style={{ width: WIDTH, height: WIDTH * 0.75 }}
          className="items-center justify-center bg-primary">
          <Text className="font-heading text-4xl font-bold text-primary-foreground">
            {nameInitial(provider.name)}
          </Text>
        </View>
      )}
      <View className="h-20 justify-center gap-0.5 px-3">
        <Text className="font-semibold leading-5" numberOfLines={1}>
          {provider.companyName || provider.name}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {providerRoleLabel(provider)}
        </Text>
        {recommendations > 0 ? (
          <View className="flex-row items-center gap-1">
            <ThumbsUp size={12} className="text-primary" />
            <Text className="text-xs font-semibold text-primary">{recommendations}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
