"use client";

import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  id: string;
  label: string;
  required?: boolean;
};

function FieldShell({
  children,
  error,
  hint,
  id,
  label,
  required = true,
}: FieldShellProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type FinanceFieldProps = ComponentProps<"input"> & {
  error?: string;
  hint?: string;
  id: string;
  label: string;
};

export function FinanceField({
  className,
  error,
  hint,
  id,
  label,
  required = true,
  ...props
}: FinanceFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <Input
        id={id}
        aria-describedby={describedBy(id, error, hint)}
        aria-invalid={Boolean(error)}
        className={cn("h-11", className)}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

type FinanceSelectProps = ComponentProps<"select"> & {
  error?: string;
  hint?: string;
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
};

export function FinanceSelect({
  className,
  error,
  hint,
  id,
  label,
  options,
  required = true,
  ...props
}: FinanceSelectProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <select
        id={id}
        aria-describedby={describedBy(id, error, hint)}
        aria-invalid={Boolean(error)}
        className={cn(
          "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        required={required}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
