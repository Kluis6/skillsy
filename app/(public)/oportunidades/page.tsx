import type { Metadata } from "next";
import { OpportunitiesClient } from "@/components/opportunities-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { OpportunityService } from "@/services/opportunity-service";

// Public data, regenerated at most once a minute (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 60;

export const metadata: Metadata = createPublicMetadata({
  title: "Oportunidades",
  description: "Publique uma oportunidade e encontre formas de oferecer seu talento na comunidade Skillsy.",
  path: "/oportunidades",
  imageTitle: "Oportunidades da comunidade",
  imageDescription: "Oportunidades conectadas a profissionais por serviço e localização.",
  imageLabel: "Oportunidades",
});

export default async function OpportunitiesPage() {
  const opportunities = await OpportunityService.getActive();
  return <OpportunitiesClient initialOpportunities={opportunities} />;
}
