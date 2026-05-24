import type { Metadata } from "next";
import { MyPostsClient } from "@/components/posts/my-posts-client";

export const metadata: Metadata = {
  title: "Minhas Publicações",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MeusArtigosPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <MyPostsClient />
    </main>
  );
}
