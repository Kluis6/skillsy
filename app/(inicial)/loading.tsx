import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Navbar skeleton style */}
        <div className="flex justify-between items-center py-2">
          <Skeleton className="size-10 rounded md:hidden" />
          <Skeleton className="h-10 w-32 rounded hidden md:block" />
          <div className="flex gap-2.5">
            <Skeleton className="size-10 rounded" />
            <Skeleton className="size-10 rounded" />
            <Skeleton className="h-10 w-18 rounded hidden md:block" />
          </div>
        </div>

        {/* Hero skeleton style */}
        <div className="h-[58vh] md:h-[84vh] w-full flex flex-col justify-center items-center space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <Skeleton className="h-15 md:h-32 w-44 md:w-98 rounded" />
            <Skeleton className="h-5 w-54 md:w-90  rounded-full" />
            <Skeleton className="h-12 w-full md:w-[42rem] rounded-full" />
            <Skeleton className="h-5 w-52  rounded-full" />
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-12 w-xs rounded" />
              <Skeleton className="h-12 w-xs rounded" />
            </div>
          </div>
        </div>

        {/* Categories/Content skeleton grid */}
        <div className="">
          <Skeleton className="h-52 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
