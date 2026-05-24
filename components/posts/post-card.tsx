"use client";

import Link from "next/link";
import Image from "next/image";
import { Post } from "@/models/types";
import { POST_CATEGORY_LABELS, getPostExcerpt } from "@/lib/post-utils";
import { Badge } from "@/components/ui/badge";
import { PostPublicActions } from "@/components/posts/post-public-actions";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-border-subtle bg-white shadow-sm transition-colors hover:border-primary/30">
      {post.coverImageUrl ? (
        <div className="relative h-52 w-full">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
        </div>
      ) : null}
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{POST_CATEGORY_LABELS[post.category]}</Badge>
          {post.isFeatured ? (
            <Badge className="bg-primary/10 text-primary border-primary/10">
              Destaque
            </Badge>
          ) : null}
          <span className="text-xs text-text-muted">
            por {post.authorName}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-main">{post.title}</h2>
          <p className="text-sm leading-relaxed text-text-muted">
            {getPostExcerpt(post)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/artigosevagas/${post.slug}`}
            className="inline-flex text-sm font-bold text-primary hover:underline"
          >
            {post.category === "job" ? "Ver vaga" : "Ler publicação"}
          </Link>
          <PostPublicActions post={post} compact />
        </div>
      </div>
    </article>
  );
}
