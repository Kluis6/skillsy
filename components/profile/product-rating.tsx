"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/hooks/use-auth";
import { useLocale, useT } from "@/lib/i18n/provider";
import { PRODUCT_RATING_SCORES, type ProductRatingScore, type ProductRatingTotals } from "@/lib/product-catalog";
import { cn } from "@/lib/utils";
import { CatalogError, ProductService } from "@/services/product-service";
import { ProductRatingStars } from "./product-rating-stars";

type RatingVote = { raterId: string; score: number };

export function ProductRating({
  ownerId,
  productId,
  revision,
  createdAt,
  initialTotals,
}: {
  ownerId: string;
  productId: string;
  revision: string;
  createdAt?: string;
  initialTotals: ProductRatingTotals;
}) {
  const t = useT();
  const locale = useLocale();
  const { user, profile } = useAuth();
  const raterId = user && user.uid !== ownerId && user.uid === profile?.uid && !profile.isBlocked && !profile.isDeleted
    ? user.uid : undefined;
  const [ownVote, setOwnVote] = useState<RatingVote | null>(null);
  const [saved, setSaved] = useState<(RatingVote & ProductRatingTotals) | null>(null);
  const [pendingScore, setPendingScore] = useState<ProductRatingScore | null>(null);

  useEffect(() => {
    if (!raterId) return;
    let ignore = false;
    const loadVote = async () => {
      const score = await ProductService.getOwnRating(ownerId, productId, raterId, createdAt).catch(() => 0);
      if (!ignore) setOwnVote({ raterId, score });
    };
    void loadVote();
    return () => { ignore = true; };
  }, [createdAt, ownerId, productId, raterId]);

  const vote = saved?.raterId === raterId ? saved : ownVote?.raterId === raterId ? ownVote : null;
  const confirmedScore = vote?.score ?? 0;
  const selectedScore = pendingScore ?? confirmedScore;
  const totals = saved ?? initialTotals;
  const displayTotals = pendingScore === null ? totals : {
    ratingSum: totals.ratingSum + pendingScore - confirmedScore,
    ratingCount: totals.ratingCount + (confirmedScore === 0 ? 1 : 0),
  };

  async function submit(score: ProductRatingScore) {
    if (!raterId || pendingScore !== null || score === confirmedScore) return;
    setPendingScore(score);
    try {
      const updated = await ProductService.rate(ownerId, { id: productId, revision }, raterId, score);
      setSaved({ raterId, score, ...updated });
    } catch (error) {
      toast.error(t(error instanceof CatalogError ? "products.ratingStale" : "products.ratingError"));
    } finally {
      setPendingScore(null);
    }
  }

  return (
    <div className="space-y-3">
      <div aria-live="polite">
        <ProductRatingStars totals={displayTotals} locale={locale} t={t} />
      </div>
      {raterId && (
        <div>
          <p className="text-xs font-medium text-text-muted">{t("products.yourRating")}</p>
          {vote ? (
            <ToggleGroup
              aria-label={t("products.yourRating")}
              aria-busy={pendingScore !== null}
              spacing={0}
              size="lg"
              value={selectedScore ? [String(selectedScore)] : []}
              onValueChange={(values) => {
                const score = PRODUCT_RATING_SCORES.find((item) => String(item) === values[0]);
                if (score) void submit(score);
              }}
            >
              {PRODUCT_RATING_SCORES.map((score) => (
                <ToggleGroupItem
                  key={score}
                  value={String(score)}
                  aria-label={t("products.ratingOption", { count: score })}
                  className="text-text-muted aria-pressed:bg-primary/10"
                >
                  <Star aria-hidden="true" className={cn("size-5", score <= selectedScore && "fill-current text-primary")} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : (
            <Skeleton className="my-1 h-9 w-55 max-w-full" />
          )}
        </div>
      )}
    </div>
  );
}
