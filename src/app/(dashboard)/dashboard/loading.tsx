export default function DashboardLoading() {
  return (
    <main className="min-h-dvh px-4 py-10 sm:px-8">
      <div
        className="mx-auto max-w-5xl animate-pulse space-y-8 motion-reduce:animate-none"
        role="status"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="bg-muted h-4 w-28 rounded" />
            <div className="bg-muted h-9 w-64 max-w-full rounded-lg" />
          </div>
          <div className="bg-muted h-10 w-24 rounded-lg" />
        </div>
        <div className="bg-muted h-52 rounded-2xl" />
        <span className="sr-only">Carregando área protegida…</span>
      </div>
    </main>
  );
}
