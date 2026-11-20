import type { TranslateFn } from "@skillsy/shared/i18n/keys";
import type { Locale } from "@skillsy/shared/i18n/locales";
import { FaWhatsapp } from "react-icons/fa";
import { buttonVariants } from "@/components/ui/button";
import { formatProductPrice, type ProductDetails } from "@/lib/product-catalog";

export function ProductWhatsAppLink({
  contactHref,
  product,
  locale,
  t,
}: {
  contactHref: string;
  product: ProductDetails;
  locale: Locale;
  t: TranslateFn;
}) {
  const message = [
    t("products.whatsappInquiry"),
    `*${t("products.whatsappItem")}*\n${product.name}`,
    `*${t("products.description")}*\n${product.description}`,
  ];
  if (product.priceCents !== undefined) {
    message.push(`*${t("products.whatsappPrice")}*\n${formatProductPrice(product.priceCents, locale)}`);
  }

  const href = new URL(contactHref);
  href.searchParams.set("text", message.join("\n\n"));

  return (
    <a
      href={href.toString()}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({
        className: "w-full bg-success text-success-foreground hover:bg-success/90",
      })}
    >
      <FaWhatsapp aria-hidden="true" />
      {t("profile.whatsapp")}
      <span className="sr-only"> {product.name}</span>
    </a>
  );
}
