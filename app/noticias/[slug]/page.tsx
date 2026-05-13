import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { PostService } from "@/services/post-service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await PostService.getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: "Artigo não encontrado",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function NoticiaDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await PostService.getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
        <div className="space-y-4 rounded-[2rem] border border-border-subtle bg-white p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {post.isFeatured ? (
              <Badge className="bg-primary/10 text-primary border-primary/10">
                Destaque
              </Badge>
            ) : null}
            <span className="text-sm text-text-muted">
              por {post.authorName}
            </span>
          </div>
          <h1 className="text-4xl font-black text-text-main">{post.title}</h1>
          <p className="text-lg text-text-muted">{post.excerpt}</p>
        </div>

        <article className="rounded-[2rem] border border-border-subtle bg-white p-6 md:p-10">
          <div className="whitespace-pre-wrap text-base leading-8 text-text-main">
            {post.content}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
