import { INTL_LOCALE, type Locale } from "@skillsy/shared/i18n/locales";
import { storageImageUrl } from "@/lib/storage-images";

export { USE_STORAGE_EMULATOR } from "@/lib/storage-images";

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
