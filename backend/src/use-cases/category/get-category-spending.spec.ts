import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { GetCategorySpendingUseCase } from "./get-category-spending.js";

describe("GetCategorySpendingUseCase", () => {
  let categoryRepository: InMemoryCategoryRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let sut: GetCategorySpendingUseCase;

  beforeEach(() => {
    transactionRepository = new InMemoryTransactionRepository();
    categoryRepository = new InMemoryCategoryRepository(transactionRepository);
    sut = new GetCategorySpendingUseCase(categoryRepository);
  });

  async function makeCategory(name: string, userId = "user-1") {
    return categoryRepository.create({
      name,
      userId,
      color: "#000000",
      description: null,
      icon: "ShoppingCart",
    });
  }

  async function makeTransaction(over: {
    userId?: string;
    type: "INCOME" | "EXPENSE";
    value: number;
    date: Date;
    categoryId: string;
  }) {
    await transactionRepository.create({ name: "seed", userId: "user-1", ...over });
  }

  it("soma só as despesas do mês por categoria, ordenado por total desc", async () => {
    const alimentacao = await makeCategory("Alimentação");
    const transporte = await makeCategory("Transporte");
    const salario = await makeCategory("Salário");

    await makeTransaction({ type: "EXPENSE", value: 5000, date: new Date(2025, 6, 15), categoryId: alimentacao.id });
    await makeTransaction({ type: "EXPENSE", value: 3000, date: new Date(2025, 6, 20), categoryId: alimentacao.id });
    await makeTransaction({ type: "EXPENSE", value: 2000, date: new Date(2025, 6, 10), categoryId: transporte.id });
    await makeTransaction({ type: "INCOME", value: 9000, date: new Date(2025, 6, 1), categoryId: salario.id });
    await makeTransaction({ type: "EXPENSE", value: 1000, date: new Date(2025, 5, 15), categoryId: alimentacao.id });

    const { categories } = await sut.execute({ userId: "user-1", month: "2025-07" });

    expect(categories).toEqual([
      expect.objectContaining({ id: alimentacao.id, total: 8000, count: 2 }),
      expect.objectContaining({ id: transporte.id, total: 2000, count: 1 }),
    ]);
  });

  it("não conta transações de outro usuário", async () => {
    const minha = await makeCategory("Alimentação", "user-1");
    const outra = await makeCategory("Alimentação", "user-2");

    await makeTransaction({ userId: "user-1", type: "EXPENSE", value: 5000, date: new Date(2025, 6, 15), categoryId: minha.id });
    await makeTransaction({ userId: "user-2", type: "EXPENSE", value: 9999, date: new Date(2025, 6, 15), categoryId: outra.id });

    const { categories } = await sut.execute({ userId: "user-1", month: "2025-07" });

    expect(categories).toHaveLength(1);
    expect(categories[0]).toEqual(expect.objectContaining({ id: minha.id, total: 5000 }));
  });

  it("retorna lista vazia quando não há despesa no mês", async () => {
    const alimentacao = await makeCategory("Alimentação");
    await makeTransaction({ type: "INCOME", value: 9000, date: new Date(2025, 6, 1), categoryId: alimentacao.id });

    const { categories } = await sut.execute({ userId: "user-1", month: "2025-07" });

    expect(categories).toEqual([]);
  });
});
