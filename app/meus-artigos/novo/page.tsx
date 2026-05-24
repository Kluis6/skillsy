import type { Metadata } from "next";
import { PostEditorClient } from "@/components/posts/post-editor-client";

export const metadata: Metadata = {
  title: "Nova Publicação",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NovoArtigoPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <PostEditorClient mode="create" />
    </main>
  );
}
