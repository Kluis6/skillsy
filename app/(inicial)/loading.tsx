import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Navbar skeleton style */}
        <div className="flex justify-between items-center mb-12">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Hero skeleton style */}
        <div className="max-w-3xl mx-auto text-center mb-20 pt-10">
          <Skeleton className="h-5 w-40 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-14 w-full mb-4 rounded-2xl" />
          <Skeleton className="h-12 w-3/4 mx-auto mb-10 rounded-2xl" />
          
          <div className="relative max-w-2xl mx-auto">
            <Skeleton className="h-16 w-full rounded-full" />
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
