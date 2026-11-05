"use client";

import Image from "next/image";
import Link from "next/link";
import { Post } from "@/models/types";
import { getPostExcerpt } from "@/lib/post-utils";
import { useT } from "@/lib/i18n/provider";
import { rich } from "@/lib/i18n/rich";
import { Badge } from "@/components/ui/badge";
import { PostPublicActions } from "@/components/posts/post-public-actions";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function PostCard({ post }: { post: Post }) {
  const t = useT();
  return (
    <>
      <article className="col-span-12 lg:col-span-4 h-full w-full">
        <Card className="relative mx-auto w-full pt-0">
          {post.coverImageUrl ? (
            <div className="relative z-20 h-38 w-full">
              {/* Covers can be uploads (data URLs) or links to any site, so
                  they skip the optimizer's host allowlist. */}
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                unoptimized
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <CardHeader>
            <div>
              <h3 className="text-xs text-text-muted">
                {rich(t("posts.by"), { name: <strong>{post.authorName}</strong> })}
              </h3>
            </div>
            <CardAction>
              <Badge
                variant="secondary"
                className={` ${post.category === "job" ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"} `}
              >
                {post.category === "job" ? t("posts.categoryJob") : t("posts.categoryArticle")}
              </Badge>
              {post.isFeatured ? (
                <Badge className="bg-primary/10 text-primary border-primary/10">
                  {t("posts.featured")}
                </Badge>
              ) : null}
            </CardAction>
            <CardTitle>{post.title}</CardTitle>
            <div className="w-full flex flex-col space-y-4">
              <CardDescription>{getPostExcerpt(post, t("posts.excerptFallback"))}</CardDescription>
              <CardDescription>
                <Link
                  href={`/artigosevagas/${post.slug}`}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {post.category === "job" ? t("posts.viewJob") : t("posts.readPost")}
                </Link>
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <PostPublicActions post={post} compact />
          </CardFooter>
        </Card>
      </article>
    </>
  );
}
