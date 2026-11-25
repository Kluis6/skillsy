import { ArrowRight, Store } from "lucide-react";
import { getProviderCompanyName } from "@skillsy/shared/providers";
import type { UserProfile } from "@skillsy/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { companyProfilePath } from "@/lib/company-profile";
import Link from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import { getCompanyLogo } from "@/lib/public-catalog";

export async function ProfileCompanySection({ profile }: { profile: UserProfile }) {
  const name = getProviderCompanyName(profile);
  if (!name) return null;

  const t = await getT();
  const bio = profile.companyBio?.trim();

  return (
    <section aria-labelledby="profile-company-heading" className="border-y border-border-subtle bg-card">
      <div className="container mx-auto space-y-4 p-4">
        <h2 id="profile-company-heading" className="text-base font-semibold text-text-main md:text-xl">
          {t("profile.companyHeading")}
        </h2>
        <Card className="border border-border-subtle bg-surface ring-0">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-14 overflow-hidden bg-card after:hidden" aria-hidden="true">
                <AvatarImage src={getCompanyLogo(profile)} alt="" className="object-contain" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Store className="size-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <CardTitle>
                  <h3 className="wrap-anywhere text-base font-semibold text-text-main">{name}</h3>
                </CardTitle>
                {bio && <CardDescription className="line-clamp-2 wrap-anywhere">{bio}</CardDescription>}
              </div>
            </div>
            <Link
              href={companyProfilePath(profile.uid)}
              className={buttonVariants({ variant: "outline", className: "w-fit max-w-full gap-2" })}
            >
              {t("products.viewCompany")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
