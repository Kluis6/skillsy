import { Skeleton } from "@/components/ui/skeleton";

export function ProductCatalogLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8" aria-busy="true">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-9 w-3/4 max-w-sm" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-44 w-full" />
        ))}
      </div>
    </div>
  );
}
