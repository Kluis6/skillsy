import type { Metadata } from "next";
import { EditPostPageClient } from "@/components/posts/edit-post-page-client";

export const metadata: Metadata = {
  title: "Editar Artigo",
  robots: {
    index: false,
    follow: false,
  },
};

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
