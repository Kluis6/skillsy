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
    headline:
      profile.serviceType || profile.category || "Membro da comunidade Skillsy",
    bio: profile.bio,
    location: [profile.publicCity, profile.publicState]
      .filter(Boolean)
      .join(", "),
    photo: await loadProfileOgPhoto(profile.photoURL),
    verified: shouldShowVerifiedBadge(profile),
    communityFriend: shouldShowCommunityFriendBadge(profile),
  });
}
