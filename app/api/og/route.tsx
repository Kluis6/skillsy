import {
  createPageOgImage,
  isOgHeroImage,
  loadHeroOgImage,
} from "@/lib/og-image-templates";

export const runtime = "nodejs";

// Share thumbnail for the static public pages (see createPublicMetadata).
// `hero` must be one of the known OG_HERO_IMAGES keys; anything else falls
// back to the default blue background.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hero = searchParams.get("hero");

  return createPageOgImage({
    image: isOgHeroImage(hero) ? await loadHeroOgImage(hero) : undefined,
    label: searchParams.get("label") || "Skillsy",
    title: searchParams.get("title") || "Skillsy",
    description:
      searchParams.get("description") ||
      "Conectando talentos, serviços e confiança em uma comunidade mais próxima.",
  });
}
