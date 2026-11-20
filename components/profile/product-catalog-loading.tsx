import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="border border-border-subtle pt-0 ring-0">
          <Skeleton className="h-30 w-full" />
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function ProductCatalogLoading() {
  return (
    <div aria-busy="true">
      <div className="border-b border-border-subtle bg-card">
        <div className="container mx-auto flex h-12 items-center px-4 md:h-14">
          <Skeleton className="h-4 w-4 md:w-28" />
        </div>
      </div>
      <div className="border-b border-border-subtle bg-card">
        <Skeleton className="h-40 w-full sm:h-56 lg:h-64" />
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:gap-10">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-9 w-3/4 max-w-md" />
            <Skeleton className="h-5 w-2/3 max-w-sm" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-28 w-full lg:max-w-md" />
        </div>
      </div>
      <div className="container mx-auto space-y-4 px-4 py-6 md:py-8">
        <Skeleton className="h-6 w-40" />
        <ProductGridLoading />
      </div>
    </div>
  );
}
