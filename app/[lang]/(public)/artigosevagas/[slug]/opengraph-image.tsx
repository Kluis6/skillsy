import { PostService } from "@/services/post-service";
import { getPostExcerpt } from "@/lib/post-utils";
import { getTFor } from "@/lib/i18n/translator";
import {
  createPageOgImage,
  loadRemoteOgImage,
  ogContentType,
  ogSize,
} from "@/lib/og-image-templates";

export const runtime = "nodejs";
export const alt = "Skillsy - Publicação da comunidade";
export const size = ogSize;
export const contentType = ogContentType;

type ImageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export default async function OpenGraphImage({ params }: ImageProps) {
  const { lang, slug } = await params;
  const t = getTFor(lang);
  const post = await PostService.getPublishedPostBySlug(slug);

  if (!post) {
    return createPageOgImage({
      label: t("posts.ogLabel"),
      title: t("posts.heroTitle"),
      description: t("posts.ogFallbackText"),
    });
  }

  return createPageOgImage({
    image: await loadRemoteOgImage(post.coverImageUrl),
    label: t("posts.ogPostLabel", {
      category: post.category === "job" ? t("posts.categoryJob") : t("posts.categoryArticle"),
      name: post.authorName,
    }),
    title: post.title,
    description: getPostExcerpt(post, t("posts.excerptFallback")),
  });
}
