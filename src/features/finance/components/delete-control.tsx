"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import {
  initialFinanceActionState,
  type FinanceActionState,
} from "@/features/finance/types";

type DeleteAction = (
  id: string,
  kind: string,
  previousState: FinanceActionState,
) => Promise<FinanceActionState>;

export function DeleteControl({
  action,
  entryKind,
  id,
  itemKind = "movimentação",
  itemName,
}: {
  action: DeleteAction;
  entryKind: string;
  id: string;
  itemKind?: string;
  itemName: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boundAction = useMemo(
    () => action.bind(null, id, entryKind),
    [action, entryKind, id],
  );
  const [state, dispatch, pending] = useActionState(
    boundAction,
    initialFinanceActionState,
  );

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state.status]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Trash2 aria-hidden="true" />
        Excluir
      </Button>

      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby={`delete-title-${id}`}
        aria-describedby={`delete-description-${id}`}
        className="bg-card text-card-foreground m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50"
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-destructive text-sm font-semibold uppercase">
                Ação permanente
              </p>
              <h2
                id={`delete-title-${id}`}
                className="mt-2 text-xl font-semibold"
              >
                Excluir {itemKind}?
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar confirmação"
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          <p
            id={`delete-description-${id}`}
            className="text-muted-foreground mt-4 leading-7"
          >
            “{itemName}” será removido permanentemente.
            {entryKind === "transfer"
              ? " As duas contas serão atualizadas de forma atômica."
              : ""}
          </p>

          <div className="mt-4">
            <FinanceFormMessage message={state.message} />
          </div>

          <form
            action={dispatch}
            className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
          >
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="h-11"
              disabled={pending}
            >
              {pending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Trash2 aria-hidden="true" />
              )}
              {pending ? "Excluindo…" : "Excluir definitivamente"}
            </Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
