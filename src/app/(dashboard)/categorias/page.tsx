import { Tags } from "lucide-react";

import type { Metadata } from "next";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Categorias financeiras do MeuSaldo.",
};

export default async function CategoriesPage() {
  await requireUser();

  return (
    <FeaturePlaceholder
      eyebrow="Categorias"
      title="Organize cada entrada e saída"
      description="Mantenha receitas e despesas bem classificadas para que os próximos cálculos sejam claros e confiáveis."
      plannedFor="Etapa 5: categorias padrão, CRUD e arquivamento seguro."
      icon={Tags}
    />
  );
}
