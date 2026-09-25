"use client";

import { useEffect, useRef } from "react";

import type { AuthActionState } from "@/features/auth/types";

export function useAuthMessageFocus(state: AuthActionState) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.message) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      messageRef.current?.focus({ preventScroll: true });
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [state]);

  return messageRef;
}
