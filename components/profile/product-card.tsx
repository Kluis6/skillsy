import Image from "next/image";
import type { ReactNode } from "react";
import { INTL_LOCALE, type Locale } from "@skillsy/shared/i18n";
import { productImageUrl, USE_STORAGE_EMULATOR, type ProductDetails } from "@/lib/product-catalog";

export function ProductCard({
  uid,
  product,
  locale,
  actions,
}: {
  uid: string;
  product: ProductDetails;
  locale: Locale;
  actions?: ReactNode;
}) {
  return (
    <article className="flex h-full min-w-0 flex-col border border-border-subtle bg-card">
      {product.imageName && (
        <div className="relative aspect-[4/3] border-b border-border-subtle bg-surface">
          <Image
            src={productImageUrl(uid, product.imageName)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            unoptimized={USE_STORAGE_EMULATOR}
            className="object-contain"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h2 className="text-lg font-semibold wrap-anywhere text-text-main">{product.name}</h2>
        {product.priceCents !== undefined && (
          <p className="font-semibold tabular-nums text-primary">
            {new Intl.NumberFormat(INTL_LOCALE[locale], {
              style: "currency",
              currency: "BRL",
            }).format(product.priceCents / 100)}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere text-text-muted">
          {product.description}
        </p>
        {actions && <div className="mt-auto flex flex-wrap gap-2 pt-3">{actions}</div>}
      </div>
    </article>
  );
}
