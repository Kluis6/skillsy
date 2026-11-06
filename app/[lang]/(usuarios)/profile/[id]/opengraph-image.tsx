import { notFound } from "next/navigation";
import { UserService } from "@/services/user-service";
import {
  createProfileOgImage,
  loadProfileOgPhoto,
  ogContentType,
  ogSize,
} from "@/lib/og-image-templates";
import {
  shouldShowCommunityFriendBadge,
  shouldShowVerifiedBadge,
} from "@/lib/member-verification";
import { getTFor } from "@/lib/i18n/translator";

export const runtime = "nodejs";
export const alt = "Skillsy - Perfil público";
export const size = ogSize;
export const contentType = ogContentType;

type ImageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export default async function OpenGraphImage({ params }: ImageProps) {
  const { lang, id } = await params;
  const t = getTFor(lang);
  const profile = await UserService.getPublicProfile(id);

  if (!profile) {
    notFound();
  }

  return createProfileOgImage({
    name: profile.name,
    headline:
      profile.serviceType || profile.category || t("profile.communityMember"),
    bio: profile.bio,
    location: [profile.publicCity, profile.publicState]
      .filter(Boolean)
      .join(", "),
    photo: await loadProfileOgPhoto(profile.photoURL),
    verified: shouldShowVerifiedBadge(profile),
    communityFriend: shouldShowCommunityFriendBadge(profile),
    labels: {
      bio: t("profile.ogBio", { name: profile.name }),
      location: t("profile.metaImageLabel"),
    },
  });
}
