"use client";

import { LuPencil } from "react-icons/lu";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Link from "@/lib/i18n/navigation";

export function CompanyEditButton({ ownerId, label }: { ownerId: string; label: string }) {
  const { user } = useAuth();
  if (user?.uid !== ownerId) return null;

  return (
    <Link
      href="/profile#perfil-de-servico"
      scroll={false}
      className={buttonVariants({ variant: "outline", size: "lg" })}
    >
      <LuPencil aria-hidden="true" />
      {label}
    </Link>
  );
}
