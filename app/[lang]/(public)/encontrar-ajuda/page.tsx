import type { Metadata } from "next";
import { OpportunitiesClient } from "@/components/opportunities-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { OpportunityService } from "@/services/opportunity-service";
import { getMessages, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";

// Public data, regenerated at most once an hour (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("opportunities.helpMetaTitle"),
    description: t("opportunities.helpMetaDescription"),
    path: "/encontrar-ajuda",
    imageTitle: t("opportunities.helpMetaImageTitle"),
    imageDescription: t("opportunities.helpMetaImageDescription"),
    imageLabel: t("opportunities.helpMetaImageLabel"),
  });
}

export default async function FindHelpPage() {
  const [opportunities, messages] = await Promise.all([
    OpportunityService.getActive(),
    getMessages("opportunities"),
  ]);
  return (
    <I18nProvider messages={messages}>
      <OpportunitiesClient initialOpportunities={opportunities} mode="help" />
    </I18nProvider>
  );
}
