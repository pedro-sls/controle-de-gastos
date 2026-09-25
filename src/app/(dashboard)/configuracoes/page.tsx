import { Settings2 } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getUserSettings } from "@/features/settings/queries";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Preferências do usuário no MeuSaldo.",
};

export default async function SettingsPage() {
  const settings = await getUserSettings();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Settings2 aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Personalize o período financeiro, a apresentação de datas e a
          aparência usada em todos os seus acessos.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
