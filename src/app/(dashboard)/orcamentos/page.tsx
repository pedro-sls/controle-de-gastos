import { Target } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Orçamentos mensais do MeuSaldo.",
};

export default async function BudgetsPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Orçamentos"
      title="Defina limites que façam sentido"
      description="Acompanhe quanto cada categoria consumiu do limite mensal e receba alertas antes de ultrapassá-lo."
      plannedFor="Etapa 8: limites mensais, progresso, alertas e comparações."
      icon={Target}
    />
  );
}
