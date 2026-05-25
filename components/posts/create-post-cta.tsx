"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { shouldShowVerifiedBadge } from "@/lib/member-verification";
import { Button } from "@/components/ui/button";

export function CreatePostCta() {
  const { user, profile, loading } = useAuth();
  const canCreatePost = shouldShowVerifiedBadge(profile);

  if (loading || !user || !canCreatePost) {
    return null;
  }

  return (
    <Link href="/meus-artigos/novo">
      <Button className="w-full md:w-auto">Criar publicação</Button>
    </Link>
  );
}
