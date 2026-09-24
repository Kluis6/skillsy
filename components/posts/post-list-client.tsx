"use client";

import { useMemo, useState } from "react";
import { Post } from "@/models/types";
import { PostCard } from "@/components/posts/post-card";
import { CreatePostCta } from "./create-post-cta";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type PostFilter = "all" | Post["category"];

const FILTER_OPTIONS: { value: PostFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "article", label: "Artigos" },
  { value: "job", label: "Vagas" },
];

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
      <div className="border border-dashed border-border-subtle bg-card p-10 text-center text-text-muted">
        Nenhuma publicação publicada ainda.
      </div>
    );
  }

  return (
    <div className="mx-auto container w-full mb-8  space-y-8 -mt-7 z-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 isolate bg-card p-4 shadow-sm border border-border-subtle">
        <ToggleGroup
          aria-label="Filtrar publicações"
          spacing={1}
          className="w-full md:w-fit"
          value={[filter]}
          onValueChange={(value) => {
            if (value[0]) setFilter(value[0] as PostFilter);
          }}
        >
          {FILTER_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="h-10 flex-1 text-sm font-semibold text-text-muted hover:bg-surface md:flex-none md:px-4 aria-pressed:bg-primary/10 aria-pressed:text-primary"
            >
              {option.label} ({counts[option.value]})
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <CreatePostCta />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="border border-dashed border-border-subtle bg-card p-10 text-center text-text-muted">
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
