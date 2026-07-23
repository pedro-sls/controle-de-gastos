import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const email = "e2e.meusaldo@example.test";
const password = "TesteSeguro123!";

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

async function login(page: Page) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "Seu dinheiro, sem surpresas" }),
  ).toBeVisible();
}

test("página pública e login são acessíveis", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  await expect(
    page.getByRole("heading", {
      name: /Clareza para cuidar do seu dinheiro todos os dias/,
    }),
  ).toBeVisible();
  await expectAccessible(page);

  await page.goto("/entrar");
  await expectAccessible(page);
});

test("área autenticada apresenta todos os módulos finais", async ({ page }) => {
  await login(page);
  await expectAccessible(page);

  const modules = [
    ["/orcamentos", "Limites claros, decisões tranquilas"],
    ["/recorrencias", "Compromissos no ritmo certo"],
    ["/relatorios", "Do histórico para decisões melhores"],
    ["/configuracoes", "Configurações"],
  ] as const;

  for (const [path, heading] of modules) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expectAccessible(page);
  }
});

test("dados financeiros de demonstração aparecem nos módulos", async ({
  page,
}) => {
  await login(page);

  await page.goto("/orcamentos");
  await expect(page.getByText("Dentro do limite")).toBeVisible();
  await expect(page.getByText("R$ 350,00 de R$ 1.000,00")).toBeVisible();

  await page.goto("/recorrencias");
  await expect(
    page.getByRole("heading", { name: "Recorrência E2E" }),
  ).toBeVisible();

  await page.goto("/relatorios");
  await expect(page.getByText("R$ 2.000,00").first()).toBeVisible();
  await expect(page.getByText("R$ 350,00").first()).toBeVisible();
});

test("rota desconhecida mostra uma recuperação acessível", async ({ page }) => {
  await page.goto("/endereco-inexistente");
  await expect(
    page.getByRole("heading", { name: "Este endereço não existe" }),
  ).toBeVisible();
  await expectAccessible(page);
});
