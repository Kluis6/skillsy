"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Post } from "@/models/types";
import { PostService } from "@/services/post-service";
import { PostEditorClient } from "@/components/posts/post-editor-client";
import { PostEditorPageLoading } from "@/components/loading/route-loaders";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/provider";

export function EditPostPageClient({ id }: { id: string }) {
  const { user, loading } = useAuth();
  const t = useT();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await PostService.getPostById(id);
        if (!result || result.authorId !== user.uid) {
          setPost(null);
          return;
        }
        setPost(result);
      } catch (error) {
        console.error(error);
        toast.error(t("posts.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [id, user, t]);

  if (loading || isLoading) {
    return <PostEditorPageLoading />;
  }

  if (!post) {
    return (
      <div className="border border-border-subtle bg-card p-10 text-center text-text-muted shadow-xs">
        {t("posts.editNotFound")}
      </div>
    );
  }

  return <PostEditorClient mode="edit" initialPost={post} />;
}
