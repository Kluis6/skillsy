import { notFound } from "next/navigation";
import { UserService } from "@/services/user-service";
import {
  createProfileOgImage,
  ogContentType,
  ogSize,
} from "@/lib/og-image-templates";
import {
  getMembershipYears,
  shouldShowVerifiedBadge,
} from "@/lib/member-verification";

export const runtime = "nodejs";
export const alt = "Skillsy - Perfil público";
export const size = ogSize;
export const contentType = ogContentType;

type ImageProps = {
  params: Promise<{ id: string }>;
};

export default async function OpenGraphImage({ params }: ImageProps) {
  const { id } = await params;
  const profile = await UserService.getPublicProfile(id);

  if (!profile) {
    notFound();
  }

  return createProfileOgImage({
    name: profile.name,
    serviceType: profile.serviceType,
    category: profile.category,
    location: profile.location,
    companyName: profile.companyName,
    bio: profile.bio,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    photoUrl: profile.photoURL,
    verified:
      shouldShowVerifiedBadge(profile) ||
      typeof getMembershipYears(profile) === "number",
  });
}
