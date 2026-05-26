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
      <div className="rounded-md border border-dashed border-border-subtle bg-white p-10 text-center text-text-muted">
        Nenhuma publicação publicada ainda.
      </div>
    );
  }

  return (
    <div className="mx-auto container w-full my-4 space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 border">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button
            type="button"
            
            onClick={() => setFilter("all")}
            className={`w-full md:w-fit px-4 h-10 text-sm font-semibold transition-colors ${
              filter === "all"
                ? " text-blue-700"
                : " text-gray-700"
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

        <CreatePostCta />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle bg-white p-10 text-center text-text-muted">
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
