import { Skeleton } from "@/components/ui/skeleton";

export function PublicHeroLoading({
  heightClass = "h-[30vh] md:h-[50vh]",
}: {
  heightClass?: string;
}) {
  return (
    <section className={`relative w-full overflow-hidden bg-blue-200/60 ${heightClass}`}>
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

export function PublicIntroCardLoading({
  cards = 3,
}: {
  cards?: number;
}) {
  return (
    <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
      <div className="w-full rounded-lg bg-card p-4 shadow-2xl xl:p-8 border border-border-subtle">
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

export function SearchPageLoading() {
  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="container mx-auto space-y-6">
        <div className="rounded-[2rem] border bg-card p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_auto]">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-28 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4 rounded-[2rem] border bg-card p-5 shadow-sm">
            <Skeleton className="h-6 w-36" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-xl" />
            ))}
          </aside>

          <section className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[2rem] border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

export function PostListPageLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicHeroLoading />
      <main className="container mx-auto space-y-8 px-4">
        <div className="mx-auto mb-8 -mt-7 space-y-8">
          <div className="flex flex-col gap-4 rounded-lg bg-card p-4 shadow-2xl md:flex-row md:items-center md:justify-between border border-border-subtle">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="col-span-12 md:col-span-6 xl:col-span-4">
                <Skeleton className="h-[340px] w-full rounded-2xl" />
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
    <div className="min-h-screen w-full bg-surface pb-8">
      <PublicHeroLoading heightClass="h-[45vh] md:h-[50vh]" />
      <div className="container mx-auto isolate -mt-8 px-4">
        <section className="mb-8 rounded-xl border border-border-subtle bg-card p-4 shadow-2xl md:p-6 lg:p-10">
          <div className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>

          <section className="my-8 grid grid-cols-12 gap-4 lg:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="col-span-12 space-y-4 rounded-md border border-border-subtle p-4 lg:col-span-4 lg:p-6"
              >
                <Skeleton className="h-12 w-12 rounded-sm" />
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </div>
            ))}
          </section>

          <section className="my-16 grid grid-cols-12 gap-4 gap-y-8 lg:gap-8">
            <div className="col-span-12 space-y-8 lg:col-span-6">
              <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-52" />
              </div>
              <Skeleton className="mx-auto h-72 w-72 rounded-xl lg:h-80 lg:w-80" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>

            <div className="col-span-12 space-y-8 lg:col-span-6">
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-56" />
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-border-subtle bg-surface p-4">
                  <Skeleton className="mb-2 h-3 w-24" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

export function LegalPageLoading() {
  return (
    <main className="min-h-screen w-full">
      <PublicHeroLoading heightClass="h-[78vh] md:h-[82vh]" />
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
              <Skeleton key={index} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64 w-full rounded-[2rem]" />
            <Skeleton className="h-44 w-full rounded-[2rem]" />
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
        <div className="rounded-[2rem] border border-border-subtle bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-border-subtle bg-card">
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
      <div className="space-y-6 rounded-[2rem] border border-border-subtle bg-card p-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
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
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-card shadow-sm">
          <Skeleton className="h-48 w-full md:h-64" />
          <div className="-mt-12 px-6 pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <Skeleton className="h-24 w-24 rounded-full border-4 border-card md:h-32 md:w-32" />
                <div className="space-y-3 pb-2">
                  <Skeleton className="h-8 w-56" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border-subtle bg-card p-6 shadow-sm">
              <Skeleton className="mb-4 h-6 w-44" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-11/12" />
              <Skeleton className="mt-2 h-4 w-10/12" />
            </div>
            <div className="rounded-[2rem] border border-border-subtle bg-card p-6 shadow-sm">
              <Skeleton className="mb-4 h-6 w-32" />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="mb-3 h-20 w-full rounded-xl last:mb-0" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border-subtle bg-card p-6 shadow-sm">
              <Skeleton className="mb-4 h-6 w-36" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="mb-3 h-10 w-full rounded-xl last:mb-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProfileSettingsPageLoading() {
  return (
    <main className="min-h-screen bg-surface py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4 rounded-[2rem] border border-border-subtle bg-card p-6 shadow-sm">
            <Skeleton className="mx-auto h-24 w-24 rounded-full" />
            <Skeleton className="mx-auto h-6 w-36" />
            <Skeleton className="mx-auto h-4 w-28" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-xl" />
            ))}
          </aside>

          <section className="space-y-6 rounded-[2rem] border border-border-subtle bg-card p-6 shadow-sm">
            <Skeleton className="h-8 w-56" />
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function AdminPostsPageLoading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border-subtle bg-card p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-border-subtle bg-card p-6 md:grid-cols-[1fr_220px]">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="rounded-[2rem] border border-border-subtle bg-card">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border-b border-border-subtle p-6 last:border-none">
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

export function CenteredStatusPageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-border-subtle bg-card p-8 shadow-sm">
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
