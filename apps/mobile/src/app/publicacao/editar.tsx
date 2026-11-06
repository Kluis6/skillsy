import {
  normalizePostTags,
  POST_CATEGORY_OPTIONS,
  slugifyPostTitle,
} from '@skillsy/shared/post-utils';
import type { Post } from '@skillsy/shared/types';
import { postEditorSchema } from '@skillsy/shared/validations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, HeaderAction } from '@/components/app-header';
import { Chip } from '@/components/chip';
import { PostStatusBadge } from '@/components/post-status-badge';
import { Sheet } from '@/components/sheet';
import { useSnackbar } from '@/components/snackbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { Camera, ImagePlus, Trash2 } from '@/lib/icons';
import { pickImage, uploadImage } from '@/lib/image-upload';
import { deleteOwnPost, getPost, publishOwnPost, savePost, type PostInput } from '@/lib/my-posts';
import { getOwnProfile } from '@/lib/providers';
import { useLocale, useT, useValidationMessage } from '@/lib/i18n';

type Values = Omit<PostInput, 'tags'> & { tags: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = {
  category: 'article',
  title: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  tags: '',
};

/** Write or edit an article/job: save as draft, publish or delete. Opened
 * without `id` for a new post. */
export default function EditarPublicacaoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = useT();
  const { data: post, isPending } = useQuery({
    queryKey: ['post-edit', id],
    queryFn: () => getPost(id!),
    enabled: Boolean(id),
  });

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      {id && isPending ? (
        <>
          <AppHeader title={t("app.postEditor.editTitle")} back />
          <ActivityIndicator className="mt-10" />
        </>
      ) : (
        <PostForm key={post?.id ?? 'new'} post={post ?? undefined} />
      )}
    </SafeAreaView>
  );
}

