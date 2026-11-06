import { getPostExcerpt } from '@skillsy/shared/post-utils';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Share2 } from '@/lib/icons';
import { ActivityIndicator, ScrollView, Share, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { PostCategoryBadge } from '@/components/post-category-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getPublishedPostBySlug } from '@/lib/posts';
import { LanguageBadge } from '@/components/language-badge';
import { siteUrl } from '@/lib/site';
import { useFormat, useT } from '@/lib/i18n';

/** An article or job, like /artigosevagas/[slug] on the site (plain text). */
export default function ArtigoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const t = useT();
  const format = useFormat();
  const { data: post, isPending } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPublishedPostBySlug(slug),
  });

  const title = post?.category === 'job' ? t('posts.categoryJob') : t('posts.categoryArticle');
  if (isPending || !post) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader title={title} back />
        {isPending ? (
          <ActivityIndicator className="mt-12" />
        ) : (
          <Text className="p-8 text-center text-muted-foreground">
            {t("app.post.unavailable")}
          </Text>
        )}
      </View>
    );
  }

  const share = () =>
    Share.share({ message: `${post.title} — ${siteUrl(`/artigosevagas/${post.slug}`)}` });

  return (
    <View className="flex-1 bg-background">
      <AppHeader title={title} back />
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {post.coverImageUrl ? (
          <Image
            source={{ uri: post.coverImageUrl }}
            style={{ width: '100%', aspectRatio: 16 / 9 }}
            contentFit="cover"
          />
        ) : null}
        <View className="gap-4 bg-card p-4">
          <View className="flex-row flex-wrap items-center gap-2">
            <PostCategoryBadge category={post.category} />
            <LanguageBadge item={post} />
            {post.isFeatured ? (
              <Badge variant="outline" className="border-primary/10 bg-primary/10">
                <Text className="text-primary">{t('posts.featured')}</Text>
              </Badge>
            ) : null}
          </View>
          <Text className="font-heading text-2xl font-bold leading-tight">{post.title}</Text>
          <Text className="text-sm text-muted-foreground">
            {t("app.post.by")} <Text className="text-sm font-semibold">{post.authorName}</Text>
            {post.publishedAt ? ` · ${format.date(post.publishedAt)}` : ''}
          </Text>
          <Text className="text-lg leading-7 text-muted-foreground">{getPostExcerpt(post)}</Text>
          {/* Same tonal blue as Compartilhar on the profile (ActionButton). */}
          <Button variant="ghost" className="bg-primary/10 active:bg-primary/20" onPress={share}>
            <Share2 size={18} className="text-primary" />
            <Text className="text-primary">{t('posts.share')}</Text>
          </Button>
        </View>
        <View className="p-4">
          {post.content.trim() ? (
            <Text className="text-base leading-7">{post.content}</Text>
          ) : (
            <Text className="text-base leading-7 text-muted-foreground">
              {t('posts.noText')}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
