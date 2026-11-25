import { cache } from "react";
import type { MessageKey, TranslateFn } from "@skillsy/shared/i18n/keys";
import { CATEGORY_LABEL_KEYS } from "@skillsy/shared/i18n/labels";
import type { UserProfile } from "@skillsy/shared/types";
import { storageImageUrl } from "@/lib/storage-images";
import { ProductService } from "@/services/product-service";
import { isActiveProvider, UserService } from "@/services/user-service";

export const getCatalogProvider = cache((id: string) =>
  !id || id.includes("/") || id === "." || id === ".." ? null : UserService.getPublicProfile(id)
);

export const getPublicCatalogItem = cache(async (id: string, productId: string) => {
  const profile = await getCatalogProvider(id);
  if (!isActiveProvider(profile)) return null;

  const product = await ProductService.getPublic(id, productId).catch((error: unknown) => {
    if (error && typeof error === "object" && "code" in error && error.code === "permission-denied") {
      return null;
    }
    throw error;
  });

  return product ? { profile, product, companyName: profile.companyName?.trim() } : null;
});

export function getCatalogDetails(profile: UserProfile, t: TranslateFn) {
  const key = profile.category && CATEGORY_LABEL_KEYS[profile.category as keyof typeof CATEGORY_LABEL_KEYS];
  return {
    category: key ? t(`labels.category.${key}` as MessageKey) : profile.category,
    serviceType: profile.serviceType?.trim(),
    location: [profile.publicCity?.trim(), profile.publicState?.trim()].filter(Boolean).join(", "),
    bio: profile.companyBio?.trim() || profile.bio?.trim(),
  };
}

export function getCompanyCover(profile: UserProfile, id: string) {
  return profile.companyBannerImageName
    ? storageImageUrl(id, "company-banner", profile.companyBannerImageName)
    : profile.bannerURL;
}

export function getCompanyLogo(profile: UserProfile) {
  return profile.companyLogoImageName
    ? storageImageUrl(profile.uid, "company-logo", profile.companyLogoImageName)
    : profile.photoURL;
}
