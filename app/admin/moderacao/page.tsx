import { AdminModerationClient } from "@/components/admin-moderation-client";
import { createPrivateMetadata } from "@/lib/public-metadata";

export const metadata = createPrivateMetadata({
  title: "Fila de Moderação | Painel Administrativo",
  description: "Fila de denúncias e decisões administrativas do Skillsy.",
});

export default function AdminModerationPage() {
  return <AdminModerationClient />;
}
