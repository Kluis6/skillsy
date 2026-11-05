import type { Metadata } from "next";
import { FeatureCard } from "@/components/ui/feature-card";
import Image from "next/image";
import {
  ArrowRight,
  Sprout,
  Trophy,
  Users,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import HeaderSection, {
  type HeaderTextSegment,
} from "@/components/headersection";
import { Button } from "@/components/ui/button";
import { createPublicMetadata } from "@/lib/public-metadata";
import Sectionstart from "@/components/sectionstart";
import { getMessages, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("join.metaTitle"),
    description: t("join.metaDescription"),
    path: "/join",
    imageTitle: t("join.metaTitle"),
    imageDescription: t("join.metaImageDescription"),
    imageLabel: t("join.metaImageLabel"),
    heroImage: "join",
  });
}

const highlights = [
  { title: "join.highlight1Title", description: "join.highlight1Text", icon: Users },
  { title: "join.highlight2Title", description: "join.highlight2Text", icon: Trophy },
  { title: "join.highlight3Title", description: "join.highlight3Text", icon: Sprout },
] as const;

// The headline with its highlighted words, in the page's language.
function headlineSegments(t: TranslateFn): HeaderTextSegment[] {
  const highlight = "text-white drop-shadow-sm drop-shadow-black/50";
  const words: Record<string, string> = {
    opportunities: t("join.headlineOpportunities"),
    trust: t("join.headlineTrust"),
    support: t("join.headlineSupport"),
  };
  return t("join.headline")
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((part) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      return name && name in words ? { text: words[name], className: highlight } : { text: part };
    });
}

export default async function JoinPage() {
  const [t, messages] = await Promise.all([getT(), getMessages("join")]);
  return (
    <main className="min-h-screen w-full">
      <HeaderSection
        backgroundImageSrc="/Gemini_Generated_Image_c5bw8sc5bw8sc5bw.png"
        backgroundImageAlt={t("join.heroAlt")}
        headlineSegments={headlineSegments(t)}
        imageClassName="sm:object-top"
      />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full bg-card p-4 shadow-sm xl:p-8 border border-border-subtle">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-text-main">
                {t("join.metaTitle")}
              </h2>
              <p className="text-base font-normal text-text-muted">
                {t("join.intro")}
              </p>
            </div>


            <div className="col-span-12 flex flex-col gap-4 sm:flex-row">
              <AuthModal>
                <Button className="h-12 w-full bg-primary px-6 text-base font-bold text-primary-foreground hover:bg-primary/90 sm:w-auto">
                  {t("join.createAccount")}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </AuthModal>
            </div>
          </div>
        </div>
      </div>

      <I18nProvider messages={messages}>
        <Sectionstart />
      </I18nProvider>

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-text-main 2xl:text-2xl">
                {t("join.strengthenTitle")}
              </h2>
              <p className="text-base font-normal text-text-muted">
                {t("join.strengthenText")}
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-12 gap-4">
              {highlights.map((item) => (
                // Stacked: this column is too narrow for three side by side.
                <FeatureCard
                  key={item.title}
                  icon={item.icon}
                  title={t(item.title)}
                  description={t(item.description)}
                  className="col-span-12"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="my-24 bg-surface">
        <div className="container mx-auto px-4 py-18">
          <div className="grid grid-cols-12 gap-4 gap-y-8">
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-text-main">
                  {t("join.whyTitle")}
                </h2>
                <p className="text-base font-normal text-text-muted">
                  {t("join.whyText1")}
                </p>
                <p className="text-base font-normal text-text-muted">
                  {t("join.whyText2")}
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-text-main">
                    {t("join.findTitle")}
                  </h3>
                  <p className="text-base font-normal text-text-muted">
                    {t("join.findText")}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="relative h-90 w-full overflow-hidden md:h-full">
                <Image
                  src="/Gemini_Generated_Image_lb1x7blb1x7blb1x copy.png"
                  alt={t("join.collaborationAlt")}
                  className="object-cover object-top"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mb-24 px-4">
        <section className="border border-warning-border bg-warning-surface p-4  md:p-8">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-warning-foreground">
              {t("join.noticeTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-warning-foreground">
              {t("join.noticeText1")}
            </p>
            <p className="text-sm leading-relaxed text-warning-foreground">
              {t("join.noticeText2")}
            </p>
          </div>
        </section>
      </div>

      <section className="bg-primary py-20 text-white dark:bg-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold md:text-4xl">
            {t("join.ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85">
            {t("join.ctaText")}
          </p>
          <div className="mt-8 flex justify-center">
            <AuthModal>
              <Button className="h-12 bg-card px-8 text-base font-bold text-primary hover:bg-surface">
                {t("join.ctaButton")}
              </Button>
            </AuthModal>
          </div>
        </div>
      </section>
    </main>
  );
}
