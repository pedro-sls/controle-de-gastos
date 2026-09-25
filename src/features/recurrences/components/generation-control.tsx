"use client";

import { useActionState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateOccurrencesAction } from "@/features/recurrences/actions";
import { getToday } from "@/features/transactions/dates";

import { FinanceFormMessage } from "../../finance/components/finance-form-message";
import { FinanceField } from "../../finance/components/form-fields";
import { initialFinanceActionState } from "../../finance/types";

export function GenerationControl() {
  const [state, action, pending] = useActionState(
    generateOccurrencesAction,
    initialFinanceActionState,
  );

  return (
    <form
      action={action}
      className="bg-card grid gap-4 rounded-2xl border p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-end"
    >
      <div>
        <FinanceField
          id="generation-date"
          name="untilDate"
          label="Gerar ocorrências até"
          type="date"
          defaultValue={getToday()}
          max={getToday()}
          disabled={pending}
          hint="A operação é idempotente: executar novamente não duplica lançamentos."
        />
        <div className="mt-3">
          <FinanceFormMessage
            message={state.message}
            tone={state.status === "success" ? "success" : "error"}
          />
        </div>
      </div>
      <Button type="submit" className="h-11 px-5" disabled={pending}>
        {pending ? (
          <LoaderCircle
            aria-hidden="true"
            className="animate-spin motion-reduce:animate-none"
          />
        ) : (
          <Sparkles aria-hidden="true" />
        )}
        {pending ? "Gerando…" : "Gerar lançamentos"}
      </Button>
    </form>
  );
}
