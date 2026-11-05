import type { Metadata } from "next";
import { OpportunitiesClient } from "@/components/opportunities-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { getMessages, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("opportunities.forYouMetaTitle"),
    description: t("opportunities.forYouMetaDescription"),
    path: "/oportunidades/para-voce",
    imageTitle: t("opportunities.forYouMetaImageTitle"),
    imageDescription: t("opportunities.forYouMetaImageDescription"),
    imageLabel: t("opportunities.metaImageLabel"),
  });
}

export default async function OpportunitiesForYouPage() {
  return (
    <I18nProvider messages={await getMessages("opportunities")}>
      <OpportunitiesClient initialOpportunities={[]} mode="for-you" />
    </I18nProvider>
  );
}
