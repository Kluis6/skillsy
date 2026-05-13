"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { postEditorSchema, type PostEditorFormData } from "@/lib/validations";
import { normalizePostTags, slugifyPostTitle } from "@/lib/post-utils";
import { Post } from "@/models/types";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

type PostEditorClientProps = {
  mode: "create" | "edit";
  initialPost?: Post | null;
};

export function PostEditorClient({
  mode,
  initialPost,
}: PostEditorClientProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmittingForReview, startSubmitForReview] = useTransition();
  const [autoSlugEdited, setAutoSlugEdited] = useState(Boolean(initialPost));

  const form = useForm<PostEditorFormData>({
    resolver: zodResolver(postEditorSchema),
    mode: "onBlur",
    defaultValues: {
      title: initialPost?.title || "",
      slug: initialPost?.slug || "",
      excerpt: initialPost?.excerpt || "",
      content: initialPost?.content || "",
      coverImageUrl: initialPost?.coverImageUrl || "",
      tags: initialPost?.tags?.join(", ") || "",
    },
  });

  const titleValue = useWatch({ control: form.control, name: "title" }) || "";
  const contentValue = useWatch({ control: form.control, name: "content" }) || "";
  const excerptValue = useWatch({ control: form.control, name: "excerpt" }) || "";

  useEffect(() => {
    if (!autoSlugEdited) {
      form.setValue("slug", slugifyPostTitle(titleValue), {
        shouldValidate: true,
      });
    }
  }, [autoSlugEdited, titleValue, form]);

  const onSubmit = async (data: PostEditorFormData) => {
    if (!user) {
      toast.error("Login necessário");
      return;
    }

    try {
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        excerpt: data.excerpt.trim(),
        content: data.content.trim(),
        coverImageUrl: data.coverImageUrl.trim(),
        tags: normalizePostTags(data.tags),
      };

      if (mode === "create") {
        const id = await PostService.createDraft(payload);
        toast.success("Rascunho criado com sucesso.");
        router.push(`/meus-artigos/${id}/editar`);
        return;
      }

      if (!initialPost?.id) return;

      await PostService.updateOwnPost(initialPost.id, payload);
      toast.success("Rascunho atualizado.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível salvar o artigo.");
    }
  };

  const handleSubmitForReview = () => {
    if (!initialPost?.id) return;

    startSubmitForReview(async () => {
      try {
        await PostService.submitForReview(initialPost.id);
        toast.success("Artigo enviado para revisão.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível enviar para revisão.");
      }
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-border-subtle bg-white p-10 text-center">
        <h1 className="text-2xl font-bold text-text-main">Acesso restrito</h1>
        <p className="mt-2 text-text-muted">
          Faça login para escrever e gerenciar seus artigos.
        </p>
        <Link href="/" className="mt-6 inline-flex text-sm font-bold text-primary hover:underline">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-blue-100 bg-blue-50/80 p-5 text-sm text-slate-700">
        Título até 120 caracteres, resumo até 240, conteúdo entre 100 e 20000
        caracteres e até 5 tags separadas por vírgula.
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-border-subtle bg-white p-6 md:p-8">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            maxLength={120}
            {...form.register("title")}
          />
          {form.formState.errors.title ? (
            <p className="text-[10px] font-bold text-red-500">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              maxLength={140}
              {...form.register("slug", {
                onChange: () => setAutoSlugEdited(true),
              })}
            />
            {form.formState.errors.slug ? (
              <p className="text-[10px] font-bold text-red-500">
                {form.formState.errors.slug.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">URL da capa</Label>
            <Input
              id="coverImageUrl"
              placeholder="https://..."
              {...form.register("coverImageUrl")}
            />
            {form.formState.errors.coverImageUrl ? (
              <p className="text-[10px] font-bold text-red-500">
                {form.formState.errors.coverImageUrl.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Resumo</Label>
          <Textarea
            id="excerpt"
            maxLength={240}
            className="min-h-24"
            {...form.register("excerpt")}
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>Resumo exibido na listagem pública.</span>
            <span>{excerptValue.length}/240</span>
          </div>
          {form.formState.errors.excerpt ? (
            <p className="text-[10px] font-bold text-red-500">
              {form.formState.errors.excerpt.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            className="min-h-[420px]"
            maxLength={20000}
            {...form.register("content")}
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>Use texto simples por enquanto. Podemos evoluir para editor rico depois.</span>
            <span>{contentValue.length}/20000</span>
          </div>
          {form.formState.errors.content ? (
            <p className="text-[10px] font-bold text-red-500">
              {form.formState.errors.content.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="serviços, comunidade, notícias"
            maxLength={120}
            {...form.register("tags")}
          />
          {form.formState.errors.tags ? (
            <p className="text-[10px] font-bold text-red-500">
              {form.formState.errors.tags.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border-subtle pt-6 sm:flex-row">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar rascunho"}
          </Button>
          {mode === "edit" ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingForReview}
              onClick={handleSubmitForReview}
            >
              {isSubmittingForReview ? "Enviando..." : "Enviar para revisão"}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
