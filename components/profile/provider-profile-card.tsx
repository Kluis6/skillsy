"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/models/types";
import { shouldShowVerifiedBadge } from "@/lib/member-verification";
import { cn } from "@/lib/utils";

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
    (provider.isProvider ? "Prestador de servico" : "Membro da comunidade")
  );
}

function getBioPreview(provider: UserProfile) {
  return (
    provider.bio ||
    "Perfil da comunidade Skillsy com contexto para voce avaliar, conversar e decidir com mais confianca."
  );
}

export function ProviderProfileCard({
  provider,
  variant = "grid",
  className,
}: ProviderProfileCardProps) {
  const isVerified = shouldShowVerifiedBadge(provider);
  const location = provider.location || "Brasil";
  const roleLabel = getRoleLabel(provider);
  const rating = provider.rating || "0.0";
  const reviewCount = provider.reviewCount || 0;
  const initial = getInitial(provider.name);

  if (variant === "list") {
    return (
      <Link
        href={`/profile/${provider.uid}`}
        className={cn(
          "group block rounded-xl border  border-border-subtle bg-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        <article className="grid gap-4 p-4 md:grid-cols-[auto_1fr_auto] md:gap-6 md:p-6">
          <div className="flex items-center gap-4 md:block md:space-y-3">
            <Avatar className="size-14 border border-border-subtle bg-card md:size-24">
              <AvatarImage src={provider.photoURL} />
              <AvatarFallback className="bg-primary text-xl font-bold text-white md:text-4xl">
                {initial}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-sm font-bold text-highlight md:justify-center">
              <Star className="size-3.5" fill="currentColor" />
              <span>{rating}</span>
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-lg font-bold leading-tight text-text-main md:text-2xl">
                  {provider.name} 
                </h3>
                {isVerified ? (
                  <Badge className="rounded-full border-primary/10 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    <ShieldCheck className="mr-1 size-3.5" />
                    Verificado
                  </Badge>
                ) : null}
              </div>

              <p className="text-sm font-medium text-text-main">
                {provider.companyName
                  ? `${roleLabel} na ${provider.companyName}`
                  : roleLabel}
              </p>
            </div>

            <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-text-muted">
              {getBioPreview(provider)}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-main">
                <MapPin className="mr-1 size-3.5 text-primary" />
                {location}
              </span>
              {provider.category ? (
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-primary">
                  {provider.category}
                </span>
              ) : null}
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted">
                {reviewCount} avaliacao{reviewCount === 1 ? "" : "es"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-4 md:flex-col md:items-end md:justify-center md:border-t-0 md:pt-0">
            <span className="text-sm font-semibold text-primary">
              Ver perfil
            </span>
            <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={`/profile/${provider.uid}`}
      className={cn(
        "group block h-full rounded-xl overflow-hidden border border-border-subtle bg-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <article className="flex h-full flex-col overflow-hidden">
        <div className="relative h-32 bg-surface md:h-40">
          {provider.bannerURL ? (
            <Image
              src={provider.bannerURL}
              alt={`Capa do perfil de ${provider.name}`}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,102,255,0.16),transparent_34%),linear-gradient(135deg,rgba(0,102,255,0.08),rgba(0,163,255,0.08))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-sm font-bold text-highlight shadow-sm dark:bg-slate-950">
            <Star className="size-3.5" fill="currentColor" />
            {rating}
          </div>
          {provider.companyName ? (
            <p className="absolute bottom-3 left-4 max-w-[70%] truncate text-sm font-semibold text-white drop-shadow">
              {provider.companyName}
            </p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="-mt-12 mb-4 flex items-end justify-between gap-3">
            <Avatar className="size-20 border-4 border-card bg-card shadow-sm">
              <AvatarImage src={provider.photoURL} />
              <AvatarFallback className="bg-primary text-3xl font-bold text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
            {isVerified ? (
              <Badge className="mb-1 rounded-full border-primary/10 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="mr-1 size-3.5" />
                Verificado
              </Badge>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-heading text-xl font-bold leading-tight text-text-main">
                {provider.name}
              </h3>
              <p className="text-sm font-medium text-text-main">
                {roleLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-main">
                <MapPin className="mr-1 size-3.5 text-primary" />
                {location}
              </span>
              {provider.category ? (
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-primary">
                  {provider.category}
                </span>
              ) : null}
            </div>

            <p className="line-clamp-3 text-sm leading-relaxed text-text-muted">
              {getBioPreview(provider)}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="text-xs font-medium text-text-muted">
              {reviewCount} avaliacao{reviewCount === 1 ? "" : "es"}
            </span>
            <span className="inline-flex items-center text-sm font-semibold text-primary">
              Ver perfil
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
