import type { Metadata } from "next";
import { OpportunitiesClient } from "@/components/opportunities-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { OpportunityService } from "@/services/opportunity-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPublicMetadata({
  title: "Oportunidades",
  description: "Publique um pedido de ajuda e encontre oportunidades para oferecer seu talento na comunidade Skillsy.",
  path: "/oportunidades",
  imageTitle: "Oportunidades da comunidade",
  imageDescription: "Pedidos de ajuda conectados a profissionais por serviço e localização.",
  imageLabel: "Oportunidades",
});

export default async function OpportunitiesPage() {
  const opportunities = await OpportunityService.getActive();
  return <OpportunitiesClient initialOpportunities={opportunities} />;
}
