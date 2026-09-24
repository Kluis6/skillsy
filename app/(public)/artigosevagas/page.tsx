import type { Metadata } from "next";
import { PostListClient } from "@/components/posts/post-list-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { PostService } from "@/services/post-service";

// Public data, regenerated at most once a minute (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 60;

export const metadata: Metadata = createPublicMetadata({
  title: "Notícias, Artigos e Vagas",
  description: "Conteúdo publicado pela comunidade Skillsy.",
  path: "/artigosevagas",
  imageTitle: "Notícias, artigos e vagas da comunidade Skillsy",
  imageDescription:
    "Acompanhe publicações, reflexões e novidades compartilhadas pela comunidade.",
  imageLabel: "Conteúdo público",
  heroImage: "artigosevagas",
});

export default async function NoticiasPage() {
  const posts = await PostService.getPublishedPosts();

  return (
    <div className="min-h-screen bg-surface">
      <section className="relative h-[50vh] md:h-[50vh] w-full md:bg-cover bg-center object-fill bg-[url(/Gemini_Generated_Image_3hkj2c3hkj2c3hkj.png)]">
        <div className="absolute inset-0 bg-linear-to-b from-black/65 via-black/30 to-transparent" />
        <div className="container relative mx-auto flex h-full w-full flex-col items-start justify-start space-y-4 px-4 pt-10">
          <div className="space-y-2 z-20">
            <h1 className="text-xl lg:text-4xl font-bold text-white drop-shadow-sm">
              Novidades, artigos e vagas
            </h1>
            <p className="text-base lg:text-xl text-white/90 drop-shadow-sm">
              Acompanhe publicações da comunidade e compartilhe o conteúdo.
            </p>
          </div>
        </div>
      </section>
      <main className="container mx-auto space-y-10 px-4 py-4">
        <PostListClient posts={posts} />
      </main>
    </div>
  );
}
