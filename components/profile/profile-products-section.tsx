import { whatsappUrl } from "@skillsy/shared/contact";
import { buttonVariants } from "@/components/ui/button";
import Link from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { publicCatalogPath } from "@/lib/product-catalog";
import { ProductService } from "@/services/product-service";
import { PublicProductCard } from "./public-product-card";

export async function ProfileProductsSection({ uid, whatsapp, hasCompany }: { uid: string; whatsapp?: string; hasCompany: boolean }) {
  const [products, locale, t] = await Promise.all([
    ProductService.listPublic(uid).catch(() => null),
    getLocale(),
    getT(),
  ]);
  if (!products?.length) return null;
  const contactHref = whatsapp ? whatsappUrl(whatsapp) : null;

  return (
    <section aria-labelledby="profile-products-heading" className="border-y border-border-subtle bg-card">
      <div className="container mx-auto space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="profile-products-heading" className="text-base font-semibold text-text-main md:text-xl">
            {t("products.profileTitle")}
          </h2>
          <Link
            href={publicCatalogPath(uid, hasCompany)}
            prefetch={false}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("products.viewAll")}
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((product) => (
            <li key={product.id} className="min-w-0">
              <PublicProductCard
                uid={uid}
                product={product}
                hasCompany={hasCompany}
                locale={locale}
                contactHref={contactHref}
                t={t}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
