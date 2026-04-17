import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="pb-20 px-6 md:px-10 py-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <Skeleton className="h-10 w-64 mb-2 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-3xl p-6 border-none shadow-sm flex flex-col gap-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-10 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}
