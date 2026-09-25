import { WalletCards } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { AccountForm } from "@/features/accounts/components/account-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nova conta" };

export default async function NewAccountPage() {
  await requireUser();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <WalletCards aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Nova conta
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Informe o ponto de partida. Movimentações futuras ajustarão o saldo
          calculado.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <AccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
