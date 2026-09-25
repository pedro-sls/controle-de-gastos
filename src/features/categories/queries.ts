import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type CategoryDTO = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  archivedAt: string | null;
};

const categoryColumns = "id, name, type, color, icon, is_default, archived_at";

function toCategoryDTO(row: {
  id: string;
  name: string;
  type: CategoryDTO["type"];
  color: string | null;
  icon: string | null;
  is_default: boolean;
  archived_at: string | null;
}): CategoryDTO {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    isDefault: row.is_default,
    archivedAt: row.archived_at,
  };
}

export async function getCategories(): Promise<CategoryDTO[]> {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(categoryColumns)
    .eq("user_id", identity.id)
    .order("name");

  if (error) {
    throw new Error("Não foi possível carregar as categorias.");
  }

  return (data ?? []).map(toCategoryDTO);
}

export async function getCategoryById(id: string): Promise<CategoryDTO | null> {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(categoryColumns)
    .eq("id", id)
    .eq("user_id", identity.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a categoria.");
  }

  return data ? toCategoryDTO(data) : null;
}
