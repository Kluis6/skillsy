import type { Metadata } from "next";
import { OpportunitiesClient } from "@/components/opportunities-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { OpportunityService } from "@/services/opportunity-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPublicMetadata({
  title: "Encontrar ajuda",
  description:
    "Busque profissionais ou publique uma oportunidade para a comunidade Skillsy por serviço, localização e urgência.",
  path: "/encontrar-ajuda",
  imageTitle: "Encontrar ajuda no Skillsy",
  imageDescription:
    "Escolha entre buscar um profissional, publicar uma oportunidade ou ver oportunidades abertas.",
  imageLabel: "Encontrar ajuda",
});

export default async function FindHelpPage() {
  const opportunities = await OpportunityService.getActive();
  return <OpportunitiesClient initialOpportunities={opportunities} mode="help" />;
}
