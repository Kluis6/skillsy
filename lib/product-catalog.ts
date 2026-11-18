import firebaseConfig from "@/firebase-applet-config.json";

export const MAX_PRODUCTS = 50;
export const PRODUCT_NAME_LIMIT = 100;
export const PRODUCT_DESCRIPTION_LIMIT = 1000;

export type ProductDetails = {
  name: string;
  description: string;
  priceCents?: number;
  imageName?: string;
};

export type CatalogProduct = ProductDetails & {
  id: string;
  revision: string;
};

export const USE_STORAGE_EMULATOR = process.env.NEXT_PUBLIC_USE_EMULATORS === "1";

export function productImageUrl(uid: string, imageName: string) {
  const origin = USE_STORAGE_EMULATOR
    ? "http://127.0.0.1:9199"
    : "https://firebasestorage.googleapis.com";
  const path = encodeURIComponent(`users/${uid}/products/${imageName}`);
  return `${origin}/v0/b/${firebaseConfig.storageBucket}/o/${path}?alt=media`;
}

export function parseProductPrice(price: string) {
  const input = price.trim();
  if (!input) return undefined;
  if (!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(input)) return NaN;
  const [whole, fraction = ""] = input.split(/[.,]/);
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
