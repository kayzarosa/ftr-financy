import { expect, test } from "@playwright/test";

function uniqueUser() {
  const stamp = Date.now();
  return {
    name: "Kayza Teste",
    email: `e2e-tx-${stamp}@financy.dev`,
    password: "senha123456",
  };
}

test("cria uma transação e ela aparece na listagem do mês", async ({ page }) => {
  const user = uniqueUser();
  const today = new Date().toISOString().slice(0, 10);

  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill(user.name);
  await page.getByLabel("E-mail").fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByRole("link", { name: "Transações" })).toBeVisible();

  await page.getByRole("link", { name: "Transações" }).click();
  await page.getByRole("button", { name: "Nova transação" }).first().click();

  await page.getByLabel("Descrição").fill("Almoço no restaurante");
  await page.getByLabel("Data").fill(today);
  await page.getByLabel("Valor").fill("5000");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Almoço no restaurante").first()).toBeVisible();
  await expect(page.getByText("R$ 50,00").first()).toBeVisible();
});
