import type { Metadata } from "next";
import { PostEditorClient } from "@/components/posts/post-editor-client";
import { createPrivateMetadata } from "@/lib/public-metadata";
import { getMessages, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t("posts.newPost"),
    description: t("posts.newMetaDescription"),
  });
}

export default async function NovoArtigoPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <I18nProvider messages={await getMessages("posts")}>
        <PostEditorClient mode="create" />
      </I18nProvider>
    </main>
  );
}
