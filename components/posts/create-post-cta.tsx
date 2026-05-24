"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function CreatePostCta() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <Link href="/meus-artigos/novo">
      <Button className="w-full md:w-auto">Criar publicação</Button>
    </Link>
  );
}
