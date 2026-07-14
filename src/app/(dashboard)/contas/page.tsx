import { WalletCards } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Contas",
  description: "Contas financeiras do MeuSaldo.",
};

export default async function AccountsPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Contas financeiras"
      title="Suas contas em um só lugar"
      description="Organize bancos, carteiras, cartões e outras fontes de saldo com uma visão consistente."
      plannedFor="Etapa 5: cadastro, edição e arquivamento de contas."
      icon={WalletCards}
    />
  );
}
