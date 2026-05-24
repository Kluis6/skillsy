"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Post } from "@/models/types";
import { PostService } from "@/services/post-service";
import { PostEditorClient } from "@/components/posts/post-editor-client";
import { toast } from "sonner";

export function EditPostPageClient({ id }: { id: string }) {
  const { user, loading } = useAuth();
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
        toast.error("Não foi possível carregar a publicação.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [id, user]);

  if (loading || isLoading) {
    return <div className="p-8 text-center text-text-muted">Carregando...</div>;
  }

  if (!post) {
    return (
      <div className="rounded-[2rem] border border-border-subtle bg-white p-10 text-center text-text-muted">
        Publicação não encontrada ou indisponível para edição.
      </div>
    );
  }

  return <PostEditorClient mode="edit" initialPost={post} />;
}
