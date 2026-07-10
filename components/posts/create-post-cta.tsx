"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { shouldShowVerifiedBadge } from "@/lib/member-verification";

export function CreatePostCta() {
  const { user, profile, loading } = useAuth();
  const canCreatePost = shouldShowVerifiedBadge(profile);

  if (loading || !user || !canCreatePost) {
    return null;
  }

  return (
    <Link
      href="/meus-artigos/novo"
      className="w-full md:w-fit flex justify-center items-center text-center h-10 px-4 bg-primary text-white font-medium rounded-sm text-sm hover:bg-primary/90 active:bg-primary/80 transition-colors"
    >
      Criar publicação
    </Link>
  );
}
