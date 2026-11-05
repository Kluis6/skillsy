"use client";

import { useEffect, useState } from "react";
import Link from "@/lib/i18n/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Post } from "@/models/types";
import { getPostExcerpt } from "@/lib/post-utils";
import { useT } from "@/lib/i18n/provider";
import type { MessageKey } from "@skillsy/shared/i18n/keys";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageHeader, SurfacePanel } from "@/components/ui/page-layout";
import { PostPublicActions } from "@/components/posts/post-public-actions";
import { MyPostsPageLoading } from "@/components/loading/route-loaders";
import { toast } from "sonner";

const statusLabels: Record<Post["status"], MessageKey> = {
  draft: "posts.statusDraft",
  pending_review: "posts.statusPendingReview",
  published: "posts.statusPublished",
  rejected: "posts.statusRejected",
};

export function MyPostsClient() {
  const { user, loading } = useAuth();
  const t = useT();
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
        toast.error(t("posts.myLoadError"));
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [user, t]);

  if (loading || isLoading) {
    return <MyPostsPageLoading />;
  }

  if (!user) {
    return (
      <SurfacePanel>
        <EmptyState
          title={t("posts.myLoginTitle")}
          description={t("posts.myLoginText")}
        />
      </SurfacePanel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("posts.myTitle")}
        description={t("posts.myDescription")}
        action={
          <Button render={<Link href="/meus-artigos/novo" />} nativeButton={false}>
            {t("posts.newPost")}
          </Button>
        }
      />

      <SurfacePanel className="p-0 md:p-0">
        {posts.length === 0 ? (
          <EmptyState
            title={t("posts.myEmptyTitle")}
            description={t("posts.myEmptyText")}
            action={
              <Button render={<Link href="/meus-artigos/novo" />} nativeButton={false}>
                {t("posts.createFirst")}
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
                    <Badge variant="outline">{post.category === "job" ? t("posts.categoryJob") : t("posts.categoryArticle")}</Badge>
                    <Badge variant="outline">{t(statusLabels[post.status])}</Badge>
                  </div>
                  <p className="max-w-2xl text-sm text-text-muted">{getPostExcerpt(post, t("posts.excerptFallback"))}</p>
                  {post.rejectionReason ? (
                    <p className="text-xs font-medium text-destructive">
                      {t("posts.rejectionReason", { reason: post.rejectionReason })}
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
                      {t("posts.viewPublished")}
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
