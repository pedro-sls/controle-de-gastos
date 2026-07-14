import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type AuthSubmitButtonProps = {
  disabled?: boolean;
  idleLabel: string;
  pending: boolean;
  pendingLabel: string;
};

export function AuthSubmitButton({
  disabled,
  idleLabel,
  pending,
  pendingLabel,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="h-11 w-full"
      disabled={disabled || pending}
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
