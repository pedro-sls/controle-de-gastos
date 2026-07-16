import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FormSubmit({
  pending,
  idleLabel,
  pendingLabel,
}: {
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
}) {
  return (
    <Button type="submit" className="h-11 min-w-36" disabled={pending}>
      {pending ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
