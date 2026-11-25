import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import type { Locale } from "@skillsy/shared/i18n/locales";
import { PublicProductCard } from "@/components/profile/public-product-card";
import type { PublicCatalogProduct } from "@/lib/product-catalog";

export function PublicProductGrid({ products, uid, hasCompany, locale, contactHref, t }: {
  products: readonly PublicCatalogProduct[];
  uid: string;
  hasCompany: boolean;
  locale: Locale;
  contactHref: string | null;
  t: TranslateFn;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <PublicProductCard product={product} uid={uid} hasCompany={hasCompany} locale={locale} contactHref={contactHref} t={t} />
        </li>
      ))}
    </ul>
  );
}
