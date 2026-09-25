import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { AccountForm } from "@/features/accounts/components/account-form";
import { getAccountById } from "@/features/accounts/queries";
import { accountIdSchema } from "@/features/accounts/schemas";
import { formatMoneyInput } from "@/features/finance/money";
import {
  getAccountIconValue,
  getFinanceColor,
} from "@/features/finance/options";

export const metadata: Metadata = { title: "Editar conta" };

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!accountIdSchema.safeParse(id).success) notFound();
  const account = await getAccountById(id);
  if (!account) notFound();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Pencil aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Editar conta
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Ajuste os dados de “{account.name}”. O histórico financeiro será
          preservado.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <AccountForm
            account={{
              id: account.id,
              name: account.name,
              type: account.type,
              initialBalance: formatMoneyInput(account.initialBalance),
              institution: account.institution ?? "",
              color: getFinanceColor(account.color),
              icon: getAccountIconValue(account.icon),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
