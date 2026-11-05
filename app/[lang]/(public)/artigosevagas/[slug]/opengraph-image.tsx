import { PostService } from "@/services/post-service";
import { getPostExcerpt, POST_CATEGORY_LABELS } from "@/lib/post-utils";
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
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = await PostService.getPublishedPostBySlug(slug);

  if (!post) {
    return createPageOgImage({
      label: "Publicação",
      title: "Novidades, artigos e vagas",
      description: "Conteúdo público da comunidade Skillsy.",
    });
  }

  return createPageOgImage({
    image: await loadRemoteOgImage(post.coverImageUrl),
    label: `${POST_CATEGORY_LABELS[post.category]} · por ${post.authorName}`,
    title: post.title,
    description: getPostExcerpt(post),
  });
}
