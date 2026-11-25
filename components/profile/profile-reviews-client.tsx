"use client";

import { useEffect, useId, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { formatRating } from "@skillsy/shared/i18n/format";
import { INTL_LOCALE } from "@skillsy/shared/i18n/locales";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/hooks/use-auth";
import { useLocale, useT, useValidationMessage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { Rating } from "@/models/types";
import { UserService } from "@/services/user-service";

const SCORES = [1, 2, 3, 4, 5];
const COMMENT_LIMIT = 500;

export function ProfileReviewsClient({
  ownerId,
  initialRating,
  initialCount,
  initialReviews,
  company,
}: {
  ownerId: string;
  initialRating: number;
  initialCount: number;
  initialReviews?: readonly Rating[] | null;
  company?: boolean;
}) {
  const { user, profile } = useAuth();
  const t = useT();
  const tv = useValidationMessage();
  const locale = INTL_LOCALE[useLocale()];
  const commentId = useId();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fetchedReviews, setFetchedReviews] = useState<Rating[] | null>();
  const [saved, setSaved] = useState<{ review: Rating; average: number; count: number } | null>(null);
  const availableReviews = initialReviews === undefined ? fetchedReviews : initialReviews;
  const isOwner = user?.uid === ownerId;
  const reviews = saved
    ? [saved.review, ...(availableReviews ?? []).filter((review) => review.id !== saved.review.id)]
    : availableReviews ?? [];
  const comments = reviews.filter((review) => review.comment?.trim());
  const hasReviewed = Boolean(user && reviews.some((review) => review.fromId === user.uid));
  const count = saved?.count ?? Math.max(initialCount, reviews.length);
  const average = saved?.average ?? (reviews.length > initialCount
    ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
    : initialRating);

  useEffect(() => {
    if (initialReviews !== undefined) return;
    let active = true;
    void UserService.getRatings(ownerId).then(
      (items) => { if (active) setFetchedReviews(items); },
      () => { if (active) setFetchedReviews(null); },
    );
    return () => { active = false; };
  }, [initialReviews, ownerId]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || isOwner || hasReviewed || !score || submitting) return;
    setSubmitting(true);
    try {
      const text = comment.trim();
      const totals = await UserService.submitRating(user.uid, ownerId, score, text || undefined);
      setSaved({
        review: {
          id: `${user.uid}_${ownerId}`,
          toId: ownerId,
          fromId: user.uid,
          authorName: totals.authorName,
          score,
          comment: text,
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
        },
        average: totals.ratingSum / totals.reviewCount,
        count: totals.reviewCount,
      });
      setScore(0);
      setComment("");
      toast.success(t("profile.ratingSent"), { description: t("profile.ratingSentText") });
    } catch (error) {
      let message = t("profile.ratingError");
      if (error instanceof Error) {
        try {
          const detail: unknown = JSON.parse(error.message).error;
          if (typeof detail === "string") {
            message = /permission|insufficient/i.test(detail)
              ? t("profile.ratingPermissionError")
              : tv(detail);
          }
        } catch {
          message = tv(error.message);
        }
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="public-profile-reviews" className={company ? "min-w-0" : "border-y border-border-subtle bg-card"}>
      <div className={cn("space-y-5", !company && "container mx-auto p-4")}>
        <div className="space-y-2">
          <h2 id="public-profile-reviews" className="text-base font-semibold text-text-main md:text-xl">
            {t(company ? "products.companyCommentTitle" : "profile.rateTitle")}
          </h2>
          <p className="text-sm text-text-main">
            {t(company ? "products.companyCommentInvitation" : "profile.rateHint")}
          </p>
          {count > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted" aria-live="polite">
              <Star className="size-4 fill-current text-highlight" aria-hidden="true" />
              <span className="font-semibold text-text-main">{formatRating(average, locale)}</span>
              <span>{t("common.reviews", { count })}</span>
            </div>
          )}
        </div>
        {availableReviews === null && <p className="text-sm text-text-muted">{t("profile.ratingsLoadError")}</p>}
        {isOwner ? (
          !company && <p className="text-sm text-text-muted">{t("profile.ownProfileRating")}</p>
        ) : hasReviewed ? (
          <p className="text-sm text-text-muted">{t("profile.alreadyReviewed")}</p>
        ) : !user ? (
          <AuthModal>
            <Button variant="outline">{t(company ? "products.signInToComment" : "profile.signInToRate")}</Button>
          </AuthModal>
        ) : availableReviews === undefined ? (
          <Skeleton className="h-10 w-52 max-w-full" />
        ) : profile?.uid === user.uid && (
          <form onSubmit={submitReview} className="max-w-2xl space-y-3">
            <p className="text-xs text-text-muted">{t("profile.rateHintDetails")}</p>
            <ToggleGroup
              aria-label={t("profile.starsAria")}
              value={score ? [String(score)] : []}
              onValueChange={(values) => setScore(Number(values[0]) || 0)}
              spacing={0}
              disabled={submitting}
              variant="outline"
            >
              {SCORES.map((star) => (
                <ToggleGroupItem key={star} value={String(star)} aria-label={t("profile.stars", { count: star })}>
                  <Star aria-hidden="true" className={cn("text-text-muted", star <= score && "fill-current text-highlight")} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="space-y-2">
              <Label htmlFor={commentId}>{t("profile.comment")}</Label>
              <Textarea
                id={commentId}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t("profile.ratingPlaceholder")}
                maxLength={COMMENT_LIMIT}
                disabled={submitting}
                className="min-h-24"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-text-muted">
                {t("profile.charCount", { count: comment.length, max: COMMENT_LIMIT })}
              </span>
              <Button type="submit" disabled={submitting || !score}>
                {t(submitting ? "profile.sending" : company && comment.trim() ? "products.publishComment" : "profile.sendRating")}
              </Button>
            </div>
          </form>
        )}
        {comments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-main">{t("profile.comments")}</h3>
            <ul className="grid gap-3 lg:grid-cols-2">
              {comments.map((review) => (
                <li key={review.id} className="min-w-0">
                  <Card className="h-full border border-border-subtle bg-surface py-0 ring-0">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="wrap-anywhere text-sm font-semibold text-text-main">{review.authorName || t("card.memberFallback")}</p>
                        <span className="flex items-center gap-0.5 text-highlight" role="img" aria-label={t("profile.stars", { count: review.score })}>
                          {SCORES.map((star) => (
                            <Star key={star} className="size-3.5" fill={review.score >= star ? "currentColor" : "none"} aria-hidden="true" />
                          ))}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap wrap-anywhere text-sm leading-relaxed text-text-main">{review.comment}</p>
                      {typeof review.createdAt?.seconds === "number" && (
                        <p className="text-xs text-text-muted">
                          {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" })
                            .format(new Date(review.createdAt.seconds * 1000))}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
