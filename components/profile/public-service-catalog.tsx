import { ArrowUpRight, CalendarDays, Clock, MapPin, Store } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { whatsappUrl } from "@skillsy/shared/contact";
import type { MessageKey } from "@skillsy/shared/i18n/keys";
import { DAY_LABEL_KEYS } from "@skillsy/shared/i18n/labels";
import { DEFAULT_LOCALE } from "@skillsy/shared/i18n/locales";
import { localizedPath } from "@skillsy/shared/i18n/routing";
import { AVAILABILITY_OPTIONS } from "@skillsy/shared/profile-options";
import { Navbar } from "@/components/navbar";
import { CompanyEditButton } from "@/components/profile/company-edit-button";
import { CompanyOpeningStatus } from "@/components/profile/company-opening-status";
import { CompanyProductList } from "@/components/profile/company-product-list";
import { CompanyRecommendationSection, ProfileRecommendationCounter, ProfileRecommendationProvider, RecommendProfileButton } from "@/components/profile/profile-recommendations";
import { PublicProfileHeader } from "@/components/profile/public-profile-header";
import { PublicProfileGallery } from "@/components/profile/public-profile-gallery";
import { PublicProfileContacts } from "@/components/profile/public-profile-contacts";
import { PublicProfileReviews, PublicProfileReviewsLoading } from "@/components/profile/public-profile-reviews";
import { PublicReportButton } from "@/components/profile/public-report-button";
import { PublicProductGrid } from "@/components/profile/public-product-grid";
import { PublicShareButton } from "@/components/profile/public-share-button";
import { ProfileToolbar } from "@/components/profile/profile-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-layout";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale, getMessages, getT } from "@/lib/i18n/server";
import Link from "@/lib/i18n/navigation";
import { companyTimeZone, parseServiceHours } from "@/lib/company-hours";
import { COMPANY_PRODUCT_PAGE_SIZE, COMPANY_PRODUCT_PREVIEW_SIZE, companyCatalogPath, publicCatalogPath } from "@/lib/product-catalog";
import { getCatalogDetails, getCatalogProvider, getCompanyCover, getCompanyLogo } from "@/lib/public-catalog";
import { createPublicMetadata } from "@/lib/public-metadata";
import { USE_STORAGE_EMULATOR } from "@/lib/storage-images";
import { cn } from "@/lib/utils";
import { ProductService } from "@/services/product-service";
import { isActiveProvider } from "@/services/user-service";

export async function getCatalogMetadata(id: string, companyPage: boolean, allProducts = false): Promise<Metadata> {
  const [profile, t] = await Promise.all([getCatalogProvider(id), getT()]);
  const companyName = profile?.companyName?.trim();
  if (!isActiveProvider(profile) || (companyPage && !companyName)) {
    return { title: t("profile.notFound") };
  }

  const name = companyName || profile.name;
  const description = companyPage ? getCatalogDetails(profile, t).bio : undefined;
  return createPublicMetadata({
    title: t("products.publicTitle", { name }),
    description: description?.replace(/\s+/g, " ") || t("products.publicDescription", { name }),
    path: allProducts ? companyCatalogPath(id) : publicCatalogPath(id, Boolean(companyName)),
    useRouteOgImage: companyPage,
  });
}

