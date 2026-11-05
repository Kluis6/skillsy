import type { Metadata } from "next";
import { FeatureCard } from "@/components/ui/feature-card";
import Link from "next/link";
import { ArrowRight, Compass, Lightbulb, Users } from "lucide-react";
import Image from "next/image";
import HeaderSection, {
  type HeaderTextSegment,
} from "@/components/headersection";
import { createPublicMetadata } from "@/lib/public-metadata";
import { getT } from "@/lib/i18n/server";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("about.metaTitle"),
    description: t("about.metaDescription"),
    path: "/weareskillsy",
    imageTitle: t("about.metaImageTitle"),
    imageDescription: t("about.metaImageDescription"),
    imageLabel: t("about.metaImageLabel"),
    heroImage: "weareskillsy",
  });
}



const values = [
  { title: "about.value1Title", description: "about.value1Text", icon: Compass },
  { title: "about.value2Title", description: "about.value2Text", icon: Users },
  { title: "about.value3Title", description: "about.value3Text", icon: Lightbulb },
] as const;

// The headline with its highlighted words, in the page's language.
function headlineSegments(t: TranslateFn): HeaderTextSegment[] {
  const words: Record<string, string> = {
    talent: t("about.headlineTalent"),
    trust: t("about.headlineTrust"),
    services: t("about.headlineServices"),
  };
  return t("about.headline")
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((part) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      return name && name in words ? { text: words[name], className: "text-white" } : { text: part };
    });
}

export default async function WeAreSkillsyPage() {
  const t = await getT();
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_d74ovcd74ovcd74o.png"
        backgroundImageAlt={t("about.heroAlt")}
        headlineSegments={headlineSegments(t)}
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full  bg-card p-4 shadow-sm xl:p-8 border border-border-subtle">
          <div className="grid grid-cols-12 gap-2 md:gap-4 md:gap-y-8 xl:gap-8 gap-y-8">
            <div className="col-span-12 space-y-4">
              <h3 className="text-2xl font-bold">{t("about.beSkillsy")}</h3>
              <p className="text-base font-normal">
                {t("about.beSkillsyText")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 container my-24">
        <div className="grid grid-cols-12 gap-4 xl:gap-8 gap-y-8">
          <div className="col-span-12 md:col-span-12 lg:col-span-4">
            <div className="bg-cover relative h-[50vh] overflow-hidden bg-[url(/Gemini_Generated_Image_5g468e5g468e5g46.png)]">
              <div className="bottom-0 absolute bg-black/80 w-full left-0 p-4">
                <h3 className="font-bold text-white text-base">
                  {t("about.card1Title")}
                </h3>
                <p className="mt-2 text-sm font-normal text-white/90">
                  {t("about.card1Text")}
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="bg-cover relative h-[50vh] overflow-hidden bg-[url(/Gemini_Generated_Image_bgs04bbgs04bbgs0.png)]">
              <div className="bottom-0 absolute bg-black/80 w-full left-0 p-4">
                <h3 className="font-bold text-white text-base">
                  {t("about.card2Title")}
                </h3>
                <p className="mt-2 text-sm font-normal text-white/90">
                  {t("about.card2Text")}
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="bg-cover relative h-[50vh] overflow-hidden bg-[url(/Gemini_Generated_Image_dzdzcqdzdzcqdzdz.png)]">
              <div className="bottom-0 absolute bg-black/80 w-full left-0 p-4">
                <h3 className="font-bold text-white text-base">
                  {t("about.card3Title")}
                </h3>
                <p className="mt-2 text-sm font-normal text-white/90">
                  {t("about.card3Text")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-surface my-24">
        <div className="mx-auto px-4 container py-18">
          <div className="grid grid-cols-12 gap-4 gap-y-8">
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-text-main">
                  {t("about.missionTitle")}
                </h3>
                <p className="text-base font-normal text-text-muted">
                  {t("about.missionText1")}
                </p>
                <p className="text-base font-normal text-text-muted">
                  {t("about.missionText2")}
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-main">
                    {t("about.strengthenTitle")}
                  </h3>
                  <p className="text-base font-normal text-text-muted">
                    {t("about.strengthenText")}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="w-full md:h-full h-90 relative overflow-hidden ">
                <Image
                  src={"/Gemini_Generated_Image_g8p7zcg8p7zcg8p7.png"}
                  alt={t("about.presentingAlt")}
                  className="object-top object-cover"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 my-24">
        <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
          <div className="col-span-12">
            <div className="space-y-4">
              <h2 className="text-xl 2xl:text-2xl font-bold text-text-main">
                {t("about.valuesTitle")}
              </h2>
              <p className="text-base font-normal text-text-muted">
                {t("about.valuesText")}
              </p>
            </div>
          </div>
          {values.map((value) => (
            <FeatureCard
              key={value.title}
              icon={value.icon}
              title={t(value.title)}
              description={t(value.description)}
              // Same as the home profile cards at rest: border, no shadow.
              className="col-span-12 shadow-none lg:col-span-4"
            />
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4 my-24">
        <section className="mt-12 grid grid-cols-12 gap-y-8 gap-4 lg:gap-8">
          <div className="col-span-12 lg:col-span-6 bg-surface border border-border-subtle p-4 md:p-8 lg:p-10 space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-text-main">
              {t("about.notTitle")}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-text-muted">
              <p>
                {t("about.notText1")}
              </p>
              <p>
                {t("about.notText2")}
              </p>
              <p>
                {t("about.notText3")}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-8 xl:p-10 space-y-4 col-span-12 lg:col-span-6">
            <h2 className="text-xl md:text-2xl font-bold text-text-main">
              {t("about.howTitle")}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-text-muted">
              <p>
                {t("about.howText1")}
              </p>
              <p>
                {t("about.howText2")}
              </p>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row">
              <Link
                href="/join"
                className="inline-flex items-center justify-center bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 w-full"
              >
                {t("about.joinButton")}
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link
                href="/donation"
                className="inline-flex items-center justify-center w-full border border-border-subtle bg-card px-6 py-3 text-base font-bold text-text-main transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("about.supportButton")}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="container mx-auto px-4 mb-24">
        <section className="border border-warning-border bg-warning-surface p-4  md:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-xl font-bold text-warning-foreground">
              {t("about.noticeTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-warning-foreground">
              {t("about.noticeText1")}
            </p>
            <p className="text-sm leading-relaxed text-warning-foreground">
              {t("about.noticeText2")}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
