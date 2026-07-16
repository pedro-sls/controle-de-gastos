export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          initial_balance: number;
          institution: string | null;
          name: string;
          status: Database["public"]["Enums"]["account_status"] | null;
          type: Database["public"]["Enums"]["account_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          initial_balance?: number;
          institution?: string | null;
          name: string;
          status?: Database["public"]["Enums"]["account_status"] | null;
          type: Database["public"]["Enums"]["account_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          initial_balance?: number;
          institution?: string | null;
          name?: string;
          status?: Database["public"]["Enums"]["account_status"] | null;
          type?: Database["public"]["Enums"]["account_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          category_id: string | null;
          category_kind: Database["public"]["Enums"]["category_type"] | null;
          created_at: string;
          id: string;
          limit_amount: number;
          period_month: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category_id?: string | null;
          category_kind?: Database["public"]["Enums"]["category_type"] | null;
          created_at?: string;
          id?: string;
          limit_amount: number;
          period_month: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category_id?: string | null;
          category_kind?: Database["public"]["Enums"]["category_type"] | null;
          created_at?: string;
          id?: string;
          limit_amount?: number;
          period_month?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_category_owner_fk";
            columns: ["category_id", "user_id", "category_kind"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id", "type"];
          },
        ];
      };
      categories: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          is_default: boolean;
          name: string;
          type: Database["public"]["Enums"]["category_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_default?: boolean;
          name: string;
          type: Database["public"]["Enums"]["category_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_default?: boolean;
          name?: string;
          type?: Database["public"]["Enums"]["category_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      financial_goals: {
        Row: {
          account_id: string | null;
          color: string | null;
          completed_at: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          name: string;
          note: string | null;
          reserved_amount: number;
          status: Database["public"]["Enums"]["goal_status"];
          target_amount: number;
          target_date: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          color?: string | null;
          completed_at?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name: string;
          note?: string | null;
          reserved_amount?: number;
          status?: Database["public"]["Enums"]["goal_status"];
          target_amount: number;
          target_date?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          color?: string | null;
          completed_at?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          note?: string | null;
          reserved_amount?: number;
          status?: Database["public"]["Enums"]["goal_status"];
          target_amount?: number;
          target_date?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_goals_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "account_balances";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "financial_goals_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recurring_transactions: {
        Row: {
          account_id: string;
          amount: number;
          category_id: string;
          created_at: string;
          default_status: Database["public"]["Enums"]["transaction_status"];
          description: string;
          end_date: string | null;
          frequency: Database["public"]["Enums"]["recurrence_frequency"];
          id: string;
          is_active: boolean;
          is_fixed: boolean;
          next_execution_date: string;
          note: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          start_date: string;
          type: Database["public"]["Enums"]["category_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id: string;
          amount: number;
          category_id: string;
          created_at?: string;
          default_status?: Database["public"]["Enums"]["transaction_status"];
          description: string;
          end_date?: string | null;
          frequency: Database["public"]["Enums"]["recurrence_frequency"];
          id?: string;
          is_active?: boolean;
          is_fixed?: boolean;
          next_execution_date: string;
          note?: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          start_date: string;
          type: Database["public"]["Enums"]["category_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          category_id?: string;
          created_at?: string;
          default_status?: Database["public"]["Enums"]["transaction_status"];
          description?: string;
          end_date?: string | null;
          frequency?: Database["public"]["Enums"]["recurrence_frequency"];
          id?: string;
          is_active?: boolean;
          is_fixed?: boolean;
          next_execution_date?: string;
          note?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          start_date?: string;
          type?: Database["public"]["Enums"]["category_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "account_balances";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "recurring_transactions_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "recurring_transactions_category_owner_fk";
            columns: ["category_id", "user_id", "type"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id", "type"];
          },
        ];
      };
      transactions: {
        Row: {
          account_id: string;
          amount: number;
          category_id: string | null;
          category_kind: Database["public"]["Enums"]["category_type"] | null;
          created_at: string;
          description: string;
          due_date: string | null;
          id: string;
          is_fixed: boolean;
          is_recurring: boolean | null;
          note: string | null;
          paid_date: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          recurrence_date: string | null;
          recurring_transaction_id: string | null;
          status: Database["public"]["Enums"]["transaction_status"];
          transaction_date: string;
          transfer_id: string | null;
          type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id: string;
          amount: number;
          category_id?: string | null;
          category_kind?: Database["public"]["Enums"]["category_type"] | null;
          created_at?: string;
          description: string;
          due_date?: string | null;
          id?: string;
          is_fixed?: boolean;
          is_recurring?: boolean | null;
          note?: string | null;
          paid_date?: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          recurrence_date?: string | null;
          recurring_transaction_id?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"];
          transaction_date: string;
          transfer_id?: string | null;
          type: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          category_id?: string | null;
          category_kind?: Database["public"]["Enums"]["category_type"] | null;
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          is_fixed?: boolean;
          is_recurring?: boolean | null;
          note?: string | null;
          paid_date?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          recurrence_date?: string | null;
          recurring_transaction_id?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"];
          transaction_date?: string;
          transfer_id?: string | null;
          type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "account_balances";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_category_owner_fk";
            columns: ["category_id", "user_id", "category_kind"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id", "type"];
          },
          {
            foreignKeyName: "transactions_recurring_owner_fk";
            columns: ["recurring_transaction_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "recurring_transactions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_transfer_owner_fk";
            columns: ["transfer_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "transfers";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      transfers: {
        Row: {
          amount: number;
          created_at: string;
          description: string;
          destination_account_id: string;
          due_date: string | null;
          id: string;
          note: string | null;
          paid_date: string | null;
          source_account_id: string;
          status: Database["public"]["Enums"]["transaction_status"];
          transaction_date: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description: string;
          destination_account_id: string;
          due_date?: string | null;
          id?: string;
          note?: string | null;
          paid_date?: string | null;
          source_account_id: string;
          status?: Database["public"]["Enums"]["transaction_status"];
          transaction_date: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string;
          destination_account_id?: string;
          due_date?: string | null;
          id?: string;
          note?: string | null;
          paid_date?: string | null;
          source_account_id?: string;
          status?: Database["public"]["Enums"]["transaction_status"];
          transaction_date?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transfers_destination_account_owner_fk";
            columns: ["destination_account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "account_balances";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transfers_destination_account_owner_fk";
            columns: ["destination_account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transfers_source_account_owner_fk";
            columns: ["source_account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "account_balances";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transfers_source_account_owner_fk";
            columns: ["source_account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      user_settings: {
        Row: {
          created_at: string;
          currency_code: string;
          date_format: string;
          financial_month_start: number;
          locale: string;
          theme: Database["public"]["Enums"]["theme_preference"];
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          currency_code?: string;
          date_format?: string;
          financial_month_start?: number;
          locale?: string;
          theme?: Database["public"]["Enums"]["theme_preference"];
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          currency_code?: string;
          date_format?: string;
          financial_month_start?: number;
          locale?: string;
          theme?: Database["public"]["Enums"]["theme_preference"];
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      account_balances: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          current_balance: number | null;
          icon: string | null;
          id: string | null;
          initial_balance: number | null;
          institution: string | null;
          name: string | null;
          status: Database["public"]["Enums"]["account_status"] | null;
          type: Database["public"]["Enums"]["account_type"] | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      budget_progress: {
        Row: {
          alert_threshold: number | null;
          category_id: string | null;
          created_at: string | null;
          id: string | null;
          limit_amount: number | null;
          percentage_used: number | null;
          period_month: string | null;
          status: string | null;
          updated_at: string | null;
          used_amount: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      transactions_with_effective_status: {
        Row: {
          account_id: string | null;
          amount: number | null;
          category_id: string | null;
          category_kind: Database["public"]["Enums"]["category_type"] | null;
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          effective_status: string | null;
          id: string | null;
          is_fixed: boolean | null;
          is_recurring: boolean | null;
          note: string | null;
          paid_date: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"] | null;
          recurrence_date: string | null;
          recurring_transaction_id: string | null;
          status: Database["public"]["Enums"]["transaction_status"] | null;
          transaction_date: string | null;
          transfer_id: string | null;
          type: Database["public"]["Enums"]["transaction_type"] | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "account_balances";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_account_owner_fk";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_category_owner_fk";
            columns: ["category_id", "user_id", "category_kind"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id", "type"];
          },
          {
            foreignKeyName: "transactions_recurring_owner_fk";
            columns: ["recurring_transaction_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "recurring_transactions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "transactions_transfer_owner_fk";
            columns: ["transfer_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "transfers";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Functions: {
      create_transfer: {
        Args: {
          p_amount: number;
          p_description: string;
          p_destination_account_id: string;
          p_due_date?: string;
          p_note?: string;
          p_paid_date?: string;
          p_source_account_id: string;
          p_status?: Database["public"]["Enums"]["transaction_status"];
          p_transaction_date: string;
        };
        Returns: string;
      };
      delete_transfer: { Args: { p_transfer_id: string }; Returns: undefined };
      get_dashboard_snapshot: {
        Args: { p_period_end: string; p_period_start: string };
        Returns: Json;
      };
      update_transfer: {
        Args: {
          p_amount: number;
          p_description: string;
          p_destination_account_id: string;
          p_due_date?: string;
          p_note?: string;
          p_paid_date?: string;
          p_source_account_id: string;
          p_status?: Database["public"]["Enums"]["transaction_status"];
          p_transaction_date: string;
          p_transfer_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      account_status: "active" | "archived";
      account_type:
        "checking" | "savings" | "wallet" | "cash" | "digital" | "other";
      category_type: "income" | "expense";
      goal_status: "active" | "paused" | "completed" | "canceled";
      payment_method:
        | "cash"
        | "pix"
        | "debit_card"
        | "credit_card"
        | "boleto"
        | "bank_transfer"
        | "other";
      recurrence_frequency:
        | "weekly"
        | "biweekly"
        | "monthly"
        | "bimonthly"
        | "quarterly"
        | "semiannual"
        | "annual";
      theme_preference: "system" | "light" | "dark";
      transaction_status: "paid" | "pending" | "canceled";
      transaction_type: "income" | "expense" | "transfer_out" | "transfer_in";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "archived"],
      account_type: [
        "checking",
        "savings",
        "wallet",
        "cash",
        "digital",
        "other",
      ],
      category_type: ["income", "expense"],
      goal_status: ["active", "paused", "completed", "canceled"],
      payment_method: [
        "cash",
        "pix",
        "debit_card",
        "credit_card",
        "boleto",
        "bank_transfer",
        "other",
      ],
      recurrence_frequency: [
        "weekly",
        "biweekly",
        "monthly",
        "bimonthly",
        "quarterly",
        "semiannual",
        "annual",
      ],
      theme_preference: ["system", "light", "dark"],
      transaction_status: ["paid", "pending", "canceled"],
      transaction_type: ["income", "expense", "transfer_out", "transfer_in"],
    },
  },
} as const;
