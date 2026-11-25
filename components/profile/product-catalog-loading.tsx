import { PublicProfileHeader } from "@/components/profile/public-profile-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

function CatalogNavbarLoading() {
  return (
    <div className="border-b border-border-subtle bg-card">
      <div className="container mx-auto flex h-12 items-center px-4 md:h-14">
        <Skeleton className="h-4 w-4 md:w-28" />
      </div>
    </div>
  );
}

export function CompanyCatalogLoading() {
  return (
    <div aria-busy="true">
      <CatalogNavbarLoading />
      <PublicProfileHeader
        avatar={<Skeleton className="size-full rounded-full" />}
        avatarBadge={<Skeleton className="h-5 w-16 rounded-full" />}
        identity={
          <>
            <Skeleton className="h-7 w-48 max-w-full md:h-9 md:w-72" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-36" />
          </>
        }
        desktopActions={<Skeleton className="h-10 w-64" />}
        mobileActions={
          <>
            <Skeleton className="ml-auto h-10 w-24" />
            <Skeleton className="h-10 w-full" />
          </>
        }
      />
      <div className="mt-2 border-y border-border-subtle bg-card">
        <div className="container mx-auto space-y-4 p-4">
          <Skeleton className="h-6 w-40 md:h-7" />
          <ProductGridLoading />
        </div>
      </div>
    </div>
  );
}

export function ProductCatalogLoading() {
  return (
    <div aria-busy="true">
      <CatalogNavbarLoading />
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

export function ProductDetailsLoading() {
  return (
    <div aria-busy="true">
      <div className="border-b border-border-subtle bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Skeleton className="h-4 w-4 sm:w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 sm:py-8 lg:py-12">
        <Card className="mx-auto max-w-6xl gap-0 border border-border-subtle py-0 ring-0 md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <Skeleton className="aspect-[4/3] max-h-[60svh] w-full sm:max-h-none" />
          <CardContent className="space-y-5 p-5 sm:p-8 lg:p-10">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-11 w-56 max-w-full" />
          </CardContent>
          <CardContent className="space-y-2 border-t border-border-subtle p-5 sm:p-8 md:col-span-full lg:p-10">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-2/3 max-w-sm" />
          </CardContent>
          <CardContent className="space-y-3 border-t border-border-subtle p-5 sm:p-8 md:col-span-full lg:p-10">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
