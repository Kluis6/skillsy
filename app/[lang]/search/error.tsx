"use client";

import { RouteError } from "@/components/route-error";

export default function SearchError({
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
      title="Não foi possível concluir a busca"
      description="Houve uma falha temporária ao buscar profissionais. Tente novamente ou ajuste os filtros."
      backHref="/search"
      backLabel="Nova busca"
    />
  );
}
