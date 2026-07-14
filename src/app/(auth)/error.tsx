"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Falha inesperada na autenticação", error.digest);
  }, [error]);

  return (
    <section className="bg-card w-full max-w-md rounded-2xl border p-6 text-center shadow-xl shadow-black/5 sm:p-8">
      <span className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-full">
        <CircleAlert aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">
        Algo não saiu como esperado
      </h1>
      <p className="text-muted-foreground mt-3 leading-6">
        Não foi possível carregar esta etapa. Tente novamente ou volte para o
        início.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button type="button" className="h-11" onClick={unstable_retry}>
          Tentar novamente
        </Button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "h-11")}
        >
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
