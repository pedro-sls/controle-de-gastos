"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className="h-11 w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      {pending ? "Saindo…" : "Sair"}
    </Button>
  );
}
