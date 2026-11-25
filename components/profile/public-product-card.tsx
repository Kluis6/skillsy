import { Star } from "lucide-react";
import { formatRating } from "@skillsy/shared/i18n/format";
import { INTL_LOCALE, type Locale } from "@skillsy/shared/i18n/locales";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import { buttonVariants } from "@/components/ui/button";
import Link from "@/lib/i18n/navigation";
import { productRatingTotals, publicProductPath, type PublicCatalogProduct } from "@/lib/product-catalog";
import { ProductCard } from "./product-card";
import { ProductWhatsAppLink } from "./product-whatsapp-link";

export function PublicProductCard({
  product,
  uid,
  hasCompany,
  locale,
  contactHref,
  t,
}: {
  product: PublicCatalogProduct;
  uid: string;
  hasCompany: boolean;
  locale: Locale;
  contactHref: string | null;
  t: TranslateFn;
}) {
  const { ratingCount, ratingSum } = productRatingTotals(product);
  const score = ratingCount > 0 ? formatRating(ratingSum / ratingCount, INTL_LOCALE[locale]) : null;

  return (
    <ProductCard
      uid={uid}
      product={product}
      locale={locale}
      preview
      rating={score && (
        <span
          role="img"
          aria-label={t("products.ratingAverage", { score })}
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-text-main tabular-nums"
        >
          <Star aria-hidden="true" className="size-3.5 fill-current text-primary" />
          {score}
        </span>
      )}
      actions={
        <>
          <Link
            href={publicProductPath(uid, product.id, hasCompany)}
            prefetch={false}
            aria-label={t("products.viewItemDetails", { name: product.name })}
            className={buttonVariants({
              variant: "outline",
              className: "after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring",
            })}
          >
            {t("products.viewMore")}
          </Link>
          {contactHref && (
            <ProductWhatsAppLink
              contactHref={contactHref}
              product={product}
              locale={locale}
              t={t}
              className="relative z-10 w-auto flex-1"
            />
          )}
        </>
      }
    />
  );
}
