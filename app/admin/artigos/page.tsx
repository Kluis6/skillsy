import { AdminPostsClient } from "@/components/admin-posts-client";
import { createPrivateMetadata } from "@/lib/public-metadata";

export const metadata = createPrivateMetadata({
  title: "Gerenciar Publicações | Painel Administrativo",
  description: "Área restrita para moderar e gerenciar publicações do Skillsy.",
});

export default function AdminArtigosPage() {
  return <AdminPostsClient />;
}
