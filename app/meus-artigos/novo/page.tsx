import { PostEditorClient } from "@/components/posts/post-editor-client";
import { createPrivateMetadata } from "@/lib/public-metadata";

export const metadata = createPrivateMetadata({
  title: "Nova Publicação",
  description: "Área restrita para criar uma nova publicação no Skillsy.",
});

export default function NovoArtigoPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <PostEditorClient mode="create" />
    </main>
  );
}
