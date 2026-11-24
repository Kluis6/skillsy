import { INTL_LOCALE, type Locale } from "@skillsy/shared/i18n/locales";
import type { Timestamp } from "firebase/firestore";
import { companyProfilePath } from "@/lib/company-profile";
import { storageImageUrl } from "@/lib/storage-images";

export { USE_STORAGE_EMULATOR } from "@/lib/storage-images";

export const MAX_PRODUCTS = 50;
export const PRODUCT_NAME_LIMIT = 100;
export const PRODUCT_DESCRIPTION_LIMIT = 1000;
export const PRODUCT_RATING_SCORES = [1, 2, 3, 4, 5] as const;
export type ProductRatingScore = (typeof PRODUCT_RATING_SCORES)[number];

export type ProductRatingTotals = { ratingSum: number; ratingCount: number };

export type ProductDetails = {
  name: string;
  description: string;
  priceCents?: number;
  imageName?: string;
};

export type CatalogProduct = ProductDetails & Partial<ProductRatingTotals> & {
  id: string;
  revision: string;
  createdAt?: Timestamp;
};

export function productRatingTotals(product: Partial<ProductRatingTotals>): ProductRatingTotals {
  return { ratingSum: product.ratingSum ?? 0, ratingCount: product.ratingCount ?? 0 };
}

export function publicCatalogPath(uid: string, hasCompany: boolean) {
  return hasCompany ? companyProfilePath(uid) : `/profile/${encodeURIComponent(uid)}/produtos`;
}

export function publicProductPath(uid: string, productId: string, hasCompany: boolean) {
  const catalogPath = publicCatalogPath(uid, hasCompany);
  return `${catalogPath}${hasCompany ? "/produtos" : ""}/${encodeURIComponent(productId)}`;
}

export function productImageUrl(uid: string, imageName: string) {
  return storageImageUrl(uid, "products", imageName);
}

export function formatProductPrice(priceCents: number, locale: Locale) {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

export function parseProductPrice(price: string) {
  const input = price.trim();
  if (!input) return undefined;
  if (!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(input)) return NaN;
  const [whole, fraction = ""] = input.split(/[.,]/);
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
