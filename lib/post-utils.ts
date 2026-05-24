import type { PostCategory } from "@/models/types";

export function slugifyPostTitle(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizePostTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 5);
}

export const POST_CATEGORY_OPTIONS = ["article", "job"] as const;

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  article: "Artigo",
  job: "Vaga",
};

export function getPostExcerpt(post: { excerpt?: string; content?: string }) {
  const excerpt = post.excerpt?.trim();
  if (excerpt) {
    return excerpt;
  }

  const content = post.content?.replace(/\s+/g, " ").trim() || "";
  if (!content) {
    return "Esta publicação foi compartilhada com imagem de capa e sem texto complementar.";
  }

  return content.length > 180 ? `${content.slice(0, 177).trimEnd()}...` : content;
}
