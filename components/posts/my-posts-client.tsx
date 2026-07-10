"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Post } from "@/models/types";
import { POST_CATEGORY_LABELS, getPostExcerpt } from "@/lib/post-utils";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageHeader, SurfacePanel } from "@/components/ui/page-layout";
import { PostPublicActions } from "@/components/posts/post-public-actions";
import { MyPostsPageLoading } from "@/components/loading/route-loaders";
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
    return <MyPostsPageLoading />;
  }

  if (!user) {
    return (
      <SurfacePanel>
        <EmptyState
          title="Faça login para acessar suas publicações"
          description="A área de publicação é restrita a usuários autenticados."
        />
      </SurfacePanel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas publicações"
        description="Crie rascunhos, publique conteúdo e acompanhe o status."
        action={
          <Button render={<Link href="/meus-artigos/novo" />} nativeButton={false}>
            Nova publicação
          </Button>
        }
      />

      <SurfacePanel className="p-0 md:p-0">
        {posts.length === 0 ? (
          <EmptyState
            title="Você ainda não criou nenhuma publicação."
            description="Compartilhe uma notícia, oportunidade ou conteúdo útil para a comunidade."
            action={
              <Button render={<Link href="/meus-artigos/novo" />} nativeButton={false}>
                Criar primeira publicação
              </Button>
            }
          />
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
                    <Button
                      render={<Link href={`/artigosevagas/${post.slug}`} />}
                      nativeButton={false}
                    >
                      Ver publicado
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfacePanel>
    </div>
  );
}
