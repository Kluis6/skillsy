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
        {/* <Card className="relative mx-auto w-full max-w-sm pt-0">
          <CardHeader>
            <CardAction>
              <Badge variant="secondary">Featured</Badge>
            </CardAction>
            <CardTitle>Design systems meetup</CardTitle>
            <CardDescription>
              A practical talk on component APIs, accessibility, and shipping
              faster.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">View Event</Button>
          </CardFooter>
        </Card> */}

        <Card className="relative mx-auto w-full pt-0">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="relative z-20 h-38 w-full object-cover "
            />
          ) : null}
          <CardHeader>
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
            <CardTitle className="w-[14rem] md:w-auto">{post.title}</CardTitle>
            <CardDescription>
              A practical talk on component APIs, accessibility, and shipping
              faster.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">View Event</Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-2 p-4 lg:p-6 h-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-700">
              por <strong> {post.authorName}</strong>
            </span>
          </div>
          <div className="flex flex-col justify-between">
            <h2 className="text-xl font-bold text-text-main">{post.title}</h2>
            <p className="text-sm leading-relaxed text-text-muted">
              {getPostExcerpt(post)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between">
            <Link
              href={`/artigosevagas/${post.slug}`}
              className="inline-flex text-sm font-bold text-primary hover:underline"
            >
              {post.category === "job" ? "Ver vaga" : "Ler publicação"}
            </Link>
            <PostPublicActions post={post} compact />
          </div>
        </div>
      </article>
    </>
  );
}
