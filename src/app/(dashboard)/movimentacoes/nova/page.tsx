import { CirclePlus } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Nova movimentação",
  description: "Cadastro de movimentação financeira no MeuSaldo.",
};

export default async function NewTransactionPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Novo registro"
      title="Registre uma movimentação"
      description="O atalho principal já leva ao destino correto; o formulário será conectado às contas e categorias na etapa de movimentações."
      plannedFor="Etapa 6: formulário completo de receita, despesa e transferência."
      icon={CirclePlus}
    />
  );
}
