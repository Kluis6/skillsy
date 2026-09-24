"use client";

import { RouteError } from "@/components/route-error";

export default function ContactsError({
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
      title="Não foi possível carregar seus contatos"
      description="Houve uma falha temporária ao buscar seus contatos. Tente novamente em instantes."
      backHref="/"
      backLabel="Voltar ao início"
    />
  );
}