export async function PublicServiceCatalog({ id, companyPage, allProducts = false }: {
  id: string;
  companyPage: boolean;
  allProducts?: boolean;
}) {
  const [profile, t, locale] = await Promise.all([getCatalogProvider(id), getT(), getLocale()]);
  const companyName = profile?.companyName?.trim();
  if (!isActiveProvider(profile) || (companyPage && !companyName)) notFound();
  if (!companyPage && companyName) {
    redirect(localizedPath(companyCatalogPath(id), locale, DEFAULT_LOCALE));
  }

  const productPage = await (companyPage
    ? ProductService.listPublicPage(id, allProducts ? COMPANY_PRODUCT_PAGE_SIZE : COMPANY_PRODUCT_PREVIEW_SIZE)
    : ProductService.listPublic(id).then((items) => ({ items, nextCursor: null }))
  ).catch((error: unknown) => {
    if (error && typeof error === "object" && "code" in error && error.code === "permission-denied") {
      notFound();
    }
    throw error;
  });
  const products = productPage.items;

  const name = companyName || profile.name;
  const { serviceType, category, bio, location } = getCatalogDetails(profile, t);
  const days = AVAILABILITY_OPTIONS.filter((day) => profile.availability?.includes(day));
  const hours = profile.serviceHours?.trim();
  const openingHours = companyPage && days.length > 0 && hours && (profile.country ?? "BR") === "BR"
    ? parseServiceHours(hours)
    : null;
  const contactHref = profile.whatsapp ? whatsappUrl(profile.whatsapp) : null;
  const logo = getCompanyLogo(profile);
  const cover = companyPage ? getCompanyCover(profile, id) : profile.bannerURL;
  const backLink = { href: `/profile/${id}`, label: t("products.back") };
  const companyMessages = companyPage ? await getMessages("profile", "products") : {};
  const coverImage = cover ? (
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
  ) : undefined;
  const availability = (days.length > 0 || hours) && (
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
  );
  const shareAction = <PublicShareButton name={name} href={publicCatalogPath(id, true)} kind="company" />;
  const editAction = <CompanyEditButton ownerId={id} label={t("products.edit")} />;
  const reportAction = <PublicReportButton ownerId={id} ownerName={profile.name} companyName={profile.companyName} />;
  const whatsappAction = contactHref && (
    <a
      href={contactHref}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({
        size: companyPage ? "lg" : "default",
        className: companyPage
          ? "w-full bg-success px-6 font-bold text-success-foreground hover:bg-success/90 active:bg-success/80 md:w-auto"
          : "gap-2 bg-success text-success-foreground hover:bg-success/90",
      })}
    >
      <FaWhatsapp aria-hidden="true" />
      {t("profile.whatsapp")}
    </a>
  );

  const content = (
    <main className="min-h-screen">
      {companyPage ? (
        <>
          <PublicProfileHeader
            cover={coverImage}
            avatar={
              <Avatar className="size-full overflow-hidden bg-card after:hidden" aria-hidden="true">
                <AvatarImage
                  src={logo}
                  alt=""
                  className="object-contain"
                />
                <AvatarFallback className="rounded-full bg-surface text-primary">
                  <Store className="size-10 md:size-14" />
                </AvatarFallback>
              </Avatar>
            }
            avatarBadge={openingHours && (
              <CompanyOpeningStatus
                hours={openingHours}
                days={days}
                timeZone={companyTimeZone(profile.publicState, profile.publicCity)}
                labels={{
                  open: t("products.companyOpen"),
                  closed: t("products.companyClosed"),
                }}
              />
            )}
            identity={
              <>
                <h1 className="text-xl font-bold leading-tight wrap-anywhere text-text-main md:text-3xl">
                  {name}
                </h1>
                {serviceType && <p className="wrap-anywhere text-base text-text-muted">{serviceType}</p>}
                {category && (
                  <Badge variant="secondary" className="bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {category}
                  </Badge>
                )}
                {location && (
                  <div className="flex items-center gap-2 text-sm text-text-main">
                    <MapPin className="size-4.5 shrink-0" aria-hidden="true" />
                    <p className="wrap-anywhere">{location}</p>
                  </div>
                )}
                {bio && (
                  <p className="max-w-3xl text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere text-text-muted">
                    {bio}
                  </p>
                )}
                <Link
                  href={backLink.href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-auto min-h-11 max-w-full justify-start gap-2.5 border-border-subtle bg-card px-3 py-2 whitespace-normal text-text-main hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  <Avatar aria-hidden="true">
                    <AvatarImage src={profile.photoURL} alt="" />
                    <AvatarFallback>{profile.name.trim().charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 wrap-anywhere">
                    <span className="block text-[11px] leading-snug text-text-muted">{t("products.companyOwner")}</span>
                    <span className="block text-sm font-semibold leading-snug">{profile.name}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-text-muted" aria-hidden="true" />
                </Link>
              </>
            }
            coverAside={<ProfileRecommendationCounter hideWhenEmpty />}
            desktopActions={
              <>
                <RecommendProfileButton />
                {reportAction}
                {editAction}
                {shareAction}
                {whatsappAction}
              </>
            }
            mobileActions={
              <>
                <div className="flex flex-wrap justify-end gap-2">
                  <RecommendProfileButton />
                  {reportAction}
                  {editAction}
                  {shareAction}
                </div>
                {whatsappAction}
              </>
            }
          />
          {!allProducts && availability && (
            <section aria-labelledby="company-availability" className="mt-2 border-y border-border-subtle bg-card">
              <div className="container mx-auto space-y-4 p-4">
                <h2 id="company-availability" className="text-base font-semibold text-text-main md:text-xl">
                  {t("profile.availability")}
                </h2>
                {availability}
              </div>
            </section>
          )}
        </>
      ) : (
        <section aria-labelledby="catalog-provider" className="border-b border-border-subtle bg-card">
          <div className="relative h-40 overflow-hidden bg-linear-to-r from-primary/15 via-primary/5 to-surface sm:h-56 lg:h-64">
            {coverImage}
          </div>
          <div className="container mx-auto flex flex-col px-4 lg:flex-row lg:items-center lg:gap-10">
            <PageHeader
              className="min-w-0 flex-1 py-5 md:flex-col md:items-start md:py-7"
              title={<span id="catalog-provider" className="wrap-anywhere">{name}</span>}
              description={(category || serviceType || location || bio) && (
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
                </span>
              )}
              action={contactHref && <div className="flex flex-wrap items-center gap-2">{whatsappAction}</div>}
            />
            {availability && (
              <Card className="mb-5 gap-3 border border-border-subtle bg-surface ring-0 lg:my-5 lg:w-full lg:max-w-md">
                <CardHeader>
                  <CardTitle className="font-semibold text-text-main">
                    <h2>{t("profile.availability")}</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent>{availability}</CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      <section
        aria-labelledby="catalog-products"
        className={companyPage ? "mt-2 border-y border-border-subtle bg-card" : undefined}
      >
        <div className={cn("container mx-auto space-y-4 px-4", companyPage ? "py-4" : "py-6 md:py-8")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="catalog-products"
              className={cn("font-semibold text-text-main", companyPage ? "text-base md:text-xl" : "font-heading text-xl")}
            >
              {t("products.profileTitle")}
            </h2>
            {companyPage && !allProducts && products.length > 0 && (
              <Link href={companyCatalogPath(id)} className={buttonVariants({ variant: "outline" })}>
                {t("products.viewAll")}
              </Link>
            )}
          </div>
          {products.length === 0 ? (
            <EmptyState title={t("products.publicEmpty")} />
          ) : allProducts ? (
            <CompanyProductList key={id} uid={id} contactHref={contactHref} initialPage={productPage} />
          ) : (
            <PublicProductGrid products={products} uid={id} hasCompany={companyPage} locale={locale} contactHref={contactHref} t={t} />
          )}
        </div>
      </section>
      {companyPage && !allProducts && (
        <div className="mt-2 space-y-2">
          <PublicProfileGallery ownerId={id} photos={profile.gallery} />
          <PublicProfileContacts profile={profile} t={t} />
          <div className="border-y border-border-subtle bg-card">
            <div className="container mx-auto grid items-start gap-6 px-4 py-4 lg:grid-cols-[minmax(17rem,1fr)_minmax(0,2fr)] lg:gap-8">
              <CompanyRecommendationSection />
              <Suspense fallback={<PublicProfileReviewsLoading />}>
                <PublicProfileReviews
                  ownerId={id}
                  initialRating={profile.rating}
                  initialCount={profile.reviewCount}
                  company
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  if (companyPage) {
    return (
      <>
        <Navbar backLink={allProducts ? { href: publicCatalogPath(id, true), label: t("products.backToCompany") } : backLink} />
        <I18nProvider messages={companyMessages}>
          <ProfileRecommendationProvider profileId={id} initialCount={profile.recommendationCount ?? 0}>
            {content}
          </ProfileRecommendationProvider>
        </I18nProvider>
      </>
    );
  }

  return (
    <>
      <ProfileToolbar backHref={backLink.href} backLabel={backLink.label} />
      {content}
    </>
  );
}
