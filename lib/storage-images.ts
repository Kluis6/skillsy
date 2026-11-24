import firebaseConfig from "@/firebase-applet-config.json";
import { normalizeCompanyImageName } from "@skillsy/shared/profile-options";

export const USE_STORAGE_EMULATOR = process.env.NEXT_PUBLIC_USE_EMULATORS === "1";

export type CompanyImageKind = "company-logo" | "company-banner";

export function storageImageUrl(uid: string, kind: CompanyImageKind | "banner" | "products", imageName: string) {
  const origin = USE_STORAGE_EMULATOR
    ? "http://127.0.0.1:9199"
    : "https://firebasestorage.googleapis.com";
  const path = encodeURIComponent(`users/${uid}/${kind}/${imageName}`);
  return `${origin}/v0/b/${firebaseConfig.storageBucket}/o/${path}?alt=media`;
}

/** Only the two public cover folders for this member can be fetched for social previews. */
export function storageCoverMediaUrl(uid: string, src: string): string | undefined {
  try {
    const url = new URL(src);
    const path = decodeURIComponent(url.pathname);
    const [kind, filename] = path.split("/").slice(-2);
    if (kind !== "company-banner" && kind !== "banner") return undefined;

    const isMigratedBanner = kind === "banner" && /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(filename);
    if (!normalizeCompanyImageName(filename) && !isMigratedBanner) return undefined;

    const canonical = new URL(storageImageUrl(uid, kind, filename));
    if (url.origin === canonical.origin && path === decodeURIComponent(canonical.pathname)) {
      return canonical.href;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
