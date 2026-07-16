export type FinanceActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialFinanceActionState: FinanceActionState = {
  status: "idle",
};
