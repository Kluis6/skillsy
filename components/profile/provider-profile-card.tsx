"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatReviewCount,
  RecommendationCount,
} from "@/components/profile/recommendation-summary";
import { MembershipMark } from "@/components/ui/trust-signals";
import { UserProfile } from "@/models/types";
import { cn } from "@/lib/utils";
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

function getRoleLabel(provider: UserProfile) {
  return (
    provider.serviceType ||
    provider.category ||
    (provider.isProvider ? "Prestador de serviço" : "Membro da comunidade")
  );
}

function getBioPreview(provider: UserProfile) {
  return (
    provider.bio ||
    "Perfil da comunidade Skillsy com contexto para você avaliar, conversar e decidir com mais confiança."
  );
}

export function ProviderProfileCard({
  provider,
  variant = "grid",
  className,
}: ProviderProfileCardProps) {
  const location = provider.publicState;
  const roleLabel = getRoleLabel(provider);
  const reviewCount = provider.reviewCount || 0;
  const recommendationCount = provider.recommendationCount || 0;
  const initial = getInitial(provider.name);

  if (variant === "list") {
    return (
      <Link
        href={`/profile/${provider.uid}`}
        className={cn("group block border border-border-subtle bg-card shadow-xs transition-shadow hover:shadow-md", className)}
      >
        <article className="grid p-4 md:grid-cols-[auto_1fr_auto] md:p-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Avatar className="size-12">
                  <AvatarImage src={provider.photoURL} />
                  <AvatarFallback className="bg-primary font-bold text-primary-foreground text-base">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-bold leading-tight text-text-main">
                      {provider.name}
                    </h3>
                    <MembershipMark profile={provider} />
                  </div>

                  <p className="line-clamp-1 text-sm font-normal text-text-muted">
                    {provider.companyName
                      ? `${roleLabel} na ${provider.companyName}`
                      : roleLabel}
                  </p>
                </div>
              </div>
            </div>
            <div className="">
              <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-text-muted">
                {getBioPreview(provider)}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <RecommendationCount
                  recommendationCount={recommendationCount}
                  className="px-3 py-1 text-sm"
                />
                {location ? (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium">
                    <MapPin className="mr-1 size-3.5" />
                    {location}
                  </span>
                ) : null}
                {provider.category ? (
                  <span className="px-3 py-1 text-xs font-medium">
                    {provider.category}
                  </span>
                ) : null}
                <span className="px-3 py-1 text-xs text-text-muted">
                  {formatReviewCount(reviewCount)}
                </span>
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
      <Card className="relative mx-auto w-full border-none pt-0 shadow-none">
        <div className="relative w-full">
          {provider.bannerURL ? (
            <Image
              src={provider.bannerURL}
              alt={`Capa do perfil de ${provider.name}`}
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

        {recommendationCount > 0 ? (
          <Badge className="absolute right-4 top-4 z-30 rounded-full bg-black/90 text-sm shadow">
            <RecommendationCount
              recommendationCount={recommendationCount}
              compact
              className="text-white"
            />
          </Badge>
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
              <Badge variant="secondary" className="rounded-full">
                <MapPin className="" />
                {location}
              </Badge>
            ) : null}
          </CardAction>
          <CardTitle className="w-full flex flex-col col-span-4">
            <span className="flex items-center gap-1.5">
              {provider.name}
              <MembershipMark profile={provider} />
            </span>
            <p className="text-sm font-medium text-text-main">{roleLabel}</p>
          </CardTitle>
          <CardDescription className="line-clamp-2 col-span-4">
            {getBioPreview(provider)}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <RecommendationCount
              recommendationCount={recommendationCount}
              className="text-sm"
            />
            <span className="text-xs text-text-muted">
              {formatReviewCount(reviewCount)}
            </span>
          </div>
          <span className="inline-flex items-center text-sm font-semibold text-primary">
            Ver perfil
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
