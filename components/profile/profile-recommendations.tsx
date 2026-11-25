"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BsHandThumbsUp, BsHandThumbsUpFill } from "react-icons/bs";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
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

export function RecommendProfileButton() {
  const t = useT();
  const { canRecommend, recommended, busy, toggle } = useContext(RecommendationContext);
  if (!canRecommend) return null;
  const Icon = recommended ? BsHandThumbsUpFill : BsHandThumbsUp;

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="secondary" size="icon-lg" aria-label={t("profile.recommend")} aria-pressed={recommended} disabled={busy} onClick={toggle} />}
      >
        <Icon aria-hidden="true" className={recommended ? "text-primary" : undefined} />
      </TooltipTrigger>
      <TooltipContent>{t(recommended ? "profile.removeRecommendation" : "profile.recommend")}</TooltipContent>
    </Tooltip>
  );
}

export function ProfileRecommendationCounter({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean }) {
  const { profileId, count } = useContext(RecommendationContext);
  if (!profileId || (hideWhenEmpty && count === 0)) return null;
  return <ProfileRecommendationsDialog key={profileId} profileId={profileId} count={count} />;
}
