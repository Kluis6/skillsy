import type { Post } from '@skillsy/shared/types';
import { Image } from 'expo-image';
import { Newspaper, UserSearch } from '@/lib/icons';
import { Pressable, View } from 'react-native';

import { PostCategoryBadge } from '@/components/post-category-badge';
import { Text } from '@/components/ui/text';

/** An article or job in the home shelf: cover, category and title. */
/** wide: full width in lists; otherwise a fixed-width card for carousels. */
export function PostTile({
  post,
  onPress,
  wide = false,
}: {
  post: Post;
  onPress: () => void;
  wide?: boolean;
}) {
  // UserSearch, not the briefcase: in the app the briefcase means Oportunidades.
  const Icon = post.category === 'job' ? UserSearch : Newspaper;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={post.title}
      style={wide ? { width: '100%' } : { width: 240 }}
      className="border border-border-subtle bg-card shadow-sm shadow-black/5 active:opacity-80">
      {post.coverImageUrl ? (
        <Image
          source={{ uri: post.coverImageUrl }}
          style={{ width: '100%', aspectRatio: 16 / 9 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: '100%', aspectRatio: 16 / 9 }}
          className="items-center justify-center bg-primary/10">
          <Icon size={36} strokeWidth={1.5} className="text-primary" />
        </View>
      )}
      <View className={wide ? 'gap-2 p-4' : 'h-24 gap-2 p-3'}>
        <View className="flex-row">
          <PostCategoryBadge category={post.category} />
        </View>
        <Text className="font-semibold leading-5" numberOfLines={2}>
          {post.title}
        </Text>
      </View>
    </Pressable>
  );
}
