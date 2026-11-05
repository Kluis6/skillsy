"use client";

import { RouteError } from "@/components/route-error";

export default function MyPostsError({
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
      title="Não foi possível carregar seus artigos"
      description="Houve uma falha temporária ao buscar seus artigos. Tente novamente em instantes."
      backHref="/meus-artigos"
      backLabel="Voltar aos meus artigos"
    />
  );
}
