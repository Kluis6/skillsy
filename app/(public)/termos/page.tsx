import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { TERMS } from "@/lib/legal/terms";
import { createPublicMetadata } from "@/lib/public-metadata";
import HeaderSection, { HeaderTextSegment } from "@/components/headersection";

export const metadata: Metadata = createPublicMetadata({
  title: "Termos de Uso",
  description:
    "Entenda como a Skillsy funciona, os limites da plataforma e as responsabilidades de quem usa o serviço.",
  path: "/termos",
  imageTitle: "Termos de Uso da Skillsy",
  imageDescription:
    "Entenda as regras da plataforma, os limites do serviço e as responsabilidades de quem usa a Skillsy.",
  imageLabel: "Página jurídica",
  heroImage: "termos",
});

const headerHeadlineSegments: HeaderTextSegment[] = [
  { text: "Regras para usar a Skillsy com" },
  { text: " respeito", className: "text-white" },
  { text: " e " },
  { text: "responsabilidade", className: "text-white" },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_sneeobsneeobsnee.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
      />
      <LegalDocument
        content={TERMS}
        related={{ href: "/privacidade", label: "Ler a Política de Privacidade" }}
      />
    </main>
  );
}
