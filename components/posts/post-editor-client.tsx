"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { shouldShowVerifiedBadge } from "@/lib/member-verification";
import { uploadImage } from "@/lib/image-upload";
import { postEditorSchema, type PostEditorFormData } from "@/lib/validations";
import {
  normalizePostTags,
  slugifyPostTitle,
} from "@/lib/post-utils";
import { Post } from "@/models/types";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import { PostEditorPageLoading } from "@/components/loading/route-loaders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { useT } from "@/lib/i18n/provider";

const MAX_IMAGE_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const getCompressionErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
};

type PostEditorClientProps = {
  mode: "create" | "edit";
  initialPost?: Post | null;
};

export function PostEditorClient({
  mode,
  initialPost,
}: PostEditorClientProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const t = useT();
  const [isPublishing, startPublishing] = useTransition();
  const [autoSlugEdited, setAutoSlugEdited] = useState(Boolean(initialPost));
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const canPublish = shouldShowVerifiedBadge(profile);
  const isPublishedPost = initialPost?.status === "published";

  const form = useForm<PostEditorFormData>({
    resolver: zodResolver(postEditorSchema),
    mode: "onBlur",
    defaultValues: {
      category: initialPost?.category || "article",
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
  const coverImageValue =
    useWatch({ control: form.control, name: "coverImageUrl" }) || "";

  useEffect(() => {
    if (!autoSlugEdited) {
      form.setValue("slug", slugifyPostTitle(titleValue), {
        shouldValidate: true,
      });
    }
  }, [autoSlugEdited, titleValue, form]);

  const handleCoverFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("posts.invalidFile"), {
        description: t("posts.invalidFileText"),
      });
      event.target.value = "";
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      toast.error(t("posts.unsupportedFormat"), {
        description: t("posts.unsupportedFormatText"),
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
      toast.error(t("posts.imageTooLarge"), {
        description: t("posts.imageTooLargeText"),
      });
      event.target.value = "";
      return;
    }

    setUploadingCover(true);
    try {
      const url = await uploadImage(file, "posts");
      form.setValue("coverImageUrl", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success(t("posts.coverUploaded"));
    } catch (error) {
      toast.error(t("posts.imageUploadError"), {
        description: getCompressionErrorMessage(error, t("posts.imageError")),
      });
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  };

  const handleRemoveCoverImage = () => {
    form.setValue("coverImageUrl", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: PostEditorFormData) => {
    if (!user) {
      toast.error(t("posts.loginRequired"));
      return;
    }

    try {
      const payload = {
        category: data.category,
        title: data.title.trim(),
        slug: data.slug.trim(),
        excerpt: data.excerpt.trim(),
        content: data.content.trim(),
        coverImageUrl: data.coverImageUrl.trim(),
        tags: normalizePostTags(data.tags),
      };

      if (mode === "create") {
        const id = await PostService.createDraft(payload);
        toast.success(t("posts.draftCreated"));
        router.push(`/meus-artigos/${id}/editar`);
        return;
      }

      if (!initialPost?.id) return;

      await PostService.updateOwnPost(initialPost.id, payload);
      toast.success(t("posts.draftUpdated"));
      router.refresh();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error &&
        error.message.includes("Missing or insufficient permissions")
          ? t("posts.permissionError")
          : t("posts.saveError");
      toast.error(message);
    }
  };

  const handleSubmitForReview = form.handleSubmit((data) => {
    const postId = initialPost?.id;

    if (!postId) return;

    startPublishing(async () => {
      try {
        const payload = {
          category: data.category,
          title: data.title.trim(),
          slug: data.slug.trim(),
          excerpt: data.excerpt.trim(),
          content: data.content.trim(),
          coverImageUrl: data.coverImageUrl.trim(),
          tags: normalizePostTags(data.tags),
        };

        await PostService.updateOwnPost(postId, payload);
        await PostService.publishOwnPost(postId);
        toast.success(
          isPublishedPost ? t("posts.postUpdated") : t("posts.postSent"),
        );
        router.push("/artigosevagas");
      } catch (error) {
        console.error(error);
        toast.error(t("posts.publishError"));
      }
    });
  });

  if (loading) {
    return <PostEditorPageLoading />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl border border-border-subtle bg-card p-10 text-center shadow-xs">
        <h1 className="text-2xl font-bold text-text-main">{t("posts.restrictedTitle")}</h1>
        <p className="mt-2 text-text-muted">
          {t("posts.restrictedText")}
        </p>
        <Link href="/" className="mt-6 inline-flex text-sm font-bold text-primary hover:underline">
          {t("posts.backHome")}
        </Link>
      </div>
    );
  }

  if (!canPublish) {
    return (
      <div className="mx-auto max-w-3xl border border-border-subtle bg-card p-10 text-center shadow-xs">
        <h1 className="text-2xl font-bold text-text-main">
          {t("posts.verifiedOnlyTitle")}
        </h1>
        <p className="mt-2 text-text-muted">
          {t("posts.verifiedOnlyText")}
        </p>
        <Link
          href="/profile"
          className="mt-6 inline-flex text-sm font-bold text-primary hover:underline"
        >
          {t("posts.goToProfile")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border border-primary/20 bg-primary/5 p-5 text-sm text-text-muted">
        {t("posts.editorIntro")}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border border-border-subtle bg-card p-6 md:p-8 shadow-xs">
        <div className="space-y-2">
          <Label htmlFor="category">{t("posts.category")}</Label>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select
                items={{ article: t("posts.categoryArticle"), job: t("posts.categoryJob") }}
                name={field.name}
                value={field.value}
                onValueChange={(value) => value && field.onChange(value)}
              >
                <SelectTrigger
                  id="category"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-invalid={Boolean(form.formState.errors.category)}
                  className="h-11 w-full px-3 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">
                    {t("posts.categoryArticle")}
                  </SelectItem>
                  <SelectItem value="job">{t("posts.categoryJob")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.category ? (
            <p className="text-xs font-bold text-destructive">
              {form.formState.errors.category.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">{t("posts.title")}</Label>
          <Input
            id="title"
            maxLength={120}
            {...form.register("title")}
          />
          {form.formState.errors.title ? (
            <p className="text-xs font-bold text-destructive">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug">{t("posts.slug")}</Label>
            <Input
              id="slug"
              maxLength={140}
              {...form.register("slug", {
                onChange: () => setAutoSlugEdited(true),
              })}
            />
            {form.formState.errors.slug ? (
              <p className="text-xs font-bold text-destructive">
                {form.formState.errors.slug.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">{t("posts.coverUrl")}</Label>
            <Input
              id="coverImageUrl"
              placeholder="https://..."
              {...form.register("coverImageUrl")}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
              >
                {uploadingCover ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <ImagePlus size={16} className="mr-2" />
                )}
                {uploadingCover ? t("posts.uploading") : t("posts.uploadImage")}
              </Button>
              {coverImageValue ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemoveCoverImage}
                >
                  <Trash2 size={16} className="mr-2" />
                  {t("posts.removeCover")}
                </Button>
              ) : null}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleCoverFileChange}
            />
            <p className="text-xs text-text-muted">
              {t("posts.coverHint")}
            </p>
            {form.formState.errors.coverImageUrl ? (
              <p className="text-xs font-bold text-destructive">
                {form.formState.errors.coverImageUrl.message}
              </p>
            ) : null}
          </div>
        </div>

        {coverImageValue ? (
          <div className="space-y-2">
            <Label>{t("posts.coverPreview")}</Label>
            <div className="relative h-56 overflow-hidden border border-border-subtle bg-surface">
              <Image
                src={coverImageValue}
                alt={t("posts.coverPreviewAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="excerpt">{t("posts.excerpt")}</Label>
          <Textarea
            id="excerpt"
            maxLength={240}
            className="min-h-24"
            {...form.register("excerpt")}
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>{t("posts.excerptHint")}</span>
            <span>{excerptValue.length}/240</span>
          </div>
          {form.formState.errors.excerpt ? (
            <p className="text-xs font-bold text-destructive">
              {form.formState.errors.excerpt.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">{t("posts.content")}</Label>
          <Textarea
            id="content"
            className="min-h-[420px]"
            maxLength={20000}
            {...form.register("content")}
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>{t("posts.contentHint")}</span>
            <span>{contentValue.length}/20000</span>
          </div>
          {form.formState.errors.content ? (
            <p className="text-xs font-bold text-destructive">
              {form.formState.errors.content.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">{t("posts.tags")}</Label>
          <Input
            id="tags"
            placeholder={t("posts.tagsPlaceholder")}
            maxLength={120}
            {...form.register("tags")}
          />
          {form.formState.errors.tags ? (
            <p className="text-xs font-bold text-destructive">
              {form.formState.errors.tags.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border-subtle pt-6 sm:flex-row">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("posts.saving") : t("posts.saveDraft")}
          </Button>
          {mode === "edit" ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPublishing}
              onClick={handleSubmitForReview}
            >
              {isPublishing
                ? t("posts.publishing")
                : isPublishedPost
                  ? t("posts.updatePost")
                  : t("posts.publishNow")}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
