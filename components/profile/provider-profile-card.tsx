"use client";

import Image from "next/image";
import Link from "@/lib/i18n/navigation";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RecommendationCount } from "@/components/profile/recommendation-summary";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatRating } from "@skillsy/shared/i18n/format";
import { INTL_LOCALE } from "@skillsy/shared/i18n/locales";
import { getProviderCompanyName } from "@skillsy/shared/providers";
import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import { useLabels } from "@/lib/i18n/labels";
import { MembershipMark } from "@/components/ui/trust-signals";
import { LanguageBadge } from "@/components/language-badge";
import { UserProfile } from "@/models/types";
import { cn } from "@/lib/utils";
import { companyProfilePath } from "@/lib/company-profile";
import { storageImageUrl } from "@/lib/storage-images";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

type ProviderProfileCardProps = {
  provider: UserProfile;
  variant?: "grid" | "list";
  className?: string;
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "S";
}

function getRoleLabel(provider: UserProfile, t: TranslateFn, category: (value?: string) => string) {
  return (
    provider.serviceType ||
    category(provider.category) ||
    (provider.isProvider ? t("card.roleProvider") : t("card.roleMember"))
  );
}

function ProviderRating({
  rating,
  reviewCount,
}: {
  rating?: number;
  reviewCount: number;
}) {
  const t = useT();
  const locale = useLocale();

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1 text-xs text-text-muted">
      <Star className="size-3.5" aria-hidden="true" />
      {formatRating(rating, INTL_LOCALE[locale])}
      <span>({t("common.reviews", { count: reviewCount })})</span>
    </span>
  );
}

function getBioPreview(provider: UserProfile, t: TranslateFn) {
  return provider.bio || t("card.bioFallback");
}

export function ProviderProfileCard({
  provider,
  variant = "grid",
  className,
}: ProviderProfileCardProps) {
  const t = useT();
  const labels = useLabels();
  const location = provider.publicState;
  const roleLabel = getRoleLabel(provider, t, labels.category);
  const reviewCount = provider.reviewCount || 0;
  const recommendationCount = provider.recommendationCount || 0;
  const initial = getInitial(provider.name);
  const recommendations = recommendationCount > 0 ? (
    <Badge variant="outline" className="h-auto shrink-0 border-primary/25 bg-card py-1 ps-1 pe-2.5">
      <RecommendationCount recommendationCount={recommendationCount} compact withAvatar className="gap-2 text-sm font-bold" />
    </Badge>
  ) : null;
  const secondarySignal = reviewCount > 0 ? (
    <ProviderRating rating={provider.rating} reviewCount={reviewCount} />
  ) : recommendationCount === 0 ? (
    <span className="text-sm text-text-muted">{t("card.newInCommunity")}</span>
  ) : null;

  if (variant === "list") {
    const companyName = getProviderCompanyName(provider);
    const companyLogo = companyName && provider.companyLogoImageName
      ? storageImageUrl(provider.uid, "company-logo", provider.companyLogoImageName)
      : undefined;
    const name = companyName || provider.name;
    const description = (companyName && provider.companyBio?.trim()) || getBioPreview(provider, t);

    return (
      <Link
        href={companyName ? companyProfilePath(provider.uid) : `/profile/${provider.uid}`}
        className={cn("group block border border-border-subtle bg-card shadow-xs transition-shadow hover:shadow-md", className)}
      >
        <article className="p-4 md:p-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex items-center">
                <Avatar className={cn("size-12", companyName && "overflow-hidden bg-card after:hidden")}>
                  <AvatarImage src={companyName ? companyLogo : provider.photoURL} alt="" className={cn(companyName && "object-contain")} />
                  <AvatarFallback className="bg-primary text-base font-bold text-primary-foreground">
                    {getInitial(name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-bold leading-tight wrap-anywhere text-text-main">
                      {name}
                    </h3>
                    {!companyName && <MembershipMark profile={provider} />}
                    <LanguageBadge item={provider} />
                  </div>

                  <p className="line-clamp-1 text-sm font-normal text-text-muted">
                    {roleLabel}
                  </p>
                </div>
              </div>
              {recommendations}
            </div>
            <div className="">
              <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-text-muted">
                {description}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {!companyName && secondarySignal}
                {location ? (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium">
                    <MapPin className="mr-1 size-3.5" />
                    {location}
                  </span>
                ) : null}
                {provider.category ? (
                  <span className="px-3 py-1 text-xs font-medium">
                    {labels.category(provider.category)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* <div className="flex items-center  justify-between border-t border-border-subtle pt-4 md:flex-col md:items-end md:justify-center md:border-t-0 md:pt-0">
            <span className="text-sm font-semibold text-primary">
              Ver perfil
            </span>
            <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
          </div> */}
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={`/profile/${provider.uid}`}
      className={cn(
        "group block h-full overflow-hidden border bg-card transition-all hover:shadow-2xl active:scale-95 active:transition-transform active:shadow-lg",
        className,
      )}
    >
      <Card className="relative mx-auto h-full w-full border-none pt-0 shadow-none">
        <div className="relative w-full">
          {provider.bannerURL ? (
            <Image
              src={provider.bannerURL}
              alt={t("card.coverAlt", { name: provider.name })}
              width={768}
              height={180}
              className="relative z-20 h-30 w-full object-cover brightness-70 dark:brightness-50"
            />
          ) : (
            <div className="h-30 bg-radial-[at_25%_25%] from-primary/70 to-primary" />
          )}
          {provider.companyName ? (
            <p className="absolute bottom-3 right-4 z-30 max-w-[70%] truncate text-sm font-semibold text-white drop-shadow">
              {provider.companyName}
            </p>
          ) : null}
        </div>

        {recommendations ? (
          <div className="absolute end-4 top-4 z-30">{recommendations}</div>
        ) : null}

        <CardHeader className="rounded-t-none w-full">
          <div className="-mt-18 z-30 flex items-end justify-between gap-3">
            <Avatar className="size-26 border-4 border-card bg-card shadow-sm">
              <AvatarImage src={provider.photoURL} />
              <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
                {initial}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardAction className="">
            {location ? (
              <Badge variant="secondary" className="">
                <MapPin className="" />
                {location}
              </Badge>
            ) : null}
          </CardAction>
          <CardTitle className="w-full flex flex-col col-span-4">
            <span className="flex items-center gap-1.5">
              {provider.name}
              <MembershipMark profile={provider} />
              <LanguageBadge item={provider} />
            </span>
            <p className="text-sm font-normal text-text-muted">{roleLabel}</p>
          </CardTitle>
          <CardDescription className="line-clamp-2 col-span-4">
            {getBioPreview(provider, t)}
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto flex items-center justify-between gap-2">
          {secondarySignal}
          <span className="ms-auto inline-flex shrink-0 items-center text-sm font-semibold text-primary">
            {t("card.viewProfile")}
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
