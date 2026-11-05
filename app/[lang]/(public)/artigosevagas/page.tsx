import type { Metadata } from "next";
import HeaderSection from "@/components/headersection";
import { PostListClient } from "@/components/posts/post-list-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { PostService } from "@/services/post-service";
import { getLocale, getMessages, getT } from "@/lib/i18n/server";
import { byOrigin } from "@skillsy/shared/i18n/origin";
import { I18nProvider } from "@/lib/i18n/provider";

// Public data, regenerated at most once an hour (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("posts.metaTitle"),
    description: t("posts.metaDescription"),
    path: "/artigosevagas",
    imageTitle: t("posts.metaImageTitle"),
    imageDescription: t("posts.metaImageDescription"),
    imageLabel: t("posts.metaImageLabel"),
    heroImage: "artigosevagas",
  });
}

export default async function NoticiasPage() {
  const [published, messages, t, locale] = await Promise.all([
    PostService.getPublishedPosts(),
    getMessages("posts"),
    getT(),
    getLocale(),
  ]);
  // From the visitor's country, in the page's language first.
  const posts = byOrigin(published, { language: locale });

  return (
    <div className="min-h-screen bg-surface">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_3hkj2c3hkj2c3hkj.png"
        backgroundImageAlt={t("posts.heroAlt")}
        headlineSegments={[{ text: t("posts.heroTitle") }]}
        description={t("posts.heroText")}
      />
      <main className="container mx-auto space-y-10 px-4 py-4">
        <I18nProvider messages={messages}>
          <PostListClient posts={posts} />
        </I18nProvider>
      </main>
    </div>
  );
}
