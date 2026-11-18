import type { Metadata } from "next";
import { ProductManager } from "@/components/profile/product-manager";
import { I18nProvider } from "@/lib/i18n/provider";
import { getMessages, getT } from "@/lib/i18n/server";
import { createPrivateMetadata } from "@/lib/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPrivateMetadata({
    title: t("products.manage"),
    description: t("products.manageDescription"),
  });
}

export default async function ManageProductsPage() {
  return (
    <I18nProvider messages={await getMessages("products")}>
      <ProductManager />
    </I18nProvider>
  );
}
