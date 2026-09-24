"use client";

import { RouteError } from "@/components/route-error";

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      title="Não foi possível carregar esta página"
      description="Pode ser uma instabilidade temporária na conexão. Tente novamente em instantes."
      backHref="/"
      backLabel="Voltar ao início"
    />
  );
}
