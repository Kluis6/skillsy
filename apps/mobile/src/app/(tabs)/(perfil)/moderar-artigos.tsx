import type { MessageKey } from '@skillsy/shared/i18n/keys';
import type { Post, PostStatus } from '@skillsy/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { PostCategoryBadge } from '@/components/post-category-badge';
import { PostStatusBadge } from '@/components/post-status-badge';
import { Sheet } from '@/components/sheet';
import { useSnackbar } from '@/components/snackbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { Newspaper, ShieldAlert, Star } from '@/lib/icons';
import { getAllPostsForAdmin, reviewPost } from '@/lib/my-posts';
import { getOwnProfile } from '@/lib/providers';
import { useFormat, useT } from '@/lib/i18n';

type Filter = 'all' | PostStatus;
const FILTERS: { value: Filter; label: MessageKey }[] = [
  { value: 'all', label: 'posts.filterAll' },
  { value: 'published', label: 'app.moderate.published' },
  { value: 'pending_review', label: 'posts.statusPendingReview' },
  { value: 'draft', label: 'app.moderate.drafts' },
  { value: 'rejected', label: 'app.moderate.rejected' },
];

/** Admin moderation of articles/jobs, like Painel → Artigos on the site:
 * publish, reject with a reason (takes it down) and feature. */
export default function ModerarArtigosScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const t = useT();
  const format = useFormat();
  const [filter, setFilter] = useState<Filter>('all');
  const [rejecting, setRejecting] = useState<Post | null>(null);
  const [reason, setReason] = useState('');

  const { data: me, isPending: loadingMe } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  const isAdmin = me?.role === 'admin';
  const {
    data: posts,
    isPending,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: getAllPostsForAdmin,
    enabled: isAdmin,
  });

  const review = useMutation({
    mutationFn: (input: Parameters<typeof reviewPost>[1]) => reviewPost(user!.uid, input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setRejecting(null);
      setReason('');
      showSnackbar(
        input.status === 'rejected'
          ? t("app.moderate.rejectedDone")
          : input.isFeatured
            ? t("app.moderate.featuredDone")
            : t("app.moderate.publishedDone")
      );
    },
    onError: () => showSnackbar(t("app.moderate.error")),
  });

  const visible = (posts ?? []).filter((post) => filter === 'all' || post.status === filter);

  if (!loadingMe && !isAdmin) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <AppHeader title={t("app.moderate.title")} back />
        <EmptyState icon={ShieldAlert} title={t("app.moderate.restricted")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <AppHeader title={t("app.moderate.title")} back>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4 py-3">
          {FILTERS.map((item) => (
            <Chip
              key={item.value}
              label={t(item.label)}
              selected={filter === item.value}
              onPress={() => setFilter(item.value)}
            />
          ))}
        </ScrollView>
      </AppHeader>
      {loadingMe || isPending ? (
        <View className="gap-card p-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(post) => post.id!}
          contentContainerClassName="grow gap-card p-4"
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<EmptyState icon={Newspaper} title={t("app.moderate.empty")} />}
          renderItem={({ item }) => (
            <View className="gap-3 border border-border-subtle bg-card p-4 shadow-sm shadow-black/5">
              <View className="flex-row flex-wrap items-center gap-2">
                <PostCategoryBadge category={item.category} />
                <PostStatusBadge status={item.status} />
                {item.isFeatured ? (
                  <Star size={16} className="text-highlight" fill="currentColor" />
                ) : null}
              </View>
              <Text className="font-heading text-lg font-semibold leading-snug">{item.title}</Text>
              <Text className="text-xs text-muted-foreground">
                {item.authorName} · {format.date(item.updatedAt)}
              </Text>
              {item.status === 'rejected' && item.rejectionReason ? (
                <Text className="text-sm text-destructive">{t("app.myPosts.reason", { reason: item.rejectionReason })}</Text>
              ) : null}
              <View className="flex-row flex-wrap gap-2">
                {item.status === 'published' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() =>
                        router.push({ pathname: '/artigo/[slug]', params: { slug: item.slug } })
                      }>
                      <Text>{t("app.moderate.view")}</Text>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={review.isPending}
                      onPress={() =>
                        review.mutate({
                          id: item.id!,
                          status: 'published',
                          isFeatured: !item.isFeatured,
                        })
                      }>
                      <Text>{item.isFeatured ? t("app.moderate.unfeature") : t("app.moderate.feature")}</Text>
                    </Button>
                    <Button size="sm" variant="outline" onPress={() => setRejecting(item)}>
                      <Text className="text-destructive">{t("app.moderate.reject")}</Text>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      disabled={review.isPending}
                      onPress={() =>
                        review.mutate({
                          id: item.id!,
                          status: 'published',
                          isFeatured: Boolean(item.isFeatured),
                        })
                      }>
                      <Text>{t("app.moderate.publish")}</Text>
                    </Button>
                    {item.status !== 'rejected' ? (
                      <Button size="sm" variant="outline" onPress={() => setRejecting(item)}>
                        <Text className="text-destructive">{t("app.moderate.reject")}</Text>
                      </Button>
                    ) : null}
                  </>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Sheet
        visible={Boolean(rejecting)}
        title={t("app.moderate.rejectTitle")}
        onClose={() => setRejecting(null)}>
        <View className="gap-3 px-4 pb-4">
          <Text className="text-sm text-muted-foreground">
            {t("app.moderate.rejectText", { title: rejecting?.title ?? '' })}
          </Text>
          <Textarea
            value={reason}
            onChangeText={setReason}
            placeholder={t("app.moderate.reasonPlaceholder")}
            maxLength={300}
            className="min-h-24"
          />
          <Button
            variant="destructive"
            disabled={!reason.trim() || review.isPending}
            onPress={() =>
              rejecting &&
              review.mutate({
                id: rejecting.id!,
                status: 'rejected',
                rejectionReason: reason.trim(),
                isFeatured: false,
              })
            }>
            <Text>{review.isPending ? t("app.moderate.rejecting") : t("app.moderate.reject")}</Text>
          </Button>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
