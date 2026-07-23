import { CircleAlert, CircleCheck, Info } from "lucide-react";

import type { Ref } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type MessageTone = "error" | "info" | "success";

type AuthFormMessageProps = {
  message?: string;
  messageRef?: Ref<HTMLDivElement>;
  tone?: MessageTone;
};

const icons = {
  error: CircleAlert,
  info: Info,
  success: CircleCheck,
};

export function AuthFormMessage({
  message,
  messageRef,
  tone = "info",
}: AuthFormMessageProps) {
  if (!message) {
    return null;
  }

  const Icon = icons[tone];

  return (
    <Alert
      ref={messageRef}
      variant={tone === "error" ? "destructive" : "default"}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      tabIndex={messageRef ? -1 : undefined}
      className={cn(
        "mb-5 px-3 py-3",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-900 *:data-[slot=alert-description]:text-emerald-800",
      )}
    >
      <Icon aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
