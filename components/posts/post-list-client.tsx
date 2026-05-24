"use client";

import { useMemo, useState } from "react";
import { Post } from "@/models/types";
import { PostCard } from "@/components/posts/post-card";

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
      <div className="rounded-[2rem] border border-dashed border-border-subtle bg-white p-10 text-center text-text-muted">
        Nenhuma publicação publicada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            filter === "all"
              ? "border-primary bg-primary text-white"
              : "border-border-subtle bg-white text-text-main hover:border-primary/40"
          }`}
        >
          Todos ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setFilter("article")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            filter === "article"
              ? "border-primary bg-primary text-white"
              : "border-border-subtle bg-white text-text-main hover:border-primary/40"
          }`}
        >
          Artigos ({counts.article})
        </button>
        <button
          type="button"
          onClick={() => setFilter("job")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            filter === "job"
              ? "border-primary bg-primary text-white"
              : "border-border-subtle bg-white text-text-main hover:border-primary/40"
          }`}
        >
          Vagas ({counts.job})
        </button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border-subtle bg-white p-10 text-center text-text-muted">
          Nenhuma publicação encontrada para este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
