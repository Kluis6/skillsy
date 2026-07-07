import { EditPostPageClient } from "@/components/posts/edit-post-page-client";
import { createPrivateMetadata } from "@/lib/public-metadata";

export const metadata = createPrivateMetadata({
  title: "Editar Publicação",
  description: "Área restrita para editar uma publicação no Skillsy.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarArtigoPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <EditPostPageClient id={id} />
    </main>
  );
}
