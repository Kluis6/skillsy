import { Skeleton } from "@/components/ui/skeleton";

export function PublicHeroLoading({
  heightClass = "h-[30vh] md:h-[50vh]",
}: {
  heightClass?: string;
}) {
  return (
    <section
      className={`relative w-full overflow-hidden bg-blue-200/60 ${heightClass}`}
    >
      <div className="container mx-auto flex h-full w-full items-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-3 rounded bg-foreground/10 p-4 backdrop-blur-sm">
          <Skeleton className="h-8 w-48 bg-background/50 md:h-12 md:w-96" />
          <Skeleton className="h-5 w-full max-w-xl bg-background/40 md:h-6" />
          <Skeleton className="h-5 w-3/4 bg-background/40 md:h-6" />
        </div>
      </div>
    </section>
  );
}

export function PublicIntroCardLoading({ cards = 3 }: { cards?: number }) {
  return (
    <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
      <div className="w-full rounded-xl bg-card p-4 shadow-sm xl:p-8 border border-border-subtle">
        <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
          <div className="col-span-12 space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>

          {Array.from({ length: cards }).map((_, index) => (
            <div
              key={index}
              className="col-span-12 space-y-4 rounded-md border p-4 lg:col-span-4"
            >
              <Skeleton className="h-12 w-12 rounded-sm" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mirrors the default ("grid") variant of ProviderProfileCard: banner with a
 * floating rating badge, an avatar that overlaps the banner, then title/bio
 * and a footer split between reviews+recommendation stars and "Ver perfil". */
function ProviderCardSkeleton() {
  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-border-subtle bg-card">
      <div className="relative w-full">
        <Skeleton className="h-30 w-full rounded-none" />
        <Skeleton className="absolute right-4 top-4 h-7 w-16 rounded-full" />
      </div>
      <div className="space-y-4 p-6 pt-0">
        <div className="-mt-13 flex items-end justify-between">
          <Skeleton className="size-26 rounded-full border-4 border-card" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
        </div>
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors the "list" variant of ProviderProfileCard used by search results:
 * a horizontal row (avatar + name/role, bio, then location/category/review
 * pills and the recommendation stars), not a boxed grid card. */
function ProviderListRowSkeleton() {
  return (
    <div className="space-y-3 border border-border-subtle p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function HomePageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border-subtle bg-background">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <Skeleton className="size-10 rounded md:hidden" />
          <Skeleton className="hidden h-8 w-28 md:block" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-10 rounded" />
            <Skeleton className="size-10 rounded" />
            <Skeleton className="hidden h-10 w-20 rounded md:block" />
          </div>
        </div>
      </div>

      <section className="min-h-[calc(100svh-5rem)] bg-[radial-gradient(circle_at_top_left,rgba(0,102,255,0.12),transparent_34%),linear-gradient(180deg,rgba(240,247,255,0.65),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_34%),linear-gradient(180deg,rgba(30,41,59,0.65),rgba(15,23,42,0))] md:min-h-[86vh]">
        <div className="container mx-auto grid min-h-[calc(100svh-5rem)] grid-cols-1 items-center gap-10 px-4 py-12 lg:grid-cols-12 lg:py-16 md:min-h-[86vh]">
          <div className="space-y-4 text-center lg:col-span-7 lg:text-left">
            <Skeleton className="mx-auto h-6 w-24 bg-white/30 lg:mx-0" />
            <Skeleton className="mx-auto h-14 w-full max-w-xl lg:mx-0 md:h-24 lg:h-28" />
            <Skeleton className="mx-auto h-5 w-full max-w-2xl lg:mx-0 md:h-6" />
            <Skeleton className="mx-auto h-5 w-10/12 max-w-xl lg:mx-0 md:h-6" />
          </div>

          <div className="w-full lg:col-span-5">
            <div className="rounded-md border border-border-subtle bg-card p-4 shadow-lg shadow-blue-500/10 md:p-6">
              <div className="mb-5 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-5">
                <Skeleton className="h-12 w-full rounded-full" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-12 w-full rounded-sm" />
                <Skeleton className="h-12 w-full rounded-sm" />
              </div>
              <div className="mt-5 border-t border-border-subtle pt-5">
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto mt-12 space-y-12 px-4">
        <section className="space-y-4">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-36 shrink-0 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </section>

        <section className="space-y-8">
          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto h-8 w-full max-w-lg" />
            <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
          </div>
          <div className="grid grid-cols-12 gap-y-6 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="col-span-12 md:col-span-6 xl:col-span-4"
              >
                <ProviderCardSkeleton />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export function SearchPageLoading() {
  return (
    <div className="min-h-screen w-full space-y-2 bg-surface/30">
      <nav className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <Skeleton className="size-10 rounded md:hidden" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="hidden h-10 w-full max-w-2xl rounded-full md:block" />
          <Skeleton className="size-10 rounded md:hidden" />
          <Skeleton className="hidden h-10 w-20 rounded md:block" />
        </div>
        <div className="container mx-auto flex items-center gap-4 px-4 py-2 md:hidden">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-full shrink-0 space-y-8 lg:block lg:w-72">
            <div className="rounded-xl border border-border-subtle bg-card p-4">
              <Skeleton className="mb-6 h-6 w-28" />
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-sm" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-grow space-y-6">
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-72" />
              </div>
              <Skeleton className="size-10 rounded-sm md:hidden" />
            </div>

            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <ProviderListRowSkeleton key={index} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export function PostListPageLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicHeroLoading />
      <main className="container mx-auto space-y-8 px-4">
        <div className="mx-auto mb-8 -mt-7 space-y-8">
          <div className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between border border-border-subtle">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="col-span-12 md:col-span-6 xl:col-span-4"
              >
                <Skeleton className="h-[340px] w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function PostDetailLoading() {
  return (
    <main className="min-h-screen bg-surface py-2">
      <section className="container mx-auto mb-2 px-4">
        <div className="border border-border-subtle bg-card pb-4">
          <div className="flex items-center justify-between p-4">
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-[30vh] w-full md:h-[45vh]" />
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full max-w-3xl" />
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-10 w-40" />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function DonationPageLoading() {
  return (
    <div className="min-h-screen w-full bg-surface pb-10">
      <PublicHeroLoading heightClass="h-[58vh]" />
      <div className="container mx-auto isolate -mt-8 space-y-10 px-4">
        <section className="rounded-xl border border-border-subtle bg-card p-5 md:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-3">
              <Skeleton className="h-7 w-full max-w-md" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="space-y-3 rounded-xl border border-border-subtle bg-surface p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-12 gap-4 lg:gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="col-span-12 space-y-4 rounded-xl border border-border-subtle bg-card p-5 md:col-span-4 lg:p-6"
            >
              <Skeleton className="h-12 w-12 rounded-sm" />
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-12 gap-4 gap-y-8 lg:gap-6">
          <div className="col-span-12 space-y-8 rounded-xl border border-border-subtle bg-card p-5 md:p-6 lg:col-span-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Skeleton className="hidden size-12 rounded-sm md:block" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <Skeleton className="mx-auto h-70 w-70 rounded-md lg:h-80 lg:w-80" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="col-span-12 space-y-8 rounded-xl border border-border-subtle bg-card p-5 md:p-6 lg:col-span-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Skeleton className="hidden size-12 rounded-md md:block" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-52" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border-subtle bg-surface p-4"
              >
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="h-5 w-full max-w-xs" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3 rounded-xl border border-border-subtle bg-card p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
          <div className="space-y-3 rounded-xl border border-border-subtle bg-card p-5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </section>
      </div>
    </div>
  );
}

export function LegalPageLoading() {
  return (
    <main className="min-h-screen w-full">
      <PublicHeroLoading heightClass="h-[78vh] md:h-[91dvh]" />
      <PublicIntroCardLoading />

      <section className="container mx-auto my-24 px-4">
        <div className="grid grid-cols-12 gap-4 gap-y-8">
          <div className="col-span-12 text-center">
            <Skeleton className="mx-auto h-8 w-72" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="col-span-12 md:col-span-4">
              <Skeleton className="h-44 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-18">
        <div className="container mx-auto grid grid-cols-12 gap-4 gap-y-8 px-4">
          <div className="col-span-12 space-y-4 md:col-span-6">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
          </div>
          <div className="col-span-12 space-y-4 md:col-span-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ContactsPageLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="flex min-h-screen overflow-hidden">
        <aside className="hidden w-80 border-r border-border-subtle bg-card md:block">
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-md" />
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

export function MyPostsPageLoading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-6">
        <div className="rounded-xl border border-border-subtle bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-card">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 border-b border-border-subtle p-6 last:border-none"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-72" />
                  <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function PostEditorPageLoading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-6 rounded-xl border border-border-subtle bg-card p-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </main>
  );
}

export function ProfilePublicPageLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border-subtle bg-background">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <Skeleton className="size-10 rounded md:hidden" />
          <Skeleton className="hidden h-8 w-28 md:block" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-10 rounded" />
            <Skeleton className="size-10 rounded" />
            <Skeleton className="hidden h-10 w-20 rounded md:block" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <section className="border-b border-border-subtle bg-card">
          <Skeleton className="h-26 w-full rounded-none md:h-52" />
          <div className="container mx-auto px-4 pb-4">
            <div className="relative flex flex-col">
              <div className="flex items-center justify-end py-2 md:py-4">
                <div className="hidden gap-2 sm:flex">
                  <Skeleton className="size-10 rounded-md" />
                  <Skeleton className="size-10 rounded-md" />
                  <Skeleton className="h-10 w-32 rounded-md" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                </div>
                <Skeleton className="h-9 w-16 rounded-sm sm:hidden" />
              </div>

              <Skeleton className="relative z-10 mb-4 -mt-28 size-28 rounded-full border-6 border-card shadow-sm sm:-mt-34 sm:size-32 md:-mt-38 md:size-40" />

              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-8 w-56 md:h-10 md:w-72" />
                    <Skeleton className="h-7 w-36 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-full max-w-md" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-40" />
                </div>

                <div className="w-full sm:w-auto">
                  <div className="hidden rounded-sm border bg-surface p-4 sm:block">
                    <Skeleton className="mx-auto mb-3 h-4 w-20" />
                    <Skeleton className="mx-auto h-10 w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:hidden">
                    <Skeleton className="h-10 rounded-sm" />
                    <Skeleton className="h-10 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust items: Verificação / Reputação / Indicações / Contexto */}
        <section className="border-y border-border-subtle bg-surface">
          <div className="container mx-auto grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-md border border-border-subtle bg-card p-4"
              >
                <Skeleton className="size-10 shrink-0 rounded-sm" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Indicado pela comunidade */}
        <section className="border-b border-border-subtle bg-card">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="size-10 rounded-full ring-2 ring-card"
                  />
                ))}
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </section>

        {/* Sobre este perfil */}
        <section className="border-y border-border-subtle bg-card">
          <div className="container mx-auto space-y-4 p-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-full max-w-3xl" />
            <Skeleton className="h-4 w-11/12 max-w-3xl" />
          </div>
        </section>

        {/* Disponibilidade | Avaliações da Comunidade */}
        <div className="flex w-full flex-col gap-2 md:flex-row">
          <section className="w-full border-y border-border-subtle bg-card md:border-r">
            <div className="container mx-auto space-y-4 p-4 md:ps-7">
              <Skeleton className="h-6 w-40" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-24 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-4 w-56" />
            </div>
          </section>
          <section className="w-full border-y border-border-subtle bg-card">
            <div className="container mx-auto space-y-4 p-4">
              <Skeleton className="h-6 w-52" />
              <div className="flex gap-2 md:gap-4">
                <Skeleton className="size-26 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-full max-w-xs" />
                  <Skeleton className="h-3 w-full max-w-[16rem]" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-sm" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </section>
        </div>

        {/* Comentários da Comunidade */}
        <section className="border-y border-border-subtle bg-card">
          <div className="container mx-auto space-y-4 p-4">
            <Skeleton className="h-6 w-56" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-border-subtle bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contato e Redes */}
        <section className="border-y border-border-subtle bg-card">
          <div className="container mx-auto space-y-3 p-4 md:ps-7">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </section>

        <section className="border border-border-subtle bg-card">
          <div className="container mx-auto space-y-4 p-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function ProfileSettingsPageLoading() {
  return (
    <main className="mb-6 md:container md:mx-auto md:px-4">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <aside className="space-y-2 lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden border-b bg-card md:border">
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="-mt-16 flex flex-col items-center px-4 pb-4 pt-10">
              <Skeleton className="mb-6 size-32 rounded-full border-4 border-surface" />
              <Skeleton className="mb-2 h-7 w-40" />
              <Skeleton className="mb-4 h-4 w-48" />
              <Skeleton className="h-7 w-36 rounded-full" />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border-subtle bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-border-subtle bg-card p-4">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </aside>

        <section className="space-y-2 lg:col-span-2">
          <div className="rounded-none border-y border-border-subtle bg-card px-4 py-4 md:rounded-xl md:border md:px-8">
            <Skeleton className="h-12 w-full max-w-lg" />
          </div>

          <div className="space-y-6 border-y bg-card p-4 md:border md:p-8">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-12 w-full rounded-sm" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>
            <Skeleton className="h-28 w-full rounded-sm" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-sm" />
              <Skeleton className="h-10 w-40 rounded-sm" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function AdminDashboardPageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 pb-20 md:px-10">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded-lg" />
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 overflow-hidden rounded-xl bg-card p-6 shadow-sm"
          >
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="mt-4 h-1 w-full rounded-none" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="space-y-6 rounded-xl border border-border-subtle bg-card p-8"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="size-14 rounded-xl" />
              <Skeleton className="size-6 rounded" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminUsersPageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 pb-20 md:px-10">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-11 w-32 rounded-md" />
          <Skeleton className="h-11 w-40 rounded-md" />
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-card p-8 shadow-sm">
        <div className="flex flex-col items-end gap-6 lg:flex-row">
          <div className="w-full flex-grow space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-md lg:w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-md lg:w-40" />
            </div>
            <Skeleton className="h-12 w-full rounded-md lg:w-44" />
            <Skeleton className="h-12 w-full rounded-md lg:w-44" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 bg-surface/50 px-8 py-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-4 border-b border-border-subtle p-8 last:border-none md:grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] md:items-center"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex justify-end gap-2">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="size-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminModerationPageLoading() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border-subtle bg-card p-4"
          >
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-card">
        <div className="flex items-center justify-between border-b border-border-subtle p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function AdminPostsPageLoading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-6">
        <div className="rounded-xl border border-border-subtle bg-card p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>

        <div className="grid gap-4 rounded-xl border border-border-subtle bg-card p-6 md:grid-cols-[1fr_220px]">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="rounded-xl border border-border-subtle bg-card">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="border-b border-border-subtle p-6 last:border-none"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-72" />
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-4 w-full max-w-2xl" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function OpportunitiesPageLoading({
  showModeCards = false,
}: {
  /** Matches OpportunitiesClient's mode="help" screen, which adds a row of
   * three shortcut cards (buscar / publicar / ver oportunidades). */
  showModeCards?: boolean;
}) {
  return (
    <main className="container mx-auto space-y-8 px-4 py-8 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>

      {showModeCards ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-border-subtle bg-card p-4"
            >
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-md border border-border-subtle bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}

export function CenteredStatusPageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-card p-8 shadow-sm">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-14 w-14 rounded-full" />
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-full max-w-xs" />
          <Skeleton className="mx-auto h-4 w-4/5 max-w-[220px]" />
          <Skeleton className="mx-auto h-10 w-36 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
