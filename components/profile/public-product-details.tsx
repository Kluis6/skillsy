import { ArrowUpRight, Store } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { whatsappUrl } from "@skillsy/shared/contact";
import { DEFAULT_LOCALE } from "@skillsy/shared/i18n/locales";
import { localizedPath } from "@skillsy/shared/i18n/routing";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "@/lib/i18n/navigation";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale, getMessages, getT } from "@/lib/i18n/server";
import { formatProductPrice, productImageUrl, productRatingTotals, publicCatalogPath, publicProductPath } from "@/lib/product-catalog";
import { getPublicCatalogItem } from "@/lib/public-catalog";
import { createPublicMetadata } from "@/lib/public-metadata";
import { storageImageUrl, USE_STORAGE_EMULATOR } from "@/lib/storage-images";
import { cn } from "@/lib/utils";
import { ProductRating } from "./product-rating";
import { ProductWhatsAppLink } from "./product-whatsapp-link";
import { PublicShareButton } from "./public-share-button";

type ProductDetailsParams = { id: string; productId: string };

export type ProductDetailsPageProps = { params: Promise<ProductDetailsParams> };

export async function getProductMetadata(
  { id, productId }: ProductDetailsParams,
  companyPage: boolean,
): Promise<Metadata> {
  const [item, t] = await Promise.all([getPublicCatalogItem(id, productId), getT()]);
  if (!item || (companyPage && !item.companyName)) return { title: t("products.itemNotFound") };

  const { product, companyName, profile } = item;
  const description = product.description.replace(/\s+/g, " ");
  return createPublicMetadata({
    title: product.name,
    description: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
    imageLabel: companyName || profile.name,
    path: publicProductPath(id, productId, Boolean(companyName)),
  });
}

export async function PublicProductDetails({
  id,
  productId,
  companyPage,
}: ProductDetailsParams & { companyPage: boolean }) {
  const [item, t, locale] = await Promise.all([getPublicCatalogItem(id, productId), getT(), getLocale()]);
  if (!item || (companyPage && !item.companyName)) notFound();

  const { profile, product, companyName } = item;
  const productHref = publicProductPath(id, productId, Boolean(companyName));
  if (!companyPage && companyName) redirect(localizedPath(productHref, locale, DEFAULT_LOCALE));

  const catalogHref = publicCatalogPath(id, companyPage);
  const sellerName = companyName || profile.name;
  const sellerImage = companyPage && profile.companyLogoImageName
    ? storageImageUrl(id, "company-logo", profile.companyLogoImageName)
    : profile.photoURL;
  const contactHref = profile.whatsapp ? whatsappUrl(profile.whatsapp) : null;
  const messages = await getMessages("profile", "products");

  return (
    <>
      <Navbar backLink={{ href: catalogHref, label: t("products.backToCatalog") }} />
      <main className="container mx-auto px-4 py-4 sm:py-8 lg:py-12">
        <article aria-labelledby="product-name" className={cn("mx-auto", product.imageName ? "max-w-6xl" : "max-w-3xl")}>
          <Card className={cn(
            "gap-0 border border-border-subtle py-0 ring-0",
            product.imageName && "md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-start",
          )}>
            {product.imageName && (
              <div className="border-b border-border-subtle bg-surface md:border-r md:border-b-0 md:self-stretch">
                <div className="relative aspect-[4/3] max-h-[60svh] w-full sm:max-h-none">
                  <Image
                    src={productImageUrl(id, product.imageName)}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1200px) 590px, (min-width: 768px) 51vw, 100vw"
                    loading="eager"
                    unoptimized={USE_STORAGE_EMULATOR}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            <CardContent className="min-w-0 space-y-5 p-5 sm:p-8 lg:p-10">
              <header className="space-y-4">
                <Link
                  href={catalogHref}
                  className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Avatar size="sm" className={cn("shrink-0", companyPage && "rounded-none after:rounded-none")} aria-hidden="true">
                    <AvatarImage src={sellerImage} alt="" className={cn(companyPage && "rounded-none object-contain")} />
                    <AvatarFallback className={cn("bg-primary/10 text-primary", companyPage && "rounded-none")}>
                      {companyPage ? <Store className="size-3.5" /> : sellerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 wrap-anywhere">{sellerName}</span>
                  <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                </Link>
                <h1 id="product-name" className="font-heading text-3xl leading-tight font-semibold wrap-anywhere text-text-main lg:text-4xl">
                  {product.name}
                </h1>
                {product.priceCents !== undefined && (
                  <p className="text-2xl font-semibold tabular-nums text-primary">{formatProductPrice(product.priceCents, locale)}</p>
                )}
              </header>
              <I18nProvider messages={messages}>
                <div className="flex flex-wrap gap-2">
                  <PublicShareButton name={product.name} href={productHref} kind="product" />
                  {contactHref && (
                    <ProductWhatsAppLink contactHref={contactHref} product={product} locale={locale} t={t} size="lg" className="w-auto" />
                  )}
                </div>
              </I18nProvider>
            </CardContent>
            <Separator className="bg-border-subtle md:col-span-full" />
            <CardContent className="min-w-0 p-5 sm:p-8 lg:p-10 md:col-span-full">
              <section aria-labelledby="product-description" className="max-w-prose space-y-2">
                <h2 id="product-description" className="font-heading text-base font-semibold text-text-main">
                  {t("products.description")}
                </h2>
                <p className="text-base leading-relaxed whitespace-pre-wrap wrap-anywhere text-text-muted">
                  {product.description}
                </p>
              </section>
            </CardContent>
            <Separator className="bg-border-subtle md:col-span-full" />
            <CardContent className="min-w-0 p-5 sm:p-8 lg:p-10 md:col-span-full">
              <section aria-labelledby="product-ratings" className="space-y-3">
                <h2 id="product-ratings" className="font-heading text-base font-semibold text-text-main">
                  {t("products.ratings")}
                </h2>
                <I18nProvider messages={messages}>
                  <ProductRating
                    key={`${id}:${product.id}:${product.revision}`}
                    ownerId={id}
                    productId={product.id}
                    revision={product.revision}
                    createdAt={product.createdAt?.valueOf()}
                    initialTotals={productRatingTotals(product)}
                  />
                </I18nProvider>
              </section>
            </CardContent>
          </Card>
        </article>
      </main>
    </>
  );
}
