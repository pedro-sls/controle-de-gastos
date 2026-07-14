"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = ComponentProps<"input"> & {
  error?: string;
  hint?: string;
  label: string;
};

function FieldFeedback({
  error,
  hint,
  id,
}: Pick<AuthFieldProps, "error" | "hint"> & { id: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="text-destructive text-sm" role="alert">
        {error}
      </p>
    );
  }

  if (hint) {
    return (
      <p id={`${id}-hint`} className="text-muted-foreground text-sm">
        {hint}
      </p>
    );
  }

  return null;
}

function getDescribedBy(id: string, error?: string, hint?: string) {
  if (error) {
    return `${id}-error`;
  }

  return hint ? `${id}-hint` : undefined;
}

export function AuthField({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: AuthFieldProps & { id: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-describedby={getDescribedBy(id, error, hint)}
        aria-invalid={Boolean(error)}
        className={cn("h-11", className)}
        {...props}
      />
      <FieldFeedback id={id} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: AuthFieldProps & { id: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          aria-describedby={getDescribedBy(id, error, hint)}
          aria-invalid={Boolean(error)}
          className={cn("h-11 pr-11", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isVisible}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg outline-none focus-visible:ring-2"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      <FieldFeedback id={id} error={error} hint={hint} />
    </div>
  );
}
