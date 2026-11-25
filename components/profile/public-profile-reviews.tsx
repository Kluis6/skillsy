import { ProfileReviewsClient } from "@/components/profile/profile-reviews-client";
import { Skeleton } from "@/components/ui/skeleton";
import { UserService } from "@/services/user-service";

export async function PublicProfileReviews({
  ownerId,
  initialRating,
  initialCount,
  company = false,
}: {
  ownerId: string;
  initialRating?: number;
  initialCount?: number;
  company?: boolean;
}) {
  const reviews = await UserService.getRatings(ownerId).catch(() => null);

  return (
    <ProfileReviewsClient
      key={ownerId}
      ownerId={ownerId}
      initialRating={initialRating ?? 0}
      initialCount={initialCount ?? 0}
      initialReviews={reviews}
      company={company}
    />
  );
}

export function PublicProfileReviewsLoading() {
  return (
    <div className="min-w-0 space-y-3" aria-busy="true">
      <Skeleton className="h-6 w-44" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <Skeleton className="h-10 w-52" />
    </div>
  );
}
