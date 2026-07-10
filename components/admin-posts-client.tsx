"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Post, PostStatus } from "@/models/types";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageHeader, SurfacePanel } from "@/components/ui/page-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminPostsPageLoading } from "@/components/loading/route-loaders";
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
  const [reviewIntent, setReviewIntent] = useState<{
    post: Post;
    status: "published" | "rejected";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

  const openReviewDialog = (post: Post, status: "published" | "rejected") => {
    setReviewIntent({ post, status });
    setRejectionReason(post.rejectionReason || "");
  };

  const handleReview = () => {
    const postId = reviewIntent?.post.id;

    if (!postId) {
      return;
    }

    startTransition(async () => {
      try {
        await PostService.reviewPost({
          id: postId,
          status: reviewIntent.status,
          rejectionReason:
            reviewIntent.status === "rejected" ? rejectionReason.trim() : "",
          isFeatured: reviewIntent.post.isFeatured || false,
        });
        toast.success(
          reviewIntent.status === "published"
            ? "Artigo publicado."
            : "Artigo rejeitado.",
        );
        setReviewIntent(null);
        setRejectionReason("");
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
    return <AdminPostsPageLoading />;
  }

  if (profile?.role !== "admin") {
    return (
      <SurfacePanel>
        <EmptyState
          title="Acesso restrito"
          description="Apenas administradores podem revisar artigos."
        />
      </SurfacePanel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artigos"
        description="Revise envios, publique conteúdo e destaque notícias importantes."
      />

      <SurfacePanel className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <Label htmlFor="admin-post-search" className="text-xs font-bold text-text-muted">
            Buscar artigo
          </Label>
          <Input
            id="admin-post-search"
            placeholder="Buscar por título ou autor"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-post-status" className="text-xs font-bold text-text-muted">
            Status
          </Label>
          <select
            id="admin-post-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | PostStatus)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="draft">Rascunhos</option>
            <option value="pending_review">Em revisão</option>
            <option value="published">Publicados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      </SurfacePanel>

      <SurfacePanel className="p-0 md:p-0">
        {filteredPosts.length === 0 ? (
          <EmptyState
            title="Nenhum artigo encontrado"
            description="Ajuste a busca ou o status para encontrar envios pendentes, publicados ou rejeitados."
          />
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
                    <Button
                      render={<Link href={`/artigosevagas/${post.slug}`} />}
                      nativeButton={false}
                      variant="outline"
                    >
                      Ver público
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleToggleFeatured(post)}
                  >
                    {post.isFeatured ? "Remover destaque" : "Destacar"}
                  </Button>
                  {post.status !== "published" ? (
                    <Button disabled={isPending} onClick={() => openReviewDialog(post, "published")}>
                      Publicar
                    </Button>
                  ) : null}
                  {post.status !== "rejected" ? (
                    <Button
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => openReviewDialog(post, "rejected")}
                    >
                      Rejeitar
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfacePanel>

      <Dialog open={Boolean(reviewIntent)} onOpenChange={(open) => !open && setReviewIntent(null)}>
        <DialogContent className="sm:h-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reviewIntent?.status === "published"
                ? "Publicar artigo?"
                : "Rejeitar artigo?"}
            </DialogTitle>
            <DialogDescription>
              {reviewIntent?.status === "published"
                ? "O artigo ficará visível para todos na área pública de novidades e vagas."
                : "O autor verá que o artigo foi rejeitado. Informe um motivo claro quando possível."}
            </DialogDescription>
          </DialogHeader>

          {reviewIntent ? (
            <div className="rounded-md border border-border-subtle bg-surface p-4">
              <p className="text-sm font-bold text-text-main">{reviewIntent.post.title}</p>
              <p className="mt-1 text-xs text-text-muted">
                por {reviewIntent.post.authorName} • {reviewIntent.post.authorEmail}
              </p>
            </div>
          ) : null}

          {reviewIntent?.status === "rejected" ? (
            <div className="space-y-2">
              <Label htmlFor="admin-post-rejection-reason">Motivo da rejeição</Label>
              <Textarea
                id="admin-post-rejection-reason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Ex: faltam informações, conteúdo duplicado, imagem inadequada..."
                className="min-h-28"
              />
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setReviewIntent(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={reviewIntent?.status === "rejected" ? "destructive" : "default"}
              disabled={isPending}
              onClick={handleReview}
            >
              {reviewIntent?.status === "published" ? "Publicar artigo" : "Rejeitar artigo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
