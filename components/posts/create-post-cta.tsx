"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { shouldShowVerifiedBadge } from "@/lib/member-verification";
import { useT } from "@/lib/i18n/provider";

export function CreatePostCta() {
  const { user, profile, loading } = useAuth();
  const t = useT();
  const canCreatePost = shouldShowVerifiedBadge(profile);

  if (loading || !user || !canCreatePost) {
    return null;
  }

  return (
    <Link
      href="/meus-artigos/novo"
      className="w-full md:w-fit flex justify-center items-center text-center h-10 px-4 bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:bg-primary/80 transition-colors"
    >
      {t("posts.create")}
    </Link>
  );
}
