import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PostListClient } from "@/components/posts/post-list-client";
import { PostService } from "@/services/post-service";

export const metadata: Metadata = {
  title: "Notícias e Artigos",
  description: "Conteúdo publicado pela comunidade Skillsy.",
};

export default async function NoticiasPage() {
  const posts = await PostService.getPublishedPosts();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="container mx-auto space-y-10 px-4 py-10">
        <section className="space-y-4">
          <h1 className="text-4xl font-black text-text-main">Notícias e Artigos</h1>
          <p className="max-w-2xl text-text-muted">
            Atualizações, reflexões e conteúdos publicados por membros da comunidade Skillsy.
          </p>
        </section>
        <PostListClient posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
