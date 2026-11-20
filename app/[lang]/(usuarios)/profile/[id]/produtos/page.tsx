import { CalendarDays, Clock, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { whatsappUrl } from "@skillsy/shared/contact";
import type { MessageKey } from "@skillsy/shared/i18n/keys";
import { DAY_LABEL_KEYS } from "@skillsy/shared/i18n/labels";
import { AVAILABILITY_OPTIONS } from "@skillsy/shared/profile-options";
import { ProductCard } from "@/components/profile/product-card";
import { ProductWhatsAppLink } from "@/components/profile/product-whatsapp-link";
import { ProfileToolbar } from "@/components/profile/profile-toolbar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-layout";
import { getLocale, getT } from "@/lib/i18n/server";
import { createPublicMetadata } from "@/lib/public-metadata";
import { ProductService } from "@/services/product-service";
import { isActiveProvider, UserService } from "@/services/user-service";

// Changes to the catalog and visibility should apply on the next visit.
export const dynamic = "force-dynamic";

const getProvider = cache((id: string) => id.includes("/") ? null : UserService.getPublicProfile(id));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [profile, t] = await Promise.all([getProvider(id), getT()]);
  if (!isActiveProvider(profile)) return { title: t("profile.notFound") };

  const name = profile.companyName?.trim() || profile.name;
  return createPublicMetadata({
    title: t("products.publicTitle", { name }),
    description: t("products.publicDescription", { name }),
    path: `/profile/${id}/produtos`,
  });
}

export default async function PublicProductsPage({ params }: Props) {
  const { id } = await params;
  const [profile, t, locale] = await Promise.all([getProvider(id), getT(), getLocale()]);
  if (!isActiveProvider(profile)) notFound();

  const products = await ProductService.listPublic(id).catch((error: unknown) => {
    if (error && typeof error === "object" && "code" in error && error.code === "permission-denied") {
      notFound();
    }
    throw error;
  });

  const name = profile.companyName?.trim() || profile.name;
  const serviceType = profile.serviceType?.trim();
  const bio = profile.companyBio?.trim() || profile.bio?.trim();
  const location = [profile.publicCity?.trim(), profile.publicState?.trim()].filter(Boolean).join(", ");
  const days = AVAILABILITY_OPTIONS.filter((day) => profile.availability?.includes(day));
  const hours = profile.serviceHours?.trim();
  const contactHref = profile.whatsapp ? whatsappUrl(profile.whatsapp) : null;

  return (
    <>
      <ProfileToolbar backHref={`/profile/${id}`} backLabel={t("products.back")} />
      <main className="min-h-screen">
        <section aria-labelledby="catalog-company" className="border-b border-border-subtle bg-card">
          <div className="relative h-40 overflow-hidden bg-linear-to-r from-primary/15 via-primary/5 to-surface sm:h-56 lg:h-64">
            {profile.bannerURL && (
              <Image
                src={profile.bannerURL}
                alt={t("card.coverAlt", { name })}
                fill
                sizes="100vw"
                loading="eager"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <div className="container mx-auto flex flex-col px-4 lg:flex-row lg:items-center lg:gap-10">
            <PageHeader
              className="min-w-0 flex-1 py-5 md:flex-col md:items-start md:py-7"
              title={<span id="catalog-company" className="wrap-anywhere">{name}</span>}
              description={(serviceType || location || bio) && (
                <span className="block space-y-3">
                  {(serviceType || location) && (
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {serviceType && <span className="wrap-anywhere">{serviceType}</span>}
                      {location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-4 shrink-0" aria-hidden="true" />
                          {location}
                        </span>
                      )}
                    </span>
                  )}
                  {bio && <span className="block whitespace-pre-wrap wrap-anywhere">{bio}</span>}
                </span>
              )}
              action={contactHref && (
                <a
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    className: "gap-2 bg-success text-success-foreground hover:bg-success/90",
                  })}
                >
                  <FaWhatsapp aria-hidden="true" />
                  {t("profile.whatsapp")}
                </a>
              )}
            />
            {(days.length > 0 || hours) && (
              <Card className="mb-5 gap-3 border border-border-subtle bg-surface ring-0 lg:my-5 lg:w-full lg:max-w-md">
                <CardHeader>
                  <CardTitle className="font-semibold text-text-main">
                    <h2>{t("profile.availability")}</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    {days.length > 0 && (
                      <div className="space-y-1.5">
                        <dt className="flex items-center gap-2 font-medium text-text-muted">
                          <CalendarDays className="size-4" aria-hidden="true" />
                          {t("profile.serviceDays")}
                        </dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {days.map((day) => (
                            <Badge key={day} variant="secondary" className="h-6">
                              {t(`labels.day.${DAY_LABEL_KEYS[day]}` as MessageKey)}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                    {hours && (
                      <div className="space-y-1">
                        <dt className="flex items-center gap-2 font-medium text-text-muted">
                          <Clock className="size-4" aria-hidden="true" />
                          {t("profile.serviceHours")}
                        </dt>
                        <dd className="whitespace-pre-wrap wrap-anywhere text-text-main">{hours}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section aria-labelledby="catalog-products" className="container mx-auto space-y-4 px-4 py-6 md:py-8">
          <h2 id="catalog-products" className="font-heading text-xl font-semibold text-text-main">
            {t("products.profileTitle")}
          </h2>
          {products.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.id} className="min-w-0">
                  <ProductCard
                    product={product}
                    uid={id}
                    locale={locale}
                    heading="h3"
                    actions={contactHref && (
                      <ProductWhatsAppLink contactHref={contactHref} product={product} locale={locale} t={t} />
                    )}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("products.publicEmpty")} />
          )}
        </section>
      </main>
    </>
  );
}
