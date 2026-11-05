import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getPrivacy } from "@/lib/legal";
import { getLocale, getT } from "@/lib/i18n/server";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import { createPublicMetadata } from "@/lib/public-metadata";
import HeaderSection, { HeaderTextSegment } from "@/components/headersection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("legal.privacyTitle"),
    description: t("legal.privacyDescription"),
    path: "/privacidade",
    imageTitle: t("legal.privacyImageTitle"),
    imageDescription: t("legal.privacyImageDescription"),
    imageLabel: t("legal.imageLabel"),
    heroImage: "privacidade",
  });
}

// The headline with its highlighted words, in the page's language.
function headlineSegments(t: TranslateFn): HeaderTextSegment[] {
  const words: Record<string, string> = {
    a: t("legal.privacyHeadlineA"),
    b: t("legal.privacyHeadlineB"),
  };
  return t("legal.privacyHeadline")
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((part) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      return name && name in words ? { text: words[name], className: "text-white" } : { text: part };
    });
}

export default async function PrivacidadePage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_8gh7rv8gh7rv8gh7.png"
        backgroundImageAlt={t("legal.heroAlt")}
        headlineSegments={headlineSegments(t)}
      />
      <LegalDocument
        content={getPrivacy(locale)}
        related={{ href: "/termos", label: t("legal.privacyRelated") }}
      />
    </main>
  );
}
