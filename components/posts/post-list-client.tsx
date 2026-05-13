"use client";

import { Post } from "@/models/types";
import { PostCard } from "@/components/posts/post-card";

export function PostListClient({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-border-subtle bg-white p-10 text-center text-text-muted">
        Nenhum artigo publicado ainda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
