import { Star } from "lucide-react";
import { INTL_LOCALE, type Locale } from "@skillsy/shared/i18n/locales";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import { PRODUCT_RATING_SCORES, type ProductRatingTotals } from "@/lib/product-catalog";

export function ProductRatingStars({ totals, locale, t }: { totals: ProductRatingTotals; locale: Locale; t: TranslateFn }) {
  const average = totals.ratingCount > 0 ? totals.ratingSum / totals.ratingCount : 0;
  const label = totals.ratingCount > 0
    ? t("products.ratingAverage", {
        score: new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 1 }).format(average),
      })
    : t("products.noRatings");

  return (
    <span role="img" aria-label={label} className="flex w-fit items-center gap-1">
      {PRODUCT_RATING_SCORES.map((score) => {
        const fill = Math.max(0, Math.min(1, average - score + 1));
        return (
          <span key={score} aria-hidden="true" className="relative text-text-muted">
            <Star className="size-4" />
            {fill > 0 && (
              <Star
                className="absolute inset-0 size-4 fill-current text-primary"
                style={{ clipPath: `inset(0 ${100 - 100 * fill}% 0 0)` }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}
