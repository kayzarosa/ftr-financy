import { expect, test } from "@playwright/test";

function uniqueUser() {
  const stamp = Date.now();
  return {
    name: "Kayza Teste",
    email: `e2e-${stamp}@financy.dev`,
    password: "senha123456",
  };
}

test("cadastra, cria categoria, desloga, loga de novo e a categoria persiste", async ({ page }) => {
  const user = uniqueUser();

  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill(user.name);
  await page.getByLabel("E-mail").fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByRole("link", { name: "Categorias" })).toBeVisible();

  await page.getByRole("link", { name: "Categorias" }).click();
  await page.getByRole("button", { name: "Nova Categoria" }).click();
  await page.getByLabel("Título").fill("Alimentação");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("heading", { name: "Alimentação" })).toBeVisible();

  await page.goto("/usuario");
  await page.getByRole("button", { name: "Sair da conta" }).click();

  await expect(page.getByRole("heading", { name: "Fazer login" })).toBeVisible();

  await page.getByLabel("E-mail").fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByRole("link", { name: "Categorias" })).toBeVisible();
  await page.getByRole("link", { name: "Categorias" }).click();
  await expect(page.getByRole("heading", { name: "Alimentação" })).toBeVisible();
});
