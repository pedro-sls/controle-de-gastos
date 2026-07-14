import { ArrowLeftRight } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Movimentações",
  description: "Movimentações financeiras do MeuSaldo.",
};

export default async function TransactionsPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Movimentações"
      title="Acompanhe o caminho do seu dinheiro"
      description="Receitas, despesas e transferências aparecerão aqui com filtros e paginação."
      plannedFor="Etapa 6: cadastro, edição, exclusão, filtros, transferências e atualização de status."
      icon={ArrowLeftRight}
    />
  );
}
