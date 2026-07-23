import { execFileSync } from "node:child_process";

import { createClient } from "@supabase/supabase-js";

const email = "e2e.meusaldo@example.test";
const password = "TesteSeguro123!";

function localSupabaseEnvironment() {
  const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return Object.fromEntries(
    output
      .split("\n")
      .map((line) => line.match(/^([A-Z_]+)="(.*)"$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1], match[2]]),
  );
}

export default async function globalSetup() {
  const environment = localSupabaseEnvironment();
  const apiUrl = environment.API_URL;
  const serviceRoleKey = environment.SERVICE_ROLE_KEY;
  if (!apiUrl || !serviceRoleKey) {
    throw new Error(
      "Inicie o Supabase local antes dos testes de navegador: npm run supabase:start",
    );
  }

  const supabase = createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: users, error: listError } =
    await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  const previous = users.users.find((user) => user.email === email);
  if (previous) {
    const { error } = await supabase.auth.admin.deleteUser(previous.id);
    if (error) throw error;
  }

  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Pessoa E2E" },
  });
  if (createError) throw createError;
  const userId = data.user.id;

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, type")
    .eq("user_id", userId);
  if (categoriesError) throw categoriesError;
  const incomeCategory = categories.find((item) => item.type === "income");
  const expenseCategory = categories.find((item) => item.type === "expense");
  if (!incomeCategory || !expenseCategory) {
    throw new Error("As categorias padrão do usuário E2E não foram criadas.");
  }

  const accountId = crypto.randomUUID();
  const { error: accountError } = await supabase.from("accounts").insert({
    id: accountId,
    user_id: userId,
    name: "Conta E2E",
    type: "checking",
    initial_balance: 500,
  });
  if (accountError) throw accountError;

  const today = new Date().toISOString().slice(0, 10);
  const month = `${today.slice(0, 7)}-01`;
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: userId,
        account_id: accountId,
        category_id: incomeCategory.id,
        description: "Receita E2E",
        amount: 2000,
        type: "income",
        transaction_date: today,
        status: "paid",
        paid_date: today,
        payment_method: "pix",
      },
      {
        user_id: userId,
        account_id: accountId,
        category_id: expenseCategory.id,
        description: "Despesa E2E",
        amount: 350,
        type: "expense",
        transaction_date: today,
        status: "paid",
        paid_date: today,
        payment_method: "pix",
      },
    ]);
  if (transactionError) throw transactionError;

  const { error: budgetError } = await supabase.from("budgets").insert({
    user_id: userId,
    category_id: expenseCategory.id,
    period_month: month,
    limit_amount: 1000,
  });
  if (budgetError) throw budgetError;

  const { error: recurrenceError } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: userId,
      account_id: accountId,
      category_id: expenseCategory.id,
      description: "Recorrência E2E",
      amount: 100,
      type: "expense",
      frequency: "monthly",
      start_date: today,
      next_execution_date: today,
      default_status: "pending",
      payment_method: "boleto",
      is_fixed: true,
    });
  if (recurrenceError) throw recurrenceError;
}
