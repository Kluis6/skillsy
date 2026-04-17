import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="pb-20 px-6 md:px-10 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-10 w-64 mb-1 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-32 rounded-2xl" />
          <Skeleton className="h-11 w-40 rounded-2xl" />
        </div>
      </div>

      <Skeleton className="h-32 w-full rounded-[2.5rem] mb-8" />

      <div className="bg-card rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-surface">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-8 flex items-center justify-between border-b border-surface last:border-none">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
