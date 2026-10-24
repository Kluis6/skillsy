import { AdminMessagesClient } from "@/components/admin-messages-client";
import { createPrivateMetadata } from "@/lib/public-metadata";

export const metadata = createPrivateMetadata({
  title: "Mensagens de contato | Painel Administrativo",
  description: "Mensagens enviadas pelo Fale conosco do Skillsy.",
});

export default function AdminMessagesPage() {
  return <AdminMessagesClient />;
}
