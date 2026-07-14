import { ChartPie } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Relatórios financeiros do MeuSaldo.",
};

export default async function ReportsPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Relatórios"
      title="Transforme registros em clareza"
      description="Compare períodos, entenda os maiores gastos e acompanhe a evolução financeira."
      plannedFor="Etapa 10: filtros, gráficos, comparação mensal e resumos."
      icon={ChartPie}
    />
  );
}
