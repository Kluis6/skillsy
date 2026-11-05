import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getTerms } from "@/lib/legal";
import { getLocale, getT } from "@/lib/i18n/server";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import { createPublicMetadata } from "@/lib/public-metadata";
import HeaderSection, { HeaderTextSegment } from "@/components/headersection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("legal.termsTitle"),
    description: t("legal.termsDescription"),
    path: "/termos",
    imageTitle: t("legal.termsImageTitle"),
    imageDescription: t("legal.termsImageDescription"),
    imageLabel: t("legal.imageLabel"),
    heroImage: "termos",
  });
}

// The headline with its highlighted words, in the page's language.
function headlineSegments(t: TranslateFn): HeaderTextSegment[] {
  const words: Record<string, string> = {
    a: t("legal.termsHeadlineA"),
    b: t("legal.termsHeadlineB"),
  };
  return t("legal.termsHeadline")
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((part) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      return name && name in words ? { text: words[name], className: "text-white" } : { text: part };
    });
}

export default async function TermosPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_sneeobsneeobsnee.png"
        backgroundImageAlt={t("legal.heroAlt")}
        headlineSegments={headlineSegments(t)}
      />
      <LegalDocument
        content={getTerms(locale)}
        related={{ href: "/privacidade", label: t("legal.termsRelated") }}
      />
    </main>
  );
}
