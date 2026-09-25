"use client";

import { useActionState, useMemo } from "react";
import { CirclePause, CirclePlay, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setRecurrenceActiveAction } from "@/features/recurrences/actions";

import { FinanceFormMessage } from "../../finance/components/finance-form-message";
import { initialFinanceActionState } from "../../finance/types";

export function RecurrenceToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const action = useMemo(
    () => setRecurrenceActiveAction.bind(null, id, !active),
    [active, id],
  );
  const [state, dispatch, pending] = useActionState(
    action,
    initialFinanceActionState,
  );
  const Icon = active ? CirclePause : CirclePlay;

  return (
    <div>
      <form action={dispatch}>
        <Button
          type="submit"
          variant="outline"
          className="h-11"
          disabled={pending}
        >
          {pending ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Icon aria-hidden="true" />
          )}
          {pending ? "Salvando…" : active ? "Pausar" : "Retomar"}
        </Button>
      </form>
      <FinanceFormMessage
        message={state.message}
        tone={state.status === "success" ? "success" : "error"}
      />
    </div>
  );
}
