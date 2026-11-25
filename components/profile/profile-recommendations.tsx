"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BsHandThumbsUp, BsHandThumbsUpFill } from "react-icons/bs";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/lib/i18n/provider";
import { UserService } from "@/services/user-service";
import { ProfileRecommendationsDialog } from "./profile-recommendations-dialog";

const RecommendationContext = createContext<{
  profileId?: string;
  count: number;
  canRecommend: boolean;
  recommended: boolean;
  busy: boolean;
  toggle: () => void;
}>({ count: 0, canRecommend: false, recommended: false, busy: false, toggle: () => {} });

export function ProfileRecommendationProvider({ profileId, initialCount, onSignIn, children }: {
  profileId?: string;
  initialCount: number;
  onSignIn?: () => void;
  children: ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const t = useT();
  const viewerId = user?.uid;
  const canRecommend = Boolean(profileId && viewerId !== profileId);
  const voteKey = viewerId && canRecommend ? `${profileId}/${viewerId}` : undefined;
  const [liveCount, setLiveCount] = useState<{ profileId: string; count: number }>();
  const [vote, setVote] = useState<{ key: string; recommended: boolean }>();
  const [pending, setPending] = useState<{ key: string; recommended: boolean }>();
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    return UserService.watchRecommendationCount(profileId, (count) => setLiveCount({ profileId, count }));
  }, [profileId]);

  useEffect(() => {
    if (!profileId || !viewerId || !voteKey) return;
    return UserService.watchCommunityRecommendation(profileId, viewerId, (recommended) => {
      setVote({ key: voteKey, recommended });
    });
  }, [profileId, viewerId, voteKey]);

  const currentVote = vote?.key === voteKey ? vote : undefined;
  const pendingVote = pending?.key === voteKey ? pending : undefined;
  const recommended = pendingVote?.recommended ?? currentVote?.recommended ?? false;
  const busy = loading || Boolean(voteKey && (!currentVote || pendingVote));
  const count = liveCount && liveCount.profileId === profileId ? liveCount.count : initialCount;

  async function toggle() {
    if (!profileId || !canRecommend || busy) return;
    if (!user || !voteKey) {
      toast.error(t("profile.loginToRecommend"), {
        description: t("profile.loginToRecommendText"),
        action: { label: t("common.signIn"), onClick: onSignIn ?? (() => setSignInOpen(true)) },
      });
      return;
    }

    setPending({ key: voteKey, recommended: !recommended });
    try {
      const saved = await UserService.toggleCommunityRecommendation(user.uid, profileId, {
        name: profile?.name || user.displayName || "Membro Skillsy",
        photoURL: profile?.photoURL || user.photoURL || "",
      });
      setVote({ key: voteKey, recommended: saved });
      toast.success(t(saved ? "profile.recommendationAdded" : "profile.recommendationRemoved"), {
        description: t(saved ? "profile.recommendationAddedText" : "profile.recommendationRemovedText"),
      });
    } catch {
      toast.error(t("profile.recommendationError"));
    } finally {
      setPending(undefined);
    }
  }

  return (
    <RecommendationContext.Provider value={{ profileId, count, canRecommend, recommended, busy, toggle }}>
      {children}
      {signInOpen && <AuthModal open={signInOpen} onOpenChange={setSignInOpen} />}
    </RecommendationContext.Provider>
  );
}

export function RecommendProfileButton({ withLabel = false }: { withLabel?: boolean }) {
  const t = useT();
  const { canRecommend, recommended, busy, toggle } = useContext(RecommendationContext);
  if (!canRecommend) return null;
  const Icon = recommended ? BsHandThumbsUpFill : BsHandThumbsUp;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={withLabel && !recommended ? "default" : "secondary"}
            size={withLabel ? "lg" : "icon-lg"}
            aria-label={withLabel ? undefined : t("profile.recommend")}
            aria-pressed={recommended}
            disabled={busy}
            onClick={toggle}
          />
        }
      >
        <Icon aria-hidden="true" className={recommended ? "text-primary" : undefined} />
        {withLabel && t(recommended ? "profile.youRecommended" : "products.recommendCompany")}
      </TooltipTrigger>
      <TooltipContent>
        {t(recommended ? "profile.removeRecommendation" : withLabel ? "products.recommendCompany" : "profile.recommend")}
      </TooltipContent>
    </Tooltip>
  );
}

export function CompanyRecommendationSection() {
  const t = useT();
  const { canRecommend, profileId, count } = useContext(RecommendationContext);
  if (!profileId) return null;

  return (
    <section aria-labelledby="company-recommendations">
      <Card className="border border-border-subtle bg-primary/5 ring-0">
        <CardHeader className="gap-2">
          <CardTitle>
            <h2 id="company-recommendations" className="text-base font-semibold text-text-main md:text-xl">
              {t(canRecommend ? "products.recommendCompanyTitle" : "products.companyRecommendations")}
            </h2>
          </CardTitle>
          <CardDescription className="text-text-muted">
            {t("products.companyRecommendationsValue")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <RecommendProfileButton withLabel />
          <ProfileRecommendationsDialog key={profileId} profileId={profileId} count={count} compact={false} />
        </CardContent>
      </Card>
    </section>
  );
}

export function ProfileRecommendationCounter({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean }) {
  const { profileId, count } = useContext(RecommendationContext);
  if (!profileId || (hideWhenEmpty && count === 0)) return null;
  return <ProfileRecommendationsDialog key={profileId} profileId={profileId} count={count} />;
}
