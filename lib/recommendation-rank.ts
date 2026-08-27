/**
 * How many community recommendations a professional needs to reach each star
 * tier. Index 0 is the threshold for the 1st star, index 4 for the 5th.
 * Shared so every component ranks professionals the same way.
 */
const RECOMMENDATION_RANK_THRESHOLDS = [1, 3, 6, 11, 21];

export const RECOMMENDATION_RANK_MAX = RECOMMENDATION_RANK_THRESHOLDS.length;

export function getRecommendationRank(recommendationCount: number): number {
  const count = Math.max(0, recommendationCount || 0);
  return RECOMMENDATION_RANK_THRESHOLDS.filter(
    (threshold) => count >= threshold,
  ).length;
}
