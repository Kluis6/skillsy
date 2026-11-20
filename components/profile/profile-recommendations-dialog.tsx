"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/i18n/provider";
import type { CommunityRecommendation } from "@/models/types";
import { UserService } from "@/services/user-service";
import { RecommendationCount } from "./recommendation-summary";

function RecommendersList({ profileId }: { profileId: string }) {
  const t = useT();
  const [result, setResult] = useState<CommunityRecommendation[] | "error" | null>(null);

  useEffect(() => {
    let active = true;
    UserService.getCommunityRecommendations(profileId).then(
      (recommendations) => {
        if (active) setResult(recommendations);
      },
      () => {
        if (active) setResult("error");
      },
    );
    return () => { active = false; };
  }, [profileId]);

  if (!result) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[1, 2, 3].map((item) => <Skeleton key={item} className="h-10 w-full" />)}
      </div>
    );
  }
  if (result === "error" || result.length === 0) {
    return (
      <p className="text-sm text-text-muted" role="status">
        {t(result === "error" ? "profile.recommendationsLoadError" : "profile.noRecommendations")}
      </p>
    );
  }

  return (
    <ScrollArea className="min-h-0 [&_[data-slot=scroll-area-viewport]]:max-h-[min(60dvh,28rem)]">
      <ul className="divide-y divide-border-subtle pe-3">
        {result.map((person) => {
          const name = person.recommenderName?.trim() || t("card.memberFallback");
          return (
            <li key={person.recommenderId} className="flex items-center gap-3 py-2">
              <Avatar aria-hidden="true">
                {person.recommenderPhotoURL && <AvatarImage src={person.recommenderPhotoURL} alt="" />}
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium wrap-anywhere text-text-main">{name}</span>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}

export function ProfileRecommendationsDialog({
  profileId,
  count,
}: {
  profileId: string;
  count: number;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="secondary"
            size="lg"
            className="bg-primary/10 px-3 hover:bg-primary/15"
            aria-label={t("common.recommendations", { count })}
          />
        }
      >
        <RecommendationCount recommendationCount={count} compact withAvatar className="gap-2 text-lg font-bold" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pe-9">
          <DialogTitle>{t("profile.recommendationsTitle")}</DialogTitle>
        </DialogHeader>
        {open && <RecommendersList profileId={profileId} />}
      </DialogContent>
    </Dialog>
  );
}
