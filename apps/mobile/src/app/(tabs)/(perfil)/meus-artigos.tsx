import { formatFirestoreDate } from '@skillsy/shared/opportunities';
import type { Post } from '@skillsy/shared/types';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { Fab } from '@/components/fab';
import { PostCategoryBadge } from '@/components/post-category-badge';
import { PostStatusBadge } from '@/components/post-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { Newspaper, PenLine, ShieldCheck } from '@/lib/icons';
import { getMyPosts } from '@/lib/my-posts';
import { getOwnProfile } from '@/lib/providers';

/** The member's own articles and jobs, any status, newest change first. */
export default function MeusArtigosScreen() {
  const { user } = useAuth();
  const { data: me, isPending: loadingMe } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  const {
    data: posts,
    isPending,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['my-posts', user?.uid],
    queryFn: () => getMyPosts(user!.uid),
    enabled: Boolean(user),
  });
  // firestore.rules (isVerifiedMember): only verified members write posts.
  const verified = me?.memberVerified === true;
  const write = () => router.push('/publicacao/editar');

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader title="Meus artigos e vagas" back />
      {loadingMe || isPending ? (
        <View className="gap-card p-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </View>
      ) : !verified && !posts?.length ? (
        <EmptyState
          icon={ShieldCheck}
          title="Publicação para membros verificados"
          description="Informe sua ala e o ano de batismo em Editar perfil para escrever artigos e divulgar vagas."
          primary={{ label: 'Editar perfil', onPress: () => router.push('/editar-perfil') }}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id!}
          contentContainerClassName="grow gap-card p-4 pb-24"
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => <MyPostCard post={item} />}
          ListEmptyComponent={
            <EmptyState
              icon={Newspaper}
              title="Nenhuma publicação ainda"
              description="Escreva um artigo para a comunidade ou divulgue uma vaga."
              primary={{ label: 'Escrever', onPress: write }}
            />
          }
        />
      )}
      {verified && posts?.length ? <Fab icon={PenLine} label="Escrever" onPress={write} /> : null}
    </SafeAreaView>
  );
}

function MyPostCard({ post }: { post: Post }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/publicacao/editar', params: { id: post.id! } })}
      accessibilityRole="button"
      accessibilityHint="Abre para editar"
      className="gap-2 border border-border-subtle bg-card p-4 shadow-sm shadow-black/5 active:bg-accent">
      <View className="flex-row flex-wrap gap-2">
        <PostCategoryBadge category={post.category} />
        <PostStatusBadge status={post.status} />
        {post.isFeatured ? (
          <Text className="text-xs font-medium text-primary">Destaque</Text>
        ) : null}
      </View>
      <Text className="font-heading text-lg font-semibold leading-snug" numberOfLines={2}>
        {post.title}
      </Text>
      <Text className="text-xs text-muted-foreground">
        Atualizado em {formatFirestoreDate(post.updatedAt)}
      </Text>
      {post.status === 'rejected' && post.rejectionReason ? (
        <Text className="text-sm text-destructive">Motivo: {post.rejectionReason}</Text>
      ) : null}
    </Pressable>
  );
}
