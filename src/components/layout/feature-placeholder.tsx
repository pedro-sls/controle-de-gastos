import { Construction, type LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

type FeaturePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  plannedFor: string;
  icon: LucideIcon;
};

export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
  plannedFor,
  icon: Icon,
}: FeaturePlaceholderProps) {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <div className="mb-4 flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <p className="text-sm font-semibold tracking-[0.12em] uppercase">
            {eyebrow}
          </p>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-base leading-7 sm:text-lg">
          {description}
        </p>
      </header>

      <Card className="max-w-2xl border-dashed py-6 shadow-sm sm:py-8">
        <CardHeader className="px-6 sm:px-8">
          <span className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center rounded-xl">
            <Construction aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-lg font-medium">Estrutura preparada</h2>
          <CardDescription className="leading-6">
            Esta rota já faz parte da navegação protegida. A funcionalidade será
            implementada sem dados fictícios, seguindo a ordem definida no
            projeto.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          <p className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100">
            <span className="font-semibold">Entrega planejada:</span>{" "}
            {plannedFor}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
