import type { Metadata } from "next";
import { OpportunitiesClient } from "@/components/opportunities-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { OpportunityService } from "@/services/opportunity-service";
import { getLocale, getMessages, getT } from "@/lib/i18n/server";
import { byOrigin } from "@skillsy/shared/i18n/origin";
import { I18nProvider } from "@/lib/i18n/provider";

// Public data, regenerated at most once an hour (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("opportunities.metaTitle"),
    description: t("opportunities.metaDescription"),
    path: "/oportunidades",
    imageTitle: t("opportunities.metaImageTitle"),
    imageDescription: t("opportunities.metaImageDescription"),
    imageLabel: t("opportunities.metaImageLabel"),
  });
}

export default async function OpportunitiesPage() {
  const [active, messages, locale] = await Promise.all([
    OpportunityService.getActive(),
    getMessages("opportunities"),
    getLocale(),
  ]);
  // From the visitor's country, in the page's language first.
  const opportunities = byOrigin(active, { language: locale });
  return (
    <I18nProvider messages={messages}>
      <OpportunitiesClient initialOpportunities={opportunities} />
    </I18nProvider>
  );
}
