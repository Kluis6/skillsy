import {
  normalizePostTags,
  POST_CATEGORY_LABELS,
  slugifyPostTitle,
} from '@skillsy/shared/post-utils';
import type { Post, PostCategory } from '@skillsy/shared/types';
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
  const { data: post, isPending } = useQuery({
    queryKey: ['post-edit', id],
    queryFn: () => getPost(id!),
    enabled: Boolean(id),
  });

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      {id && isPending ? (
        <>
          <AppHeader title="Editar publicação" back />
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
        }
      : EMPTY
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
      next[field] ??= issue.message;
    }
    setErrors(next);
    showSnackbar('Revise os campos destacados.');
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
          ? 'Publicação atualizada.'
          : andPublish
            ? 'Publicado no site e no app.'
            : 'Rascunho salvo.'
      );
      if (router.canGoBack()) router.back();
    },
    onError: (error) => {
      console.error('Falha ao salvar a publicação:', error);
      showSnackbar('Não foi possível salvar. Confira se seu perfil está verificado.');
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteOwnPost(post!.id!),
    onSuccess: () => {
      setConfirmDelete(false);
      refresh();
      showSnackbar('Publicação excluída.');
      if (router.canGoBack()) router.back();
    },
    onError: () => showSnackbar('Não foi possível excluir. Tente de novo.'),
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
      showSnackbar('Não foi possível enviar a imagem. Tente outra foto.');
    } finally {
      setUploading(false);
    }
  };

  const busy = save.isPending || uploading;

  return (
    <>
      <AppHeader
        title={post ? 'Editar publicação' : 'Nova publicação'}
        back
        actions={
          post ? (
            <HeaderAction
              icon={Trash2}
              label="Excluir publicação"
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

          <Section title="Tipo">
            <View className="flex-row gap-2">
              {(Object.keys(POST_CATEGORY_LABELS) as PostCategory[]).map((category) => (
                <Chip
                  key={category}
                  label={POST_CATEGORY_LABELS[category]}
                  selected={values.category === category}
                  onPress={() => update({ category })}
                />
              ))}
            </View>
          </Section>

          <Section title="Capa">
            <Pressable
              onPress={changeCover}
              disabled={uploading}
              accessibilityRole="button"
              accessibilityLabel={values.coverImageUrl ? 'Trocar capa' : 'Adicionar capa'}
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
                  <Text className="text-sm text-muted-foreground">Adicionar imagem de capa</Text>
                </View>
              )}
              {uploading || values.coverImageUrl ? (
                <View className="absolute bottom-2 right-2 flex-row items-center gap-1.5 bg-black/60 px-3 py-1.5">
                  <Camera size={14} className="text-white" />
                  <Text className="text-xs font-medium text-white">
                    {uploading ? 'Enviando…' : 'Trocar capa'}
                  </Text>
                </View>
              ) : null}
            </Pressable>
            {values.coverImageUrl ? (
              <Button variant="ghost" onPress={() => update({ coverImageUrl: '' })}>
                <Text className="text-destructive">Remover capa</Text>
              </Button>
            ) : null}
          </Section>

          <Section title="Texto">
            <Field label="Título" error={errors.title}>
              <Input
                value={values.title}
                onChangeText={(title) => update({ title })}
                placeholder={
                  values.category === 'job'
                    ? 'Ex.: Vaga de auxiliar administrativo'
                    : 'Título do artigo'
                }
                maxLength={120}
              />
            </Field>
            <Field
              label="Resumo (opcional)"
              hint="Aparece nos cards. Sem resumo, usamos o começo do texto."
              error={errors.excerpt}>
              <Textarea
                value={values.excerpt}
                onChangeText={(excerpt) => update({ excerpt })}
                maxLength={240}
                className="min-h-20"
              />
            </Field>
            <Field
              label="Conteúdo"
              hint={
                values.category === 'job'
                  ? 'Requisitos, local, como se candidatar.'
                  : 'Pelo menos 40 caracteres, ou só a imagem de capa.'
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
            <Field label="Tags (opcional)" hint="Até 5, separadas por vírgula." error={errors.tags}>
              <Input
                value={values.tags}
                onChangeText={(tags) => update({ tags })}
                placeholder="serviços, comunidade"
                maxLength={120}
                autoCapitalize="none"
              />
            </Field>
          </Section>

          {published ? (
            <Button onPress={() => submit(false)} disabled={busy}>
              <Text>{save.isPending ? 'Salvando…' : 'Salvar alterações'}</Text>
            </Button>
          ) : (
            <View className="gap-3">
              <Button onPress={() => submit(true)} disabled={busy}>
                <Text>{save.isPending ? 'Salvando…' : 'Publicar'}</Text>
              </Button>
              <Button variant="outline" onPress={() => submit(false)} disabled={busy}>
                <Text>Salvar rascunho</Text>
              </Button>
              <Text className="text-center text-xs text-muted-foreground">
                Ao publicar, todos os membros recebem um aviso.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Sheet
        visible={confirmDelete}
        title="Excluir publicação?"
        onClose={() => setConfirmDelete(false)}>
        <View className="gap-3 px-4 pb-4">
          <Text className="text-muted-foreground">
            “{post?.title}” sai do site e do app. Não dá para desfazer.
          </Text>
          <Button variant="destructive" onPress={() => remove.mutate()} disabled={remove.isPending}>
            <Text>{remove.isPending ? 'Excluindo…' : 'Excluir'}</Text>
          </Button>
          <Button variant="outline" onPress={() => setConfirmDelete(false)}>
            <Text>Cancelar</Text>
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
