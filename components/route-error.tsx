"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouteErrorProps = {
  error: Error & { digest?: string };
  /** From the error boundary: re-fetches and re-renders the failed segment. */
  retry: () => void;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  icon?: ReactNode;
  /** Fill the viewport (root boundary) instead of the space inside a layout. */
  fullScreen?: boolean;
};

/**
 * Shared body for the error.tsx boundaries: each route group passes its own
 * copy and a way back that makes sense there.
 */
export function RouteError({
  error,
  retry,
  title,
  description,
  backHref,
  backLabel,
  icon = <AlertCircle size={40} />,
  fullScreen = false,
}: RouteErrorProps) {
  useEffect(() => {
    console.error(`${title}:`, error);
  }, [error, title]);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center bg-surface p-6 text-center",
        fullScreen ? "min-h-screen" : "min-h-[60vh]",
      )}
    >
      <div className="mb-6 flex size-20 items-center justify-center bg-destructive/10 text-destructive">
        {icon}
      </div>

      <h1 className="mb-4 font-heading text-3xl font-bold text-text-main">
        {title}
      </h1>
      <p className="mb-10 max-w-md leading-relaxed text-text-muted">
        {description}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => retry()} className="h-12 px-8 font-bold">
          <RotateCcw size={18} /> Tentar novamente
        </Button>
        <Button
          render={<Link href={backHref} />}
          nativeButton={false}
          variant="outline"
          className="h-12 px-8 font-bold"
        >
          <ArrowLeft size={18} /> {backLabel}
        </Button>
      </div>

      {error.digest ? (
        <p className="mt-12 text-xs text-text-muted">
          Se o problema continuar, informe este código ao suporte:
          <code className="ml-1 border border-border-subtle bg-card px-2 py-1">
            {error.digest}
          </code>
        </p>
      ) : null}

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 w-full max-w-2xl overflow-hidden border border-destructive/20 bg-destructive/5 p-6 text-left">
          <p className="break-words font-mono text-xs text-destructive">
            {error.message || "Erro desconhecido"}
          </p>
          {error.stack && (
            <pre className="mt-4 overflow-x-auto font-mono text-xs text-destructive">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
