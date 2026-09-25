import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <SearchX
          aria-hidden="true"
          className="text-muted-foreground mx-auto size-12"
        />
        <p className="mt-5 text-sm font-semibold tracking-wider text-emerald-800 uppercase dark:text-emerald-300">
          Página não encontrada
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          Este endereço não existe
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          O link pode ter mudado ou sido digitado incorretamente.
        </p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 h-11 px-5")}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
