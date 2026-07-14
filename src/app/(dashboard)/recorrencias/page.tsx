import { Repeat2 } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Recorrências",
  description: "Movimentações recorrentes do MeuSaldo.",
};

export default async function RecurringPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Recorrências"
      title="Antecipe os próximos compromissos"
      description="Organize entradas e contas repetidas sem gerar ocorrências duplicadas."
      plannedFor="Etapa 9: cadastro, geração segura e próximas ocorrências."
      icon={Repeat2}
    />
  );
}
