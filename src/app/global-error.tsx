"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground flex min-h-dvh items-center justify-center p-6">
        <main className="bg-card w-full max-w-lg rounded-2xl border p-8 text-center shadow-lg">
          <p className="text-sm font-semibold tracking-wider text-red-700 uppercase">
            Erro inesperado
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Não foi possível abrir o MeuSaldo
          </h1>
          <p className="text-muted-foreground mt-3 leading-7">
            Seus dados permanecem seguros. Tente carregar a aplicação novamente.
          </p>
          <button
            type="button"
            className="mt-6 h-11 rounded-lg bg-emerald-700 px-5 text-sm font-medium text-white focus-visible:ring-3 focus-visible:ring-emerald-500 focus-visible:outline-none"
            onClick={() => unstable_retry()}
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
