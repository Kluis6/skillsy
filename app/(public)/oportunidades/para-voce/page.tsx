import type { Metadata } from "next";
import { OpportunitiesClient } from "@/components/opportunities-client";
import { createPublicMetadata } from "@/lib/public-metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Oportunidades para você",
  description: "Pedidos compatíveis com seu perfil profissional no Skillsy.",
  path: "/oportunidades/para-voce",
  imageTitle: "Oportunidades para profissionais",
  imageDescription: "Veja pedidos compatíveis com seu serviço e área de atuação.",
  imageLabel: "Oportunidades",
});

export default function OpportunitiesForYouPage() {
  return <OpportunitiesClient initialOpportunities={[]} mode="for-you" />;
}
