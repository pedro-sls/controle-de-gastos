import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  hint?: string;
  id: string;
  label: string;
  required?: boolean;
};

export function getFieldDescriptionId(
  id: string,
  error?: string,
  hint?: string,
) {
  if (error) {
    return `${id}-error`;
  }

  return hint ? `${id}-hint` : undefined;
}

export function FormField({
  children,
  error,
  hint,
  id,
  label,
  required = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="gap-1">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : (
          <span className="text-muted-foreground font-normal">(opcional)</span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="text-muted-foreground text-sm leading-5"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
