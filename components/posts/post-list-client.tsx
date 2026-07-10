"use client";

import { useMemo, useState } from "react";
import { Post } from "@/models/types";
import { PostCard } from "@/components/posts/post-card";
import { CreatePostCta } from "./create-post-cta";

type PostFilter = "all" | Post["category"];

export function PostListClient({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState<PostFilter>("all");

  const filteredPosts = useMemo(() => {
    if (filter === "all") {
      return posts;
    }

    return posts.filter((post) => post.category === filter);
  }, [filter, posts]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      article: posts.filter((post) => post.category === "article").length,
      job: posts.filter((post) => post.category === "job").length,
    }),
    [posts],
  );

  if (posts.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border-subtle bg-card p-10 text-center text-text-muted">
        Nenhuma publicação publicada ainda.
      </div>
    );
  }

  return (
    <div className="mx-auto container w-full mb-8  space-y-8 -mt-7 z-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 isolate bg-card rounded-xl p-4 shadow-sm border border-border-subtle">
        <div className="flex  justify-center items-center gap-1 w-full md:w-fit">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`w-full md:w-fit md:px-4 h-10 text-sm font-semibold transition-colors cursor-pointer ${
              filter === "all"
                ? "text-primary bg-primary/10"
                : "text-text-muted hover:bg-surface"
            }`}
          >
            Todos ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter("article")}
            className={`w-full md:w-fit md:px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              filter === "article"
                ? "text-primary bg-primary/10"
                : "text-text-muted hover:bg-surface"
            }`}
          >
            Artigos ({counts.article})
          </button>
          <button
            type="button"
            onClick={() => setFilter("job")}
            className={`w-full md:w-fit md:px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              filter === "job"
                ? "text-primary bg-primary/10"
                : "text-text-muted hover:bg-surface"
            }`}
          >
            Vagas ({counts.job})
          </button>
        </div>

        <CreatePostCta />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle bg-card p-10 text-center text-text-muted">
          Nenhuma publicação encontrada para este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
