"use client";

import { whatsappUrl } from "@skillsy/shared/contact";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/services/user-service";
import { UserProfile } from "@/models/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileReviewsClient } from "@/components/profile/profile-reviews-client";
import { PublicProfileContacts } from "@/components/profile/public-profile-contacts";
import { PublicProfileGallery } from "@/components/profile/public-profile-gallery";
import { PublicProfileHeader } from "@/components/profile/public-profile-header";
import { PublicReportButton } from "@/components/profile/public-report-button";
import { PublicShareButton } from "@/components/profile/public-share-button";
import { ProfileRecommendationCounter, ProfileRecommendationProvider, RecommendProfileButton } from "@/components/profile/profile-recommendations";
import { useT } from "@/lib/i18n/provider";
import { useLabels } from "@/lib/i18n/labels";
import {
  Building2,
  Church,
  Info,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "@/lib/i18n/navigation";
import { companyProfilePath } from "@/lib/company-profile";
import { toast } from "sonner";
import Image from "next/image";
import { ProfilePublicPageLoading } from "@/components/loading/route-loaders";
import { MembershipMark } from "@/components/ui/trust-signals";
import { LanguageBadge } from "@/components/language-badge";
import {
  DialogHeader,
} from "@/components/ui/dialog";
import { Navbar } from "./navbar";
import { AuthModal } from "./auth-modal";
import { LuMapPin, LuPencil, LuUserMinus } from "react-icons/lu";
import { TooltipContent, Tooltip, TooltipTrigger } from "./ui/tooltip";
import { FaWhatsapp } from "react-icons/fa";

interface ProfileDetailClientProps {
  id: string;
  initialProfile: UserProfile | null;
  children?: ReactNode;
}

export function ProfileDetailClient({
  id,
  initialProfile,
  children,
}: ProfileDetailClientProps) {
  const {
    user,
    profile: currentUserProfile,
    toggleContact,
    profile,
    logout,
  } = useAuth();
  const t = useT();
  const labels = useLabels();
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(
    initialProfile,
  );
  const [loading, setLoading] = useState(!initialProfile);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const canToggleContact = Boolean(
    user && targetProfile && targetProfile.uid !== user.uid,
  );
  // Mobile keeps the main contact action on screen while scrolling.
  const showStickyWhatsApp = Boolean(
    targetProfile?.whatsapp && user?.uid !== targetProfile?.uid,
  );
  const publicLocation = [targetProfile?.publicCity, targetProfile?.publicState]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    // We only need to fetch if we don't have the profile yet or to get fresh data
    const fetchProfile = async () => {
      if (!id || initialProfile) return;
      setLoading(true);
      try {
        const p = await UserService.getPublicProfile(id);
        setTargetProfile(p);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error(t("profile.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, initialProfile, t]);

  // The ward is only for signed-in members, so the server leaves it out of the
  // page; load it once the visitor is signed in.
  const [ward, setWard] = useState<string | undefined>();
  useEffect(() => {
    if (!user || !targetProfile?.uid || targetProfile.isProvider) return;
    let active = true;
    UserService.getMemberWard(targetProfile.uid)
      .then((value) => {
        if (active) setWard(value || undefined);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user, targetProfile?.uid, targetProfile?.isProvider]);

  const isContact = currentUserProfile?.contacts?.includes(id);

  const handleToggleContact = async () => {
    if (!user) {
      toast.error(t("profile.loginToConnect"), {
        description: t("profile.loginToConnectText"),
        action: { label: t("common.signIn"), onClick: () => setAuthModalOpen(true) },
      });
      return;
    }

    try {
      await toggleContact(id);
      toast.success(
        isContact ? t("profile.removedFromContacts") : t("profile.addedToContacts"),
      );
    } catch (error) {
      toast.error(t("profile.contactsError"));
    }
  };

  const handleWhatsApp = () => {
    if (!targetProfile?.whatsapp) {
      toast.error(t("profile.noWhatsapp"), {
        description: t("profile.noWhatsappText"),
      });
      return;
    }
    window.open(whatsappUrl(targetProfile.whatsapp) ?? undefined, "_blank");
  };

  if (loading) {
    return <ProfilePublicPageLoading />;
  }

  if (!targetProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <Info size={64} className="text-text-muted mb-6" />
        <h1 className="text-3xl font-bold mb-4">{t("profile.notFound")}</h1>
        <p className="text-text-muted mb-8">
          {t("profile.notFoundText")}
        </p>
        <Link href="/">
          <Button className="bg-primary text-primary-foreground font-bold  px-8">
            {t("profile.backHome")}
          </Button>
        </Link>
      </div>
    );
  }

  const profileRoleLabel =
    targetProfile.serviceType ||
    labels.category(targetProfile.category) ||
    t("profile.communityMember");
  const companyName = targetProfile.companyName?.trim();
  const hasCompanyPage = Boolean(companyName && targetProfile.isProvider);
  const reportAction = !hasCompanyPage && user?.uid !== targetProfile.uid && (
    <PublicReportButton ownerId={targetProfile.uid} ownerName={targetProfile.name} />
  );
  const editProfileLabel = t("profile.editProfile");
  const editProfileAction = (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href="/profile"
            aria-label={editProfileLabel}
            className={buttonVariants({ variant: "outline", size: "icon-lg" })}
          >
            <LuPencil aria-hidden="true" className="text-text-muted" />
          </Link>
        }
      />
      <TooltipContent>{editProfileLabel}</TooltipContent>
    </Tooltip>
  );
  return (
    <ProfileRecommendationProvider
      profileId={targetProfile.isProvider ? targetProfile.uid : undefined}
      initialCount={targetProfile.recommendationCount ?? 0}
      onSignIn={() => setAuthModalOpen(true)}
    >
      <Navbar user={user} profile={profile} logout={logout} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      <main
        className={`w-full h-full ${showStickyWhatsApp ? "pb-20 sm:pb-0" : ""}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <PublicProfileHeader
            cover={
              targetProfile.bannerURL ? (
                <Image
                  src={targetProfile.bannerURL}
                  alt={t("card.coverAlt", { name: targetProfile.name })}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : undefined
            }
            avatar={
              <Avatar className="w-full h-full border-6 border-card bg-card shadow-sm shadow-black/30">
                <AvatarImage
                  src={targetProfile.photoURL}
                  className="object-cover"
                />
                <AvatarFallback className="bg-surface text-primary font-bold text-4xl">
                  {targetProfile.name[0]}
                </AvatarFallback>
              </Avatar>
            }
            identity={
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold leading-tight wrap-anywhere text-text-main md:text-3xl">
                    {targetProfile.name}
                  </h2>
                  <MembershipMark profile={targetProfile} size={20} />
                  <LanguageBadge item={targetProfile} />
                </div>

                <p className="text-base text-text-muted font-normal">
                  {profileRoleLabel}
                </p>
                {(companyName || targetProfile.category) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {companyName && targetProfile.isProvider && (
                      <Link
                        href={companyProfilePath(id)}
                        className="inline-flex min-h-8 items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <Building2 size={18} aria-hidden="true" />
                        <span className="wrap-anywhere">
                          {companyName}
                        </span>
                      </Link>
                    )}
                    {companyName && targetProfile.isProvider && targetProfile.category ? (
                      <span className="font-bold block text-text-main">
                        ·
                      </span>
                    ) : null}
                    {targetProfile.category && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {labels.category(targetProfile.category)}
                      </Badge>
                    )}
                  </div>
                )}

                {publicLocation && (
                  <div className="flex items-center space-x-2">
                    <LuMapPin size={18} className="text-text-main" />
                    <p className="text-sm text-text-main font-normal">
                      {publicLocation}
                    </p>
                  </div>
                )}

                {user && !targetProfile.isProvider && ward && (
                  <div className="flex items-center space-x-2">
                    <Church size={18} className="text-text-main" />
                    <p className="text-sm text-text-main font-normal">
                      {ward}
                    </p>
                  </div>
                )}
              </>
            }
            recommendations={<ProfileRecommendationCounter />}
            desktopActions={
              <>
                <PublicShareButton name={targetProfile.name} href={`/profile/${targetProfile.uid}`} />
                <RecommendProfileButton />
                {reportAction}
                {user?.uid === targetProfile.uid ? (
                  editProfileAction
                ) : (
                  <>
                    {canToggleContact && (
                      <Button
                        size="lg"
                        variant={isContact ? "destructive" : "outline"}
                        onClick={handleToggleContact}
                        className="px-5 font-semibold"
                      >
                        {isContact ? (
                          <>
                            <LuUserMinus /> {t("profile.disconnect")}
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} className="mr-2" /> {t("profile.connect")}
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}

                <Button
                  onClick={handleWhatsApp}
                  size="lg"
                  variant="default"
                  className="rounded-none bg-success px-6 font-bold text-success-foreground hover:bg-success/90 active:bg-success/80"
                >
                  <FaWhatsapp /> <p>{t("profile.whatsapp")}</p>
                </Button>
              </>
            }
            mobileActions={
              <>
                <div className="flex flex-wrap justify-end gap-2">
                  <PublicShareButton name={targetProfile.name} href={`/profile/${targetProfile.uid}`} />
                  <RecommendProfileButton />
                  {reportAction}
                  {user?.uid === targetProfile.uid ? (
                    editProfileAction
                  ) : (
                    <>
                      {canToggleContact && (
                        <Button
                          size="lg"
                          variant={isContact ? "destructive" : "outline"}
                          onClick={handleToggleContact}
                          className="flex-1 px-5 font-semibold"
                        >
                          {isContact ? (
                            <>
                              <LuUserMinus /> {t("profile.disconnect")}
                            </>
                          ) : (
                            <>
                              <UserPlus size={18} className="mr-2" />
                              {t("profile.connect")}
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <Button
                  onClick={handleWhatsApp}
                  variant="default"
                  size="lg"
                  className="w-full bg-success px-6 font-bold text-success-foreground hover:bg-success/90 active:bg-success/80"
                >
                  <FaWhatsapp /> <p>{t("profile.whatsapp")}</p>
                </Button>
              </>
            }
          />

          {/* About Section */}
          <section className="bg-card border-y border-border-subtle">
            <div className="mx-auto container p-4 space-y-4">
              <h2 className="md:text-xl text-base font-semibold text-text-main">
                {t("profile.about")}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap max-w-3xl">
                {targetProfile.bio || t("profile.noBio")}
              </p>
            </div>
          </section>
          {children}

          {!hasCompanyPage && targetProfile.isProvider && (
            <ProfileReviewsClient
              key={targetProfile.uid}
              ownerId={targetProfile.uid}
              initialRating={targetProfile.rating ?? 0}
              initialCount={targetProfile.reviewCount ?? 0}
            />
          )}

          <PublicProfileContacts profile={targetProfile} t={t} />

          {!hasCompanyPage && (
            <PublicProfileGallery ownerId={targetProfile.uid} photos={targetProfile.gallery} />
          )}
        </motion.div>
      </main>

      {showStickyWhatsApp ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border-subtle bg-card/95 p-3 backdrop-blur sm:hidden">
          <Button
            onClick={handleWhatsApp}
            size="lg"
            className="h-12 flex-1 bg-success font-bold text-success-foreground hover:bg-success/90 active:bg-success/80"
          >
            <FaWhatsapp /> {t("profile.whatsapp")}
          </Button>
        </div>
      ) : null}
    </ProfileRecommendationProvider>
  );
}
