import type { Metadata } from "next";
import { FeatureCard } from "@/components/ui/feature-card";
import HeaderSection from "@/components/headersection";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Equal,
  QrCode,
  Rocket,
  Server,
  Wallet,
} from "lucide-react";
import { PixCopyField } from "@/components/donation/pix-copy-field";
import { createPublicMetadata } from "@/lib/public-metadata";
import { getMessages, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import { rich } from "@/lib/i18n/rich";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("donation.metaTitle"),
    description: t("donation.metaDescription"),
    path: "/donation",
    imageTitle: t("donation.metaTitle"),
    imageDescription: t("donation.metaImageDescription"),
    imageLabel: t("donation.metaImageLabel"),
    heroImage: "donation",
  });
}

const PIX_KEY =
  "00020126330014BR.GOV.BCB.PIX0111103710237185204000053039865802BR5924LUIS ANTONIO DE OLIVEIRA6015DUQUE DE CAXIAS62070503***6304B4C4";
const PIX_QR_CODE_SRC = "/WhatsApp Image 2026-05-28 at 16.02.56.jpeg";

const impactItems = [
  { title: "donation.impact1Title", description: "donation.impact1Text", icon: Server },
  { title: "donation.impact2Title", description: "donation.impact2Text", icon: Rocket },
  { title: "donation.impact3Title", description: "donation.impact3Text", icon: Equal },
] as const;

export default async function DonationPage() {
  const [t, messages] = await Promise.all([getT(), getMessages("donation")]);

  return (
    <main className="min-h-screen w-full bg-surface pb-10">
      <HeaderSection
        backgroundImageSrc="/donate.png"
        backgroundImageAlt={t("donation.heroAlt")}
        headlineSegments={[
          { text: t("donation.heroTitle") },
        ]}
        description={t("donation.heroText")}
      />

      <div className="container mx-auto isolate -mt-8 space-y-10 px-4">
        <section className="border border-border-subtle bg-card p-5 md:p-6 lg:p-8 shadow-xs">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text-main md:text-2xl">
              {t("donation.introTitle")}
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-text-muted">
              {t("donation.introText")}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-12 gap-4 lg:gap-6">
          {impactItems.map((item) => (
            <FeatureCard
              key={item.title}
              icon={item.icon}
              title={t(item.title)}
              description={t(item.description)}
              titleAs="h2"
              className="col-span-12 md:col-span-4"
            />
          ))}
        </section>

        <section className="grid grid-cols-12 gap-4 gap-y-8 lg:gap-6">
          <div className="col-span-12 border border-border-subtle bg-card p-5 md:p-6 lg:col-span-6 lg:p-8 shadow-xs">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="md:flex hidden h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <QrCode size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-text-main">
                    {t("donation.qrTitle")}
                  </h2>
                  <p className="text-sm text-text-muted">
                    {t("donation.qrText")}
                  </p>
                </div>
              </div>

              <div className="mx-auto flex size-70 lg:size-80 items-center justify-center overflow-hidden border border-border-subtle">
                <Image
                  src={PIX_QR_CODE_SRC}
                  alt={t("donation.qrAlt")}
                  width={280}
                  height={280}
                  className="h-auto w-full"
                />
              </div>

              <p className="text-sm leading-relaxed text-text-muted">
                {t("donation.checkRecipient")}
              </p>
            </div>
          </div>

          <div className="col-span-12 border border-border-subtle bg-card p-5 md:p-6 lg:col-span-6 lg:p-8 shadow-xs">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="md:flex hidden h-12 w-12 items-center justify-center bg-highlight/10 text-highlight">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-text-main">
                    {t("donation.copyPasteTitle")}
                  </h2>
                  <p className="text-sm text-text-muted">
                    {t("donation.copyPasteText")}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <I18nProvider messages={messages}>
                  <PixCopyField pixKey={PIX_KEY} />
                </I18nProvider>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-warning-border bg-warning-surface p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <h3 className="text-lg font-bold text-warning-foreground">
                  {t("donation.importantTitle")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-warning-foreground">
                  {t("donation.importantText")}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border-subtle bg-card p-5 shadow-xs">
            <h2 className="text-xl font-bold text-text-main">{t("donation.beforeTitle")}</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-text-muted">
              <p>
                {t("donation.beforeText1")}
              </p>
              <p>
                {rich(t("donation.beforeText2"), {
                  privacy: (
                    <Link
                      href="/privacidade"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {t("donation.privacyLink")}
                    </Link>
                  ),
                  terms: (
                    <Link
                      href="/termos"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {t("donation.termsLink")}
                    </Link>
                  ),
                })}
              </p>
              <p>
                {t("donation.beforeText3")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
