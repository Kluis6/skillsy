"use client";

import { ShieldAlert } from "lucide-react";
import { RouteError } from "@/components/route-error";

export default function AdminError({
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
      title="Erro no painel administrativo"
      description="Não foi possível processar sua solicitação. Pode ser uma falha temporária de conexão com o banco de dados."
      backHref="/admin"
      backLabel="Voltar ao painel"
      icon={<ShieldAlert size={40} />}
    />
  );
}
