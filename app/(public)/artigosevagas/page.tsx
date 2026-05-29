import type { Metadata } from "next";
import { PostListClient } from "@/components/posts/post-list-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { PostService } from "@/services/post-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPublicMetadata({
  title: "Notícias, Artigos e Vagas",
  description: "Conteúdo publicado pela comunidade Skillsy.",
  path: "/artigosevagas",
  imageTitle: "Notícias, artigos e vagas da comunidade Skillsy",
  imageDescription:
    "Acompanhe publicações, reflexões e novidades compartilhadas pela comunidade.",
  imageLabel: "Conteúdo público",
  socialImagePath: "/artigosevagas/opengraph-image",
});

export default async function NoticiasPage() {
  const posts = await PostService.getPublishedPosts();

  return (
    <div className="min-h-screen bg-surface">
      <section className="relative h-[30vh] md:h-[50vh] w-full bg-cover bg-center object-fill bg-[url(/Gemini_Generated_Image_kwyhw5kwyhw5kwyh.png)] ">
        <div className={`absolute inset-0 bg-blue-700/30 brightness-30`}></div>
        <div className="space-y-4 p-4 container mx-auto flex flex-col items-start justify-center h-full w-full">
          <div className="space-y-2 bg-gray-700/40 shadow-md p-4 backdrop-blur-xs rounded">
            <h1 className="text-xl lg:text-4xl font-bold text-white ">
              Novidades, artigos e vagas
            </h1>
            <p className="text-base lg:text-xl text-white ">
              Acompanhe publicações da comunidade e compartilhe o conteúdo.
            </p>
          </div>
        </div>
      </section>
      <main className="container mx-auto space-y-10 px-4 ">
        <PostListClient posts={posts} />
      </main>
    </div>
  );
}
