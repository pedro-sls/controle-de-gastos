"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  compact?: boolean;
};

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className={cn(
        "h-11 w-full sm:w-auto",
        compact && "w-11 px-0 sm:w-auto sm:px-3",
      )}
      disabled={pending}
      aria-label={pending ? "Encerrando sessão" : compact ? "Sair" : undefined}
    >
      {pending ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      <span className={cn(compact && "sr-only sm:not-sr-only")}>
        {pending ? "Saindo…" : "Sair"}
      </span>
    </Button>
  );
}
