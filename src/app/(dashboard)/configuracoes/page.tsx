import { Settings2 } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Preferências do usuário no MeuSaldo.",
};

export default async function SettingsPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Configurações"
      title="Ajuste o MeuSaldo ao seu jeito"
      description="O tema já pode ser alterado no cabeçalho. Outras preferências serão adicionadas junto das funcionalidades correspondentes."
      plannedFor="Próximas etapas funcionais: preferências de conta, moeda, datas e notificações."
      icon={Settings2}
    />
  );
}
