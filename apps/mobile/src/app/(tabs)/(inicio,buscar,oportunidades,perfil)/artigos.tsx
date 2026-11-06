import { byOrigin } from '@skillsy/shared/i18n/origin';
import type { Post } from '@skillsy/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Newspaper } from '@/lib/icons';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { PostTile } from '@/components/home/post-tile';
import { TopTabs } from '@/components/top-tabs';
import { getPublishedPosts } from '@/lib/posts';
import { useLocale, useT } from '@/lib/i18n';

type Filter = 'all' | 'article' | 'job';
const TABS = [
  { value: 'all', label: 'posts.filterAll' },
  { value: 'article', label: 'posts.filterArticles' },
  { value: 'job', label: 'posts.filterJobs' },
] as const;

/** Novidades e vagas: every published article and job, like /artigosevagas. */
export default function ArtigosScreen() {
  const queryClient = useQueryClient();
  const t = useT();
  const { locale } = useLocale();
  const [filter, setFilter] = useState<Filter>('all');
  // The visitor's country only, in the app's language first (same as the site).
  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ['posts'],
    queryFn: getPublishedPosts,
    select: (posts) => byOrigin(posts, { language: locale }),
  });
  const posts = (data ?? []).filter((post) => filter === 'all' || post.category === filter);
  const open = (post: Post) => {
    queryClient.setQueryData(['post', post.slug], post);
    router.push({ pathname: '/artigo/[slug]', params: { slug: post.slug } });
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader title={t("app.posts.title")} back>
        <TopTabs
          tabs={TABS.map((item) => ({ value: item.value, label: t(item.label) }))}
          value={filter}
          onChange={setFilter}
        />
      </AppHeader>
      <FlatList
        data={isPending ? [] : posts}
        keyExtractor={(post) => post.id ?? post.slug}
        numColumns={1}
        renderItem={({ item }) => (
          <View className="items-center">
            <PostTile post={item} onPress={() => open(item)} wide />
          </View>
        )}
        contentContainerClassName="gap-card p-4"
        contentContainerStyle={posts.length ? undefined : { flexGrow: 1 }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isPending ? undefined : (
            <EmptyState
              icon={Newspaper}
              title={filter === 'job' ? t("app.posts.noJobs") : t("app.posts.empty")}
              description={t("app.posts.emptyText")}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
