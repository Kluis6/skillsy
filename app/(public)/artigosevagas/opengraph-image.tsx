import {
  createMarketingOgImage,
  ogContentType,
  ogSize,
} from "@/lib/og-image-templates";

export const alt = "Skillsy - Notícias, artigos e vagas";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return createMarketingOgImage({
    badge: "Conteúdo público",
    kicker: "Novidades, artigos e vagas",
    title: "Publicações da comunidade com espaço para ideias, oportunidades e serviço",
    description:
      "Acompanhe artigos, vagas e novidades compartilhadas por membros dentro do Skillsy.",
    sideHeading: "Uma página feita para descoberta de conteúdo",
    sideBody:
      "Miniatura pensada para refletir o feed público de artigos e vagas da plataforma.",
    cards: [
      {
        title: "Artigos",
        description: "Reflexões, aprendizados e conteúdo útil da comunidade.",
      },
      {
        title: "Vagas",
        description: "Oportunidades publicadas para fortalecer conexões reais.",
      },
      {
        title: "Compartilhamento",
        description: "Prévia visual pronta para WhatsApp, LinkedIn e outras redes.",
      },
    ],
  });
}
