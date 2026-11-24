import firebaseConfig from "@/firebase-applet-config.json";

export const USE_STORAGE_EMULATOR = process.env.NEXT_PUBLIC_USE_EMULATORS === "1";

export type CompanyImageKind = "company-logo" | "company-banner";

export function storageImageUrl(uid: string, kind: CompanyImageKind | "products", imageName: string) {
  const origin = USE_STORAGE_EMULATOR
    ? "http://127.0.0.1:9199"
    : "https://firebasestorage.googleapis.com";
  const path = encodeURIComponent(`users/${uid}/${kind}/${imageName}`);
  return `${origin}/v0/b/${firebaseConfig.storageBucket}/o/${path}?alt=media`;
}
