"use client";

import { RouteError } from "@/components/route-error";

export default function RootError({
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
      title="Algo deu errado"
      description="Ocorreu um erro inesperado ao carregar esta página. Tente novamente em instantes."
      backHref="/"
      backLabel="Voltar ao início"
      fullScreen
    />
  );
}
