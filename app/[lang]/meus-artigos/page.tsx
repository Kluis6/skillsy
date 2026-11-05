import type { Metadata } from "next";
import { MyPostsClient } from "@/components/posts/my-posts-client";
import { createPrivateMetadata } from "@/lib/public-metadata";
import { getMessages, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t("posts.myTitle"),
    description: t("posts.myMetaDescription"),
  });
}

export default async function MeusArtigosPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <I18nProvider messages={await getMessages("posts")}>
        <MyPostsClient />
      </I18nProvider>
    </main>
  );
}
