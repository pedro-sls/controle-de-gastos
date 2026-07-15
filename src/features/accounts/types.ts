import type { z } from "zod";

import type {
  FinancialColorValue,
  FinancialIconName,
} from "@/config/financial-dimensions";
import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database";

import type {
  accountFormSchema,
  accountMutationIdentitySchema,
} from "./schemas";

export type AccountType = Enums<"account_type">;
export type AccountStatus = Enums<"account_status">;
export type AccountBalanceRow = Tables<"account_balances">;

export type AccountFormInput = z.input<typeof accountFormSchema>;
export type AccountFormValues = z.output<typeof accountFormSchema>;
export type AccountMutationIdentity = z.output<
  typeof accountMutationIdentitySchema
>;

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialBalanceCents: number;
  currentBalanceCents: number;
  institution: string | null;
  color: FinancialColorValue | null;
  icon: FinancialIconName | null;
  status: AccountStatus;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountInsertPayload = Pick<
  TablesInsert<"accounts">,
  | "user_id"
  | "name"
  | "type"
  | "initial_balance"
  | "institution"
  | "color"
  | "icon"
>;

export type AccountUpdatePayload = Pick<
  TablesUpdate<"accounts">,
  "name" | "type" | "initial_balance" | "institution" | "color" | "icon"
>;

export type AccountMutationOperation =
  "create" | "update" | "archive" | "restore";

export type AccountErrorCode =
  | "conflict"
  | "dependency"
  | "duplicate"
  | "forbidden"
  | "invalid-data"
  | "unexpected";

export type AccountDomainError = {
  code: AccountErrorCode;
  message: string;
};

export type PostgrestErrorLike = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};
