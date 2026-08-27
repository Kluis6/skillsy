"use client";

import { Star } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getRecommendationRank,
  RECOMMENDATION_RANK_MAX,
} from "@/lib/recommendation-rank";

export type Recommender = {
  id: string;
  name?: string;
  photoURL?: string;
};

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "S";
}

interface RecommendationStarsProps {
  recommendationCount: number;
  size?: number;
  className?: string;
}

/** Star-rank badge: fills one more star per recommendation tier, distinct from the review `rating`. */
export function RecommendationStars({
  recommendationCount,
  size = 14,
  className,
}: RecommendationStarsProps) {
  const rank = getRecommendationRank(recommendationCount);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: RECOMMENDATION_RANK_MAX }).map((_, index) => (
              <Star
                key={index}
                size={size}
                className={
                  index < rank ? "text-highlight" : "text-muted-foreground/30"
                }
                fill={index < rank ? "currentColor" : "none"}
              />
            ))}
          </div>
        }
      />
      <TooltipContent>
        <p>
          {recommendationCount} indicaç{recommendationCount === 1 ? "ão" : "ões"}{" "}
          da comunidade
        </p>
      </TooltipContent>
    </Tooltip>
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
  const displayed = recommenders.slice(0, maxAvatars);
  const hiddenCount = Math.max(0, recommendationCount - displayed.length);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <RecommendationStars recommendationCount={recommendationCount} />

      {displayed.length > 0 ? (
        <AvatarGroup aria-label="Membros que indicam este profissional">
          {displayed.map((person) => (
            <Tooltip key={person.id}>
              <TooltipTrigger
                render={
                  <Avatar size={avatarSize}>
                    <AvatarImage
                      src={person.photoURL || ""}
                      alt={
                        person.name ? `Foto de ${person.name}` : "Membro que indicou"
                      }
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitial(person.name)}
                    </AvatarFallback>
                  </Avatar>
                }
              />
              <TooltipContent>
                <p>{person.name || "Membro Skillsy"} indicou</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {hiddenCount > 0 ? (
            <AvatarGroupCount>+{hiddenCount}</AvatarGroupCount>
          ) : null}
        </AvatarGroup>
      ) : (
        <span className="text-sm text-text-muted">
          {recommendationCount > 0
            ? `${recommendationCount} pessoa${recommendationCount === 1 ? "" : "s"} indicam`
            : "Seja a primeira pessoa a indicar"}
        </span>
      )}
    </div>
  );
}
