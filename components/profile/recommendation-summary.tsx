"use client";

import {
  ThumbsUp,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";

export type Recommender = {
  id: string;
  name?: string;
  photoURL?: string;
};

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "S";
}

interface RecommendationCountProps {
  recommendationCount: number;
  size?: number;
  /** Only the number, for tight spots like the card corner badge. */
  compact?: boolean;
  className?: string;
}

/** The platform's headline trust signal: how many members recommend this
 * professional. Star ratings are secondary and live with the comments. */
export function RecommendationCount({
  recommendationCount,
  size = 14,
  compact = false,
  className,
}: RecommendationCountProps) {
  const t = useT();
  const label = t("common.recommendations", { count: recommendationCount });

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold text-primary",
        className,
      )}
      title={compact ? label : undefined}
    >
      <ThumbsUp size={size} aria-hidden="true" className="shrink-0" />
      {compact ? (
        <>
          <span>{recommendationCount}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </span>
  );
}

interface RecommendationSummaryProps {
  recommendationCount: number;
  /** Actual recommenders to show as avatars. Omit when that data wasn't fetched
   * (e.g. list/grid cards) — the count-only fallback is shown instead. */
  recommenders?: Recommender[];
  maxAvatars?: number;
  avatarSize?: "sm" | "default" | "lg";
  className?: string;
}

export function RecommendationSummary({
  recommendationCount,
  recommenders = [],
  maxAvatars = 5,
  avatarSize = "default",
  className,
}: RecommendationSummaryProps) {
  const t = useT();
  const displayed = recommenders.slice(0, maxAvatars);
  const hiddenCount = Math.max(0, recommendationCount - displayed.length);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {displayed.length > 0 ? (
        <AvatarGroup aria-label={t("card.recommendersAria")}>
          {displayed.map((person) => (
            <Tooltip key={person.id}>
              <TooltipTrigger
                render={
                  <Avatar size={avatarSize}>
                    <AvatarImage
                      src={person.photoURL || ""}
                      alt={
                        person.name
                          ? t("card.photoOf", { name: person.name })
                          : t("card.memberWhoRecommended")
                      }
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitial(person.name)}
                    </AvatarFallback>
                  </Avatar>
                }
              />
              <TooltipContent>
                <p>{t("card.recommendedBy", { name: person.name || t("card.memberFallback") })}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {hiddenCount > 0 ? (
            <AvatarGroupCount>+{hiddenCount}</AvatarGroupCount>
          ) : null}
        </AvatarGroup>
      ) : recommendationCount === 0 ? (
        <span className="text-sm text-text-muted">
          {t("card.beFirst")}
        </span>
      ) : null}
    </div>
  );
}
