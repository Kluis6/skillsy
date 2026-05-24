"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Post } from "@/models/types";
import { POST_CATEGORY_LABELS, getPostExcerpt } from "@/lib/post-utils";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostPublicActions } from "@/components/posts/post-public-actions";
import { toast } from "sonner";

const statusLabels: Record<Post["status"], string> = {
  draft: "Rascunho",
  pending_review: "Em revisão",
  published: "Publicado",
  rejected: "Rejeitado",
};

export function MyPostsClient() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await PostService.getMyPosts();
        setPosts(result);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar seus artigos.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [user]);

  if (loading || isLoading) {
    return <div className="p-8 text-center text-text-muted">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-border-subtle bg-white p-10 text-center">
        <h1 className="text-2xl font-bold text-text-main">Faça login para acessar suas publicações</h1>
        <p className="mt-2 text-text-muted">
          A área de publicação é restrita a usuários autenticados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border-subtle bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Minhas publicações</h1>
          <p className="mt-1 text-text-muted">
            Crie rascunhos, publique conteúdo e acompanhe o status.
          </p>
        </div>
        <Link href="/meus-artigos/novo">
          <Button>Nova publicação</Button>
        </Link>
      </div>

      <div className="rounded-[2rem] border border-border-subtle bg-white">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-text-muted">
            Você ainda não criou nenhuma publicação.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-text-main">{post.title}</h2>
                    <Badge variant="outline">{POST_CATEGORY_LABELS[post.category]}</Badge>
                    <Badge variant="outline">{statusLabels[post.status]}</Badge>
                  </div>
                  <p className="max-w-2xl text-sm text-text-muted">{getPostExcerpt(post)}</p>
                  {post.rejectionReason ? (
                    <p className="text-xs font-medium text-red-500">
                      Motivo da rejeição: {post.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <PostPublicActions post={post} compact />
                  {post.status === "published" ? (
                    <Link href={`/noticias/${post.slug}`}>
                      <Button>Ver publicado</Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