function PostForm({ post }: { post?: Post }) {
  const { user } = useAuth();
  const t = useT();
  const tv = useValidationMessage();
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const [values, setValues] = useState<Values>(
    post
      ? {
          category: post.category,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? '',
          tags: (post.tags ?? []).join(', '),
          language: post.language ?? 'pt',
        }
      : { ...EMPTY, language: locale }
  );
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (patch: Partial<Values>) => {
    setValues((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key as keyof Values];
      return next;
    });
  };

  const { data: me } = useQuery({
    queryKey: ['me', user?.uid],
    queryFn: () => getOwnProfile(user!.uid),
    enabled: Boolean(user),
  });
  const published = post?.status === 'published';

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['my-posts'] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['post'] });
    queryClient.invalidateQueries({ queryKey: ['post-edit'] });
    queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
  };

  // Same checks as the site's editor (postEditorSchema), slug from the title.
  const validate = () => {
    const result = postEditorSchema.safeParse({
      ...values,
      slug: slugifyPostTitle(values.title),
    });
    if (result.success) return true;
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const field = (issue.path[0] === 'slug' ? 'title' : issue.path[0]) as keyof Values;
      next[field] ??= tv(issue.message);
    }
    setErrors(next);
    showSnackbar(t("app.postEditor.reviewFields"));
    return false;
  };

  const save = useMutation({
    mutationFn: async (andPublish: boolean) => {
      const input: PostInput = { ...values, tags: normalizePostTags(values.tags) };
      const id = await savePost(user!, me?.name ?? '', input, post);
      if (andPublish) {
        const saved = await getPost(id);
        if (saved) await publishOwnPost(user!, saved);
      }
      return andPublish;
    },
    onSuccess: (andPublish) => {
      refresh();
      showSnackbar(
                published
          ? t("app.postEditor.updated")
          : andPublish
            ? t("app.postEditor.published")
            : t("app.postEditor.draftSaved")
      );
      if (router.canGoBack()) router.back();
    },
    onError: (error) => {
      console.error('Falha ao salvar a publicação:', error);
      showSnackbar(t("app.postEditor.saveError"));
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteOwnPost(post!.id!),
    onSuccess: () => {
      setConfirmDelete(false);
      refresh();
      showSnackbar(t("app.postEditor.deleted"));
      if (router.canGoBack()) router.back();
    },
    onError: () => showSnackbar(t("app.postEditor.deleteError")),
  });

  const submit = (andPublish: boolean) => {
    if (validate()) save.mutate(andPublish);
  };

  const changeCover = async () => {
    const asset = await pickImage('posts');
    if (!asset) return;
    setUploading(true);
    try {
      update({ coverImageUrl: await uploadImage(asset, 'posts') });
    } catch {
      showSnackbar(t("app.postEditor.uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const busy = save.isPending || uploading;

  return (
    <>
      <AppHeader
        title={post ? t("app.postEditor.editTitle") : t("app.postEditor.newTitle")}
        back
        actions={
          post ? (
            <HeaderAction
              icon={Trash2}
              label={t("app.postEditor.deleteAria")}
              onPress={() => setConfirmDelete(true)}
            />
          ) : null
        }
      />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerClassName="gap-card p-4 pb-8"
          keyboardShouldPersistTaps="handled">
          {post ? (
            <View className="flex-row items-center gap-2">
              <PostStatusBadge status={post.status} />
              {post.status === 'rejected' && post.rejectionReason ? (
                <Text className="flex-1 text-sm text-destructive">{post.rejectionReason}</Text>
              ) : null}
            </View>
          ) : null}

          <Section title={t("app.postEditor.type")}>
            <View className="flex-row gap-2">
              {POST_CATEGORY_OPTIONS.map((category) => (
                <Chip
                  key={category}
                  label={category === 'job' ? t('posts.categoryJob') : t('posts.categoryArticle')}
                  selected={values.category === category}
                  onPress={() => update({ category })}
                />
              ))}
            </View>
          </Section>

          <Section title={t("app.postEditor.cover")}>
            <Pressable
              onPress={changeCover}
              disabled={uploading}
              accessibilityRole="button"
              accessibilityLabel={values.coverImageUrl ? t("app.postEditor.changeCover") : t("app.postEditor.addCover")}
              className="overflow-hidden active:opacity-80">
              {values.coverImageUrl ? (
                <Image
                  source={{ uri: values.coverImageUrl }}
                  style={{ width: '100%', aspectRatio: 16 / 9 }}
                  contentFit="cover"
                />
              ) : (
                <View className="aspect-video w-full items-center justify-center gap-2 border border-dashed border-border bg-muted">
                  <ImagePlus size={28} className="text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">{t("app.postEditor.addCoverImage")}</Text>
                </View>
              )}
              {uploading || values.coverImageUrl ? (
                <View className="absolute bottom-2 right-2 flex-row items-center gap-1.5 bg-black/60 px-3 py-1.5">
                  <Camera size={14} className="text-white" />
                  <Text className="text-xs font-medium text-white">
                    {uploading ? t("app.postEditor.uploading") : t("app.postEditor.changeCover")}
                  </Text>
                </View>
              ) : null}
            </Pressable>
            {values.coverImageUrl ? (
              <Button variant="ghost" onPress={() => update({ coverImageUrl: '' })}>
                <Text className="text-destructive">{t("app.postEditor.removeCover")}</Text>
              </Button>
            ) : null}
          </Section>

          <Section title={t("app.postEditor.text")}>
            <Field label={t("app.postEditor.titleLabel")} error={errors.title}>
              <Input
                value={values.title}
                onChangeText={(title) => update({ title })}
                placeholder={
                  values.category === 'job'
                    ? t("app.postEditor.jobTitlePlaceholder")
                    : t("app.postEditor.articleTitlePlaceholder")
                }
                maxLength={120}
              />
            </Field>
            <Field
              label={t("app.postEditor.excerpt")}
              hint={t("app.postEditor.excerptHint")}
              error={errors.excerpt}>
              <Textarea
                value={values.excerpt}
                onChangeText={(excerpt) => update({ excerpt })}
                maxLength={240}
                className="min-h-20"
              />
            </Field>
            <Field
              label={t("app.postEditor.content")}
              hint={
                values.category === 'job'
                  ? t("app.postEditor.jobContentHint")
                  : t("app.postEditor.articleContentHint")
              }
              error={errors.content}>
              <Textarea
                value={values.content}
                onChangeText={(content) => update({ content })}
                maxLength={20000}
                className="min-h-48"
                textAlignVertical="top"
              />
            </Field>
            <Field label={t("app.postEditor.tags")} hint={t("app.postEditor.tagsHint")} error={errors.tags}>
              <Input
                value={values.tags}
                onChangeText={(tags) => update({ tags })}
                placeholder={t("app.postEditor.tagsPlaceholder")}
                maxLength={120}
                autoCapitalize="none"
              />
            </Field>
          </Section>

          {published ? (
            <Button onPress={() => submit(false)} disabled={busy}>
              <Text>{save.isPending ? t("app.postEditor.saving") : t("app.postEditor.saveChanges")}</Text>
            </Button>
          ) : (
            <View className="gap-3">
              <Button onPress={() => submit(true)} disabled={busy}>
                <Text>{save.isPending ? t("app.postEditor.saving") : t("app.postEditor.publish")}</Text>
              </Button>
              <Button variant="outline" onPress={() => submit(false)} disabled={busy}>
                <Text>{t("app.postEditor.saveDraft")}</Text>
              </Button>
              <Text className="text-center text-xs text-muted-foreground">
                {t("app.postEditor.publishNotice")}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Sheet
        visible={confirmDelete}
        title={t("app.postEditor.confirmTitle")}
        onClose={() => setConfirmDelete(false)}>
        <View className="gap-3 px-4 pb-4">
          <Text className="text-muted-foreground">
            {t("app.postEditor.confirmText", { title: post?.title ?? '' })}
          </Text>
          <Button variant="destructive" onPress={() => remove.mutate()} disabled={remove.isPending}>
            <Text>{remove.isPending ? t("app.postEditor.deleting") : t("app.postEditor.delete")}</Text>
          </Button>
          <Button variant="outline" onPress={() => setConfirmDelete(false)}>
            <Text>{t("app.postEditor.cancel")}</Text>
          </Button>
        </View>
      </Sheet>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4 border border-border-subtle bg-card p-4">
      <Text className="font-heading text-lg font-semibold">{title}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
}
