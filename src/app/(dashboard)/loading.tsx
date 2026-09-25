export default function AuthenticatedLoading() {
  return (
    <div
      className="animate-pulse space-y-8 motion-reduce:animate-none"
      role="status"
      aria-label="Carregando conteúdo"
    >
      <div className="max-w-2xl space-y-3">
        <div className="bg-muted h-4 w-28 rounded" />
        <div className="bg-muted h-10 w-full max-w-lg rounded-xl" />
        <div className="bg-muted h-5 w-full rounded" />
        <div className="bg-muted h-5 w-4/5 rounded" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-muted h-64 rounded-2xl" />
        <div className="bg-muted h-64 rounded-2xl" />
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
