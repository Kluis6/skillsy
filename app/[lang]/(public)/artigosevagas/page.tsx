import type { Metadata } from "next";
import HeaderSection from "@/components/headersection";
import { PostListClient } from "@/components/posts/post-list-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { PostService } from "@/services/post-service";

// Public data, regenerated at most once an hour (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 3600;

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
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_3hkj2c3hkj2c3hkj.png"
        backgroundImageAlt="Pessoas lendo publicações da comunidade"
        headlineSegments={[{ text: "Novidades, artigos e vagas" }]}
        description="Acompanhe publicações da comunidade e compartilhe o conteúdo."
      />
      <main className="container mx-auto space-y-10 px-4 py-4">
        <PostListClient posts={posts} />
      </main>
    </div>
  );
}
