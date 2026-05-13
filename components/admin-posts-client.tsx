"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Post, PostStatus } from "@/models/types";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusLabels: Record<PostStatus, string> = {
  draft: "Rascunho",
  pending_review: "Em revisão",
  published: "Publicado",
  rejected: "Rejeitado",
};

export function AdminPostsClient() {
  const { profile, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PostStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const result = await PostService.getAllPostsForAdmin();
      setPosts(result);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os artigos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === "admin") {
      loadPosts();
    }
  }, [profile]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      const term = query.trim().toLowerCase();
      const matchesQuery =
        term.length === 0 ||
        post.title.toLowerCase().includes(term) ||
        post.authorName.toLowerCase().includes(term);

      return matchesStatus && matchesQuery;
    });
  }, [posts, query, statusFilter]);

  const handleReview = (post: Post, status: "published" | "rejected") => {
    startTransition(async () => {
      try {
        const rejectionReason =
          status === "rejected"
            ? window.prompt("Motivo da rejeição (opcional):", post.rejectionReason || "") || ""
            : "";

        await PostService.reviewPost({
          id: post.id!,
          status,
          rejectionReason,
          isFeatured: post.isFeatured || false,
        });
        toast.success(status === "published" ? "Artigo publicado." : "Artigo rejeitado.");
        await loadPosts();
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível atualizar o artigo.");
      }
    });
  };

  const handleToggleFeatured = (post: Post) => {
    if (post.status !== "published") {
      toast.error("Apenas artigos publicados podem receber destaque.");
      return;
    }

    startTransition(async () => {
      try {
        await PostService.reviewPost({
          id: post.id!,
          status: "published",
          isFeatured: !post.isFeatured,
        });
        toast.success(post.isFeatured ? "Destaque removido." : "Artigo marcado como destaque.");
        await loadPosts();
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível alterar o destaque.");
      }
    });
  };

  if (loading || isLoading) {
    return <div className="p-8 text-center text-text-muted">Carregando...</div>;
  }

  if (profile?.role !== "admin") {
    return (
      <div className="rounded-[2rem] border border-border-subtle bg-white p-10 text-center">
        <h1 className="text-2xl font-bold text-text-main">Acesso restrito</h1>
        <p className="mt-2 text-text-muted">
          Apenas administradores podem revisar artigos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border-subtle bg-white p-6">
        <h1 className="text-3xl font-bold text-text-main">Artigos</h1>
        <p className="mt-1 text-text-muted">
          Revise envios, publique conteúdo e destaque notícias importantes.
        </p>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-border-subtle bg-white p-6 md:grid-cols-[1fr_220px]">
        <Input
          placeholder="Buscar por título ou autor"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | PostStatus)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="draft">Rascunhos</option>
          <option value="pending_review">Em revisão</option>
          <option value="published">Publicados</option>
          <option value="rejected">Rejeitados</option>
        </select>
      </div>

      <div className="rounded-[2rem] border border-border-subtle bg-white">
        {filteredPosts.length === 0 ? (
          <div className="p-10 text-center text-text-muted">
            Nenhum artigo encontrado com esses filtros.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-text-main">{post.title}</h2>
                    <Badge variant="outline">{statusLabels[post.status]}</Badge>
                    {post.isFeatured ? (
                      <Badge className="bg-primary/10 text-primary border-primary/10">
                        Destaque
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-text-muted">
                    por {post.authorName} • {post.authorEmail}
                  </p>
                  <p className="max-w-3xl text-sm text-text-muted">{post.excerpt}</p>
                  {post.rejectionReason ? (
                    <p className="text-xs font-medium text-red-500">
                      Rejeição: {post.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  {post.status === "published" ? (
                    <Link href={`/noticias/${post.slug}`}>
                      <Button variant="outline">Ver público</Button>
                    </Link>
                  ) : null}
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleToggleFeatured(post)}
                  >
                    {post.isFeatured ? "Remover destaque" : "Destacar"}
                  </Button>
                  {post.status !== "published" ? (
                    <Button disabled={isPending} onClick={() => handleReview(post, "published")}>
                      Publicar
                    </Button>
                  ) : null}
                  {post.status !== "rejected" ? (
                    <Button
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => handleReview(post, "rejected")}
                    >
                      Rejeitar
                    </Button>
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
