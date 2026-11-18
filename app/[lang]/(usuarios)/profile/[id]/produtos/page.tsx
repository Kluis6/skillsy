import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductCard } from "@/components/profile/product-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/page-layout";
import Link from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { createPublicMetadata } from "@/lib/public-metadata";
import { ProductService } from "@/services/product-service";
import { isActiveProvider, UserService } from "@/services/user-service";

// Changes to the catalog and visibility should apply on the next visit.
export const dynamic = "force-dynamic";

const getProvider = cache((id: string) => id.includes("/") ? null : UserService.getPublicProfile(id));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [profile, t] = await Promise.all([getProvider(id), getT()]);
  if (!isActiveProvider(profile)) return { title: t("profile.notFound") };

  return createPublicMetadata({
    title: t("products.publicTitle", { name: profile.name }),
    description: t("products.publicDescription", { name: profile.name }),
    path: `/profile/${id}/produtos`,
  });
}

export default async function PublicProductsPage({ params }: Props) {
  const { id } = await params;
  const [profile, t, locale] = await Promise.all([getProvider(id), getT(), getLocale()]);
  if (!isActiveProvider(profile)) notFound();

  const products = await ProductService.listPublic(id).catch((error: unknown) => {
    if (error && typeof error === "object" && "code" in error && error.code === "permission-denied") {
      notFound();
    }
    throw error;
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link href={`/profile/${id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
        <ArrowLeft aria-hidden="true" /> {t("products.back")}
      </Link>
      <PageHeader title={t("products.publicTitle", { name: profile.name })} />
      {products.length ? (
        <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} uid={id} locale={locale} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t("products.publicEmpty")} />
      )}
    </main>
  );
}
