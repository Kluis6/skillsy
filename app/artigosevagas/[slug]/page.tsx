import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { createPublicMetadata } from "@/lib/public-metadata";
import { getPostExcerpt, POST_CATEGORY_LABELS } from "@/lib/post-utils";
import { PostPublicActions } from "@/components/posts/post-public-actions";
import { PostService } from "@/services/post-service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  });
}

export default async function NoticiaDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await PostService.getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
        <div className="space-y-4 rounded-[2rem] border border-border-subtle bg-white p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{POST_CATEGORY_LABELS[post.category]}</Badge>
            {post.isFeatured ? (
              <Badge className="bg-primary/10 text-primary border-primary/10">
                Destaque
              </Badge>
            ) : null}
            <span className="text-sm text-text-muted">
              por {post.authorName}
            </span>
          </div>
          <h1 className="text-4xl font-black text-text-main">{post.title}</h1>
          <p className="text-lg text-text-muted">{getPostExcerpt(post)}</p>
          <PostPublicActions post={post} redirectOnDelete="/artigosevagas" />
        </div>

        {post.coverImageUrl ? (
          <div className="relative h-72 overflow-hidden rounded-[2rem] border border-border-subtle bg-white md:h-[28rem]">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1023px) 100vw, 1024px"
            />
          </div>
        ) : null}

        <article className="rounded-[2rem] border border-border-subtle bg-white p-6 md:p-10">
          {post.content.trim() ? (
            <div className="whitespace-pre-wrap text-base leading-8 text-text-main">
              {post.content}
            </div>
          ) : (
            <p className="text-base leading-8 text-text-muted">
              Esta publicação foi compartilhada sem texto adicional.
            </p>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
