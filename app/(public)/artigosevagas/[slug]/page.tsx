import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { createPublicMetadata } from "@/lib/public-metadata";
import { getPostExcerpt, POST_CATEGORY_LABELS } from "@/lib/post-utils";
import { PostPublicActions } from "@/components/posts/post-public-actions";
import { PostService } from "@/services/post-service";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await PostService.getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: "Artigo não encontrado",
    };
  }

  return createPublicMetadata({
    title: post.title,
    description: getPostExcerpt(post),
    path: `/artigosevagas/${post.slug}`,
    imageTitle: post.title,
    imageDescription: getPostExcerpt(post),
    imageLabel: post.category === "job" ? "Vaga publicada" : "Artigo publicado",
    socialImagePath: `/artigosevagas/${post.slug}/opengraph-image`,
    openGraphType: "article",
  });
}

export default async function NoticiaDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await PostService.getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-surface py-2">
      <section className="container mx-auto px-4 mb-2">
        <div className="bg-card border border-border-subtle pb-4">
          <div className="flex items-center justify-between p-4">
            <Link
              href="/artigosevagas"
              className="flex items-center space-x-1 text-text-muted hover:text-primary transition-colors cursor-pointer"
            >
              <LuArrowLeft />
              <p className=" font-medium text-sm">Voltar</p>
            </Link>
          </div>
          {post.coverImageUrl ? (
            <div className="relative h-[30vh] overflow-hidden md:h-[45vh]">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                sizes="100vw"
                className="object-cover "
              />
            </div>
          ) : null}

          <div className="flex  items-center justify-between p-4">
            {post.isFeatured ? (
              <Badge className="bg-primary/10 text-primary border-primary/10">
                Destaque
              </Badge>
            ) : null}
            <h3 className="text-xs text-text-muted">
              por <strong> {post.authorName}</strong>
            </h3>
            <div>
              <Badge
                variant="secondary"
                className={` ${POST_CATEGORY_LABELS[post.category] === "Vagas" ? "bg-green-500/15 text-green-800 dark:text-green-300" : "bg-amber-500/15 text-amber-800 dark:text-amber-300"} `}
              >
                {POST_CATEGORY_LABELS[post.category]}
              </Badge>
              {post.isFeatured ? (
                <Badge className="bg-primary/10 text-primary border-primary/10">
                  Destaque
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="px-4 space-y-4">
            <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-text-main">
              {post.title}
            </h3>
            <p className="text-base leading-6 text-text-muted font-normal">
              {getPostExcerpt(post)}
            </p>
            <PostPublicActions post={post} redirectOnDelete="/artigosevagas" />
            <article>
              {post.content.trim() ? (
                <p className="whitespace-pre-wrap leading-6 text-base text-text-muted font-normal">
                  {post.content}
                </p>
              ) : (
                <p className="text-base leading-8 text-text-muted">
                  Esta publicação foi compartilhada sem texto adicional.
                </p>
              )}
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
