import { MyPostsClient } from "@/components/posts/my-posts-client";
import { createPrivateMetadata } from "@/lib/public-metadata";

export const metadata = createPrivateMetadata({
  title: "Minhas Publicações",
  description: "Área restrita para acompanhar suas publicações no Skillsy.",
});

export default function MeusArtigosPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <MyPostsClient />
    </main>
  );
}
