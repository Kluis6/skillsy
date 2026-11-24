import { notFound } from "next/navigation";
import { getTFor } from "@/lib/i18n/translator";
import { createPageOgImage, loadCompanyCoverOgImage, ogContentType, ogSize } from "@/lib/og-image-templates";
import { getCatalogDetails, getCatalogProvider, getCompanyCover } from "@/lib/public-catalog";
import { isActiveProvider } from "@/services/user-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Skillsy - Empresa";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id, lang } = await params;
  const profile = await getCatalogProvider(id);
  const name = profile?.companyName?.trim();
  if (!isActiveProvider(profile) || !name) notFound();

  const t = getTFor(lang);
  const { serviceType, category, location, bio } = getCatalogDetails(profile, t);
  const cover = getCompanyCover(profile, id);
  const image = await loadCompanyCoverOgImage(cover, id) ??
    (cover !== profile.bannerURL ? await loadCompanyCoverOgImage(profile.bannerURL, id) : undefined);

  return createPageOgImage({
    image,
    title: name,
    label: [serviceType || category, location].filter(Boolean).join(" · ") || t("products.profileTitle"),
    description: bio || t("products.publicDescription", { name }),
  });
}
