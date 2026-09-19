import {
  createPageOgImage,
  loadHeroOgImage,
  ogContentType,
  ogSize,
} from "@/lib/og-image-templates";

export const runtime = "nodejs";
export const alt = "Skillsy - Onde talentos encontram oportunidades";
export const size = ogSize;
export const contentType = ogContentType;

// Home page thumbnail (also the fallback for routes without their own).
export default async function OpenGraphImage() {
  return createPageOgImage({
    image: await loadHeroOgImage("home"),
    label: "Rede de confiança entre membros",
    title: "Onde talentos encontram oportunidades",
    description:
      "O Skillsy conecta membros, profissionais e negócios em uma rede onde indicação, confiança e propósito caminham juntos.",
  });
}
