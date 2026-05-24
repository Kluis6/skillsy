import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PostListClient } from "@/components/posts/post-list-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { PostService } from "@/services/post-service";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = createPublicMetadata({
  title: "Notícias, Artigos e Vagas",
  description: "Conteúdo publicado pela comunidade Skillsy.",
  path: "/noticias",
  imageTitle: "Notícias, artigos e vagas da comunidade Skillsy",
  imageDescription:
    "Acompanhe publicações, reflexões e novidades compartilhadas pela comunidade.",
  imageLabel: "Conteúdo público",
});

export default async function NoticiasPage() {
  const posts = await PostService.getPublishedPosts();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="container mx-auto space-y-10 px-4 py-10">
        <section className="flex flex-col gap-6 rounded-[2rem] border border-border-subtle bg-white p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-text-main">
              Notícias, artigos e vagas
            </h1>
            <p className="max-w-2xl text-text-muted">
              Acompanhe publicações da comunidade e compartilhe conteúdo próprio
              se você já tiver verificação de membro no Skillsy.
            </p>
          </div>
          <Link href="/meus-artigos/novo">
            <Button className="w-full md:w-auto">Criar publicação</Button>
          </Link>
        </section>
        <PostListClient posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
