import { ArrowUpRight, CalendarDays, Clock, MapPin, Store } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { whatsappUrl } from "@skillsy/shared/contact";
import type { MessageKey } from "@skillsy/shared/i18n/keys";
import { CATEGORY_LABEL_KEYS, DAY_LABEL_KEYS } from "@skillsy/shared/i18n/labels";
import { DEFAULT_LOCALE } from "@skillsy/shared/i18n/locales";
import { localizedPath } from "@skillsy/shared/i18n/routing";
import { AVAILABILITY_OPTIONS } from "@skillsy/shared/profile-options";
import { ProductCard } from "@/components/profile/product-card";
import { ProductWhatsAppLink } from "@/components/profile/product-whatsapp-link";
import { ProfileToolbar } from "@/components/profile/profile-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-layout";
import { getLocale, getT } from "@/lib/i18n/server";
import Link from "@/lib/i18n/navigation";
import { companyProfilePath } from "@/lib/company-profile";
import { createPublicMetadata } from "@/lib/public-metadata";
import { storageImageUrl, USE_STORAGE_EMULATOR } from "@/lib/storage-images";
import { ProductService } from "@/services/product-service";
import { isActiveProvider, UserService } from "@/services/user-service";

const getProvider = cache((id: string) =>
  !id || id.includes("/") || id === "." || id === ".." ? null : UserService.getPublicProfile(id)
);

export async function getCatalogMetadata(id: string, companyPage: boolean): Promise<Metadata> {
  const [profile, t] = await Promise.all([getProvider(id), getT()]);
  const companyName = profile?.companyName?.trim();
  if (!isActiveProvider(profile) || (companyPage && !companyName)) {
    return { title: t("profile.notFound") };
  }

  const name = companyName || profile.name;
  return createPublicMetadata({
    title: t("products.publicTitle", { name }),
    description: t("products.publicDescription", { name }),
    path: companyName ? companyProfilePath(id) : `/profile/${id}/produtos`,
  });
}

export async function PublicServiceCatalog({ id, companyPage }: { id: string; companyPage: boolean }) {
  const [profile, t, locale] = await Promise.all([getProvider(id), getT(), getLocale()]);
  const companyName = profile?.companyName?.trim();
  if (!isActiveProvider(profile) || (companyPage && !companyName)) notFound();
  if (!companyPage && companyName) {
    redirect(localizedPath(companyProfilePath(id), locale, DEFAULT_LOCALE));
  }

  const products = await ProductService.listPublic(id).catch((error: unknown) => {
    if (error && typeof error === "object" && "code" in error && error.code === "permission-denied") {
      notFound();
    }
    throw error;
  });

  const name = companyName || profile.name;
  const serviceType = profile.serviceType?.trim();
  const categoryKey = profile.category && CATEGORY_LABEL_KEYS[profile.category as keyof typeof CATEGORY_LABEL_KEYS];
  const category = categoryKey ? t(`labels.category.${categoryKey}` as MessageKey) : profile.category;
  const bio = profile.companyBio?.trim() || profile.bio?.trim();
  const location = [profile.publicCity?.trim(), profile.publicState?.trim()].filter(Boolean).join(", ");
  const days = AVAILABILITY_OPTIONS.filter((day) => profile.availability?.includes(day));
  const hours = profile.serviceHours?.trim();
  const contactHref = profile.whatsapp ? whatsappUrl(profile.whatsapp) : null;
  const logo = profile.companyLogoImageName
    ? storageImageUrl(id, "company-logo", profile.companyLogoImageName)
    : profile.photoURL;
  const cover = companyPage && profile.companyBannerImageName
    ? storageImageUrl(id, "company-banner", profile.companyBannerImageName)
    : profile.bannerURL;

  return (
    <>
      <ProfileToolbar backHref={`/profile/${id}`} backLabel={t("products.back")} />
      <main className="min-h-screen">
        <section aria-labelledby="catalog-company" className="border-b border-border-subtle bg-card">
          <div className="relative h-40 overflow-hidden bg-linear-to-r from-primary/15 via-primary/5 to-surface sm:h-56 lg:h-64">
            {cover && (
              <Image
                src={cover}
                alt=""
                fill
                sizes="100vw"
                loading="eager"
                unoptimized={USE_STORAGE_EMULATOR}
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <div className="container mx-auto flex flex-col px-4 lg:flex-row lg:items-center lg:gap-10">
            <PageHeader
              className="min-w-0 flex-1 py-5 md:flex-col md:items-start md:py-7"
              title={
                <span id="catalog-company" className="flex items-center gap-3 wrap-anywhere md:gap-4">
                  {companyPage && (
                    <Avatar className="size-14 rounded-none after:rounded-none md:size-16" aria-hidden="true">
                      <AvatarImage
                        src={logo}
                        alt=""
                        className={profile.companyLogoImageName ? "rounded-none object-contain" : "rounded-none"}
                      />
                      <AvatarFallback className="rounded-none bg-primary/10 text-primary">
                        <Store className="size-6" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="min-w-0">{name}</span>
                </span>
              }
              description={(companyPage || category || serviceType || location || bio) && (
                <span className="block space-y-3">
                  {(category || serviceType || location) && (
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {category && <Badge variant="secondary">{category}</Badge>}
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
                  {companyPage && (
                    <Link
                      href={`/profile/${id}`}
                      className="inline-flex max-w-full items-center gap-2.5 border border-border-subtle px-3 py-2 text-text-main hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <Avatar size="sm" aria-hidden="true">
                        <AvatarImage src={profile.photoURL} alt="" />
                        <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 wrap-anywhere">
                        <span className="block text-xs leading-snug text-text-muted">{t("products.companyOwner")}</span>
                        <span className="block text-sm font-semibold leading-snug">{profile.name}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                    </Link>
                  )}
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
