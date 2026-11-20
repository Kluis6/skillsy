import type { ComponentProps, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "@/lib/i18n/navigation";

export function ProfileToolbar({
  backHref,
  backLabel,
  onBackNavigate,
  children,
}: {
  backHref: string;
  backLabel: string;
  onBackNavigate?: ComponentProps<typeof Link>["onNavigate"];
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-card/85 backdrop-blur-md">
      <nav className="container mx-auto flex min-h-12 items-center justify-between gap-3 px-4 py-1 md:py-2">
        <Link
          href={backHref}
          onNavigate={onBackNavigate}
          className="inline-flex min-h-10 min-w-10 items-center gap-2 text-sm font-medium text-text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span className="sr-only md:not-sr-only">{backLabel}</span>
        </Link>
        {children}
      </nav>
    </header>
  );
}
