import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { PRIVACY } from "@/lib/legal/privacy";
import { createPublicMetadata } from "@/lib/public-metadata";
import HeaderSection, { HeaderTextSegment } from "@/components/headersection";

export const metadata: Metadata = createPublicMetadata({
  title: "Política de Privacidade",
  description:
    "Entenda quais dados a Skillsy trata, como eles são usados e quais direitos você pode exercer em relação à sua privacidade.",
  path: "/privacidade",
  imageTitle: "Política de Privacidade",
  imageDescription:
    "Veja como a Skillsy trata dados, protege informações e apresenta os direitos do titular com mais clareza.",
  imageLabel: "Página jurídica",
  heroImage: "privacidade",
});

const headerHeadlineSegments: HeaderTextSegment[] = [
  { text: " Privacidade com" },
  { text: " clareza", className: "text-white" },
  { text: ", cuidado" },
  { text: " e " },
  { text: "responsabilidade", className: "text-white" },
];

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_8gh7rv8gh7rv8gh7.png"
        backgroundImageAlt="Pessoas e serviços em contexto comunitário"
        headlineSegments={headerHeadlineSegments}
      />
      <LegalDocument
        content={PRIVACY}
        related={{ href: "/termos", label: "Ler os Termos de Uso" }}
      />
    </main>
  );
}
