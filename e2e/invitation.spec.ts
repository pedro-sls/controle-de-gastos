import { execFileSync } from "node:child_process";

import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const password = "ConviteSeguro123!";

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

async function getInviteUrl(email: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const mailbox = (await fetch("http://127.0.0.1:54324/api/v1/messages").then(
      (response) => response.json(),
    )) as {
      messages: Array<{
        ID: string;
        To: Array<{ Address: string }>;
      }>;
    };
    const summary = mailbox.messages.find((message) =>
      message.To.some((recipient) => recipient.Address === email),
    );

    if (summary) {
      const message = (await fetch(
        `http://127.0.0.1:54324/api/v1/message/${summary.ID}`,
      ).then((response) => response.json())) as { Text: string };
      const inviteUrl = message.Text.match(/https?:\/\/[^ )]+/)?.[0];

      if (inviteUrl) {
        return inviteUrl;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`O e-mail de convite para ${email} não chegou ao Mailpit.`);
}

test("convite confirma o e-mail e permite definir a senha", async ({
  page,
}, testInfo) => {
  const environment = localSupabaseEnvironment();
  const apiUrl = environment.API_URL;
  const serviceRoleKey = environment.SERVICE_ROLE_KEY;
  const email = `convite.${testInfo.project.name}@example.test`;

  if (!apiUrl || !serviceRoleKey) {
    throw new Error(
      "Inicie o Supabase local antes dos testes de navegador: npm run supabase:start",
    );
  }

  const supabase = createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: listedUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) throw listError;

  const previousUser = listedUsers.users.find((user) => user.email === email);

  if (previousUser) {
    const { error } = await supabase.auth.admin.deleteUser(previousUser.id);
    if (error) throw error;
  }

  const { data, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: "Pessoa convidada" },
      redirectTo: "http://127.0.0.1:3000/nova-senha",
    });

  if (inviteError) throw inviteError;

  try {
    await page.goto(await getInviteUrl(email));
    await expect(page).toHaveURL(/\/nova-senha\?status=convite-aceito/);
    await expect(
      page.getByText(
        "Convite confirmado. Agora defina sua senha para concluir o acesso.",
      ),
    ).toBeVisible();

    await page.locator("#newPassword").fill(password);
    await page.locator("#newPasswordConfirmation").fill(password);
    await page.getByRole("button", { name: "Salvar nova senha" }).click();

    await expect(page).toHaveURL(/\/entrar\?status=senha-alterada/);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Seu dinheiro, sem surpresas" }),
    ).toBeVisible();
  } finally {
    if (data.user) {
      await supabase.auth.admin.deleteUser(data.user.id);
    }
  }
});
