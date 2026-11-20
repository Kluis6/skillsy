import { ProductGridLoading } from "@/components/profile/product-catalog-loading";
import { ProfileToolbar } from "@/components/profile/profile-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { getT } from "@/lib/i18n/server";

export default async function Loading() {
  const t = await getT();

  return (
    <>
      <ProfileToolbar backHref="/profile" backLabel={t("products.back")}>
        <Skeleton className="h-10 w-36" />
      </ProfileToolbar>
      <main className="container mx-auto w-full space-y-6 px-4 py-6" aria-busy="true">
        <div className="space-y-2">
          <Skeleton className="h-9 w-3/4 max-w-sm" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <ProductGridLoading />
      </main>
    </>
  );
}
