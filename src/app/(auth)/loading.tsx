export default function AuthLoading() {
  return (
    <div
      className="bg-card w-full max-w-md animate-pulse space-y-7 rounded-2xl border p-6 shadow-xl shadow-black/5 sm:p-8"
      role="status"
      aria-label="Carregando formulário"
    >
      <div className="space-y-3">
        <div className="bg-muted h-8 w-2/3 rounded-lg" />
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-4/5 rounded" />
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="bg-muted h-4 w-20 rounded" />
          <div className="bg-muted h-11 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-4 w-16 rounded" />
          <div className="bg-muted h-11 w-full rounded-lg" />
        </div>
        <div className="bg-muted h-11 w-full rounded-lg" />
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
