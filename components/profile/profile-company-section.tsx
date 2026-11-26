import { ArrowRight, MapPin, Store } from "lucide-react";
import Image from "next/image";
import { getProviderCompanyName } from "@skillsy/shared/providers";
import type { UserProfile } from "@skillsy/shared/types";
import { RecommendationCount } from "@/components/profile/recommendation-summary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { companyProfilePath } from "@/lib/company-profile";
import Link from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import { getCatalogDetails, getCompanyCover, getCompanyLogo } from "@/lib/public-catalog";
import { USE_STORAGE_EMULATOR } from "@/lib/storage-images";

export async function ProfileCompanySection({ profile }: { profile: UserProfile }) {
  const name = getProviderCompanyName(profile);
  if (!name) return null;

  const t = await getT();
  const cover = getCompanyCover(profile, profile.uid);
  const { category, serviceType, location } = getCatalogDetails(profile, t);
  const bio = profile.companyBio?.trim();
  const recommendations = profile.recommendationCount ?? 0;

  return (
    <section aria-labelledby="profile-company-heading" className="col-span-12 min-w-0 border-y border-border-subtle bg-card md:col-span-6 md:only:col-span-12">
      <div className="container mx-auto space-y-4 p-4">
        <h2 id="profile-company-heading" className="text-base font-semibold text-text-main md:text-xl">
          {t("profile.companyHeading")}
        </h2>
        <Link
          href={companyProfilePath(profile.uid)}
          aria-labelledby="profile-company-name profile-company-link"
          className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="gap-0 border border-border-subtle pt-0 ring-0 transition-shadow group-hover:shadow-md">
            <div className="relative h-26 bg-radial-[at_25%_25%] from-primary/70 to-primary">
              {cover && (
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  unoptimized={USE_STORAGE_EMULATOR}
                  className="object-cover"
                />
              )}
              {recommendations > 0 && (
                <Badge variant="outline" className="absolute top-3 end-3 h-auto border-primary/25 bg-card py-1 ps-1 pe-2">
                  <RecommendationCount recommendationCount={recommendations} compact withAvatar />
                </Badge>
              )}
            </div>
            <CardHeader className="gap-2 pb-4">
              <Avatar className="z-10 -mt-8 size-16 overflow-hidden bg-card after:hidden" aria-hidden="true">
                <AvatarImage src={getCompanyLogo(profile)} alt="" className="object-contain" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Store className="size-7" />
                </AvatarFallback>
              </Avatar>
              <CardTitle>
                <h3 id="profile-company-name" className="wrap-anywhere text-lg font-semibold text-text-main">{name}</h3>
              </CardTitle>
              {serviceType && <p className="wrap-anywhere text-sm text-text-muted">{serviceType}</p>}
              {(category || location) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  {category && <Badge variant="secondary" className="max-w-full truncate">{category}</Badge>}
                  {location && (
                    <p className="flex min-w-0 items-center gap-1.5 text-sm text-text-muted">
                      <MapPin className="size-4 shrink-0" aria-hidden="true" />
                      <span className="wrap-anywhere">{location}</span>
                    </p>
                  )}
                </div>
              )}
              {bio && <CardDescription className="line-clamp-2 wrap-anywhere">{bio}</CardDescription>}
            </CardHeader>
            <CardFooter className="justify-end border-border-subtle">
              <span id="profile-company-link" className="inline-flex items-center gap-2 font-semibold text-primary">
                {t("products.viewCompany")}
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </section>
  );
}
