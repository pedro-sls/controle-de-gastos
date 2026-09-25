"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { Archive, ArchiveRestore, LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import { initialFinanceActionState } from "@/features/finance/types";

type ArchiveAction = (
  id: string,
  archived: boolean,
  previousState: typeof initialFinanceActionState,
) => Promise<typeof initialFinanceActionState>;

export function ArchiveControl({
  action,
  archived,
  id,
  itemKind,
  itemName,
}: {
  action: ArchiveAction;
  archived: boolean;
  id: string;
  itemKind: "conta" | "categoria";
  itemName: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boundAction = useMemo(
    () => action.bind(null, id, !archived),
    [action, archived, id],
  );
  const [state, dispatch, pending] = useActionState(
    boundAction,
    initialFinanceActionState,
  );

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state.status]);

  const verb = archived ? "reativar" : "arquivar";
  const VerbIcon = archived ? ArchiveRestore : Archive;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={() => dialogRef.current?.showModal()}
      >
        <VerbIcon aria-hidden="true" />
        {archived ? "Reativar" : "Arquivar"}
      </Button>

      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby={`archive-title-${id}`}
        aria-describedby={`archive-description-${id}`}
        className="bg-card text-card-foreground m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50"
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700 uppercase dark:text-emerald-300">
                Confirmar alteração
              </p>
              <h2
                id={`archive-title-${id}`}
                className="mt-2 text-xl font-semibold"
              >
                {archived ? "Reativar" : "Arquivar"} {itemKind}?
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
            id={`archive-description-${id}`}
            className="text-muted-foreground mt-4 leading-7"
          >
            {archived
              ? `“${itemName}” voltará a ficar disponível para novos registros.`
              : `“${itemName}” deixará de aceitar novos registros, mas todo o histórico será preservado.`}
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
            <Button type="submit" className="h-11" disabled={pending}>
              {pending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <VerbIcon aria-hidden="true" />
              )}
              {pending
                ? "Salvando…"
                : `${verb[0]?.toUpperCase()}${verb.slice(1)}`}
            </Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
