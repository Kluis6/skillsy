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

type Filter = 'all' | 'article' | 'job';
const TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'article', label: 'Artigos' },
  { value: 'job', label: 'Vagas' },
] as const;

/** Novidades e vagas: every published article and job, like /artigosevagas. */
export default function ArtigosScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ['posts'],
    queryFn: getPublishedPosts,
  });
  const posts = (data ?? []).filter((post) => filter === 'all' || post.category === filter);
  const open = (post: Post) => {
    queryClient.setQueryData(['post', post.slug], post);
    router.push({ pathname: '/artigo/[slug]', params: { slug: post.slug } });
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader title="Novidades e vagas" back>
        <TopTabs tabs={TABS} value={filter} onChange={setFilter} />
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
        contentContainerClassName="gap-3 p-4"
        contentContainerStyle={posts.length ? undefined : { flexGrow: 1 }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isPending ? undefined : (
            <EmptyState
              icon={Newspaper}
              title={filter === 'job' ? 'Nenhuma vaga aberta' : 'Nada publicado ainda'}
              description="Artigos e vagas da comunidade aparecem aqui assim que são publicados."
            />
          )
        }
      />
    </SafeAreaView>
  );
}
