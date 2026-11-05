"use client";

import { RouteError } from "@/components/route-error";

export default function ProfileError({
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
      title="Não foi possível carregar o perfil"
      description="O perfil pode ter sido removido ou houve uma falha temporária. Tente novamente ou volte para a busca."
      backHref="/search"
      backLabel="Buscar profissionais"
    />
  );
}
