"use client";

import Link from "next/link";
import Image from "next/image";
import { Post } from "@/models/types";
import { POST_CATEGORY_LABELS, getPostExcerpt } from "@/lib/post-utils";
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
import { Button } from "@base-ui/react";

export function PostCard({ post }: { post: Post }) {
  return (
    <>
      <article className="col-span-12 lg:col-span-4 h-full w-full">
        <Card className="relative mx-auto w-full pt-0">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="relative z-20 h-38 w-full object-cover "
            />
          ) : null}
          <CardHeader>
            <div>
              <h3 className="text-xs text-gray-700">
                por <strong> {post.authorName}</strong>
              </h3>
            </div>
            <CardAction>
              <Badge
                variant="secondary"
                className="bg-amber-500/20 text-amber-800"
              >
                {POST_CATEGORY_LABELS[post.category]}
              </Badge>
              {post.isFeatured ? (
                <Badge className="bg-primary/10 text-primary border-primary/10">
                  Destaque
                </Badge>
              ) : null}
            </CardAction>
            <CardTitle>{post.title}</CardTitle>
            <div className="w-full flex flex-col space-y-4">
              <CardDescription>{getPostExcerpt(post)}</CardDescription>
              <CardDescription className="w-full">
                <Link
                  href={`/artigosevagas/${post.slug}`}
                  className=" text-sm font-bold text-primary hover:underline"
                >
                  {post.category === "job" ? "Ver vaga" : "Ler publicação"}
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
