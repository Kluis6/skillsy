import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CreatePostCta } from "@/components/posts/create-post-cta";
import { PostListClient } from "@/components/posts/post-list-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { PostService } from "@/services/post-service";

export const metadata: Metadata = createPublicMetadata({
  title: "Notícias, Artigos e Vagas",
  description: "Conteúdo publicado pela comunidade Skillsy.",
  path: "/artigosevagas",
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
      <section className="relative h-[30vh] md:h-[50vh] w-full bg-cover bg-center object-fill bg-[url(/Gemini_Generated_Image_kwyhw5kwyhw5kwyh.png)] ">
       <div className={`absolute inset-0 bg-blue-700/40 brightness-30`}></div>
        <div className="space-y-4 p-4 container mx-auto flex flex-col items-start justify-start h-full w-full">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-xl lg:text-4xl font-black text-white drop-shadow-sm drop-shadow-black/50">
              Novidades, artigos e vagas
            </h1>
            <p className="text-base md:text-xl text-white font-medium drop-shadow-sm drop-shadow-black/50">
              Acompanhe publicações da comunidade e compartilhe o conteúdo.
             
            </p>
          </div>
        </div>
      </section>
      <main className="container mx-auto space-y-10 px-4 py-10">
        <CreatePostCta />
        <PostListClient posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
