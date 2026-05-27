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
      className="w-full md:w-fit flex justify-center items-center text-center h-10 px-4 bg-blue-500 text-white font-medium  rounded-sm text-sm hover:bg-blue-600 active:bg-blue-700 transition-colors"
    >
      Criar publicação
    </Link>
  );
}
