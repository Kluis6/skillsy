import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Navbar skeleton style */}
        <div className="flex justify-between items-center py-2">
          <Skeleton className="size-10 rounded" />
          <Skeleton className="h-10 w-32 rounded hidden" />
          <div className="flex gap-2">
            <Skeleton className="size-10 rounded" />
            <Skeleton className="size-10 rounded" />
            <Skeleton className="h-10 w-32 rounded hidden" />
          </div>
        </div>

        {/* Hero skeleton style */}
        <div className="h-[58vh] w-full flex flex-col justify-center items-center space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center w-full" >
            <Skeleton className="h-15 w-44 rounded-sm" />
            <Skeleton className="h-5 w-54  rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-5 w-52  rounded-full" />
            <Skeleton className="h-12 w-xs rounded" />
            <Skeleton className="h-12 w-xs rounded" />
          </div>
        </div>

        {/* Categories/Content skeleton grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}
