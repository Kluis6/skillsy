export default function Loading() {
  return (
    <main className="min-h-screen w-full animate-pulse">
      <div className="h-[78vh] w-full bg-blue-200/60 md:h-[82vh]" />

      <div className="container mx-auto isolate -mt-8 mb-16 w-full px-4">
        <div className="w-full rounded-lg bg-card p-4 shadow-2xl xl:p-8 border border-border-subtle">
          <div className="grid grid-cols-12 gap-4 gap-y-8 xl:gap-8">
            <div className="col-span-12 space-y-4">
              <div className="h-6 w-40 rounded-full bg-surface" />
              <div className="h-10 w-72 rounded bg-surface" />
              <div className="h-5 w-full max-w-3xl rounded bg-surface" />
              <div className="h-5 w-full max-w-2xl rounded bg-surface" />
            </div>

            <div className="col-span-12 h-44 rounded-md bg-surface md:col-span-4" />
            <div className="col-span-12 h-44 rounded-md bg-surface md:col-span-4" />
            <div className="col-span-12 h-44 rounded-md bg-surface md:col-span-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
