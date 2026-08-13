import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="container mx-auto space-y-6 px-4 py-10"><Skeleton className="h-44 w-full" /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-72 w-full" />)}</div></main>;
}
