"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthenticatedError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Falha inesperada na área autenticada", error.digest);
  }, [error]);

  return (
    <section className="bg-card max-w-2xl rounded-2xl border p-6 shadow-sm sm:p-8">
      <span className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <CircleAlert aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">
        Não foi possível carregar esta área
      </h1>
      <p className="text-muted-foreground mt-3 max-w-lg leading-6">
        Tente novamente. Se o problema continuar, volte ao dashboard e acesse a
        funcionalidade mais tarde.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="h-11 sm:min-w-40"
          onClick={unstable_retry}
        >
          Tentar novamente
        </Button>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 sm:min-w-40",
          )}
        >
          Ir para o dashboard
        </Link>
      </div>
    </section>
  );
}
