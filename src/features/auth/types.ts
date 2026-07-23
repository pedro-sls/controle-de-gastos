export type AuthActionStatus = "idle" | "error" | "success";
export type AuthActionNextStep = "confirm-email";

export type AuthActionState = {
  status: AuthActionStatus;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  nextStep?: AuthActionNextStep;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
};
