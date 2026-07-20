import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { ListCategoriesCountTransactionsUseCase } from "./list-category-count-transactions.js";

describe("ListCategoriesCountTransactionsUseCase", () => {
  let categoryRepository: InMemoryCategoryRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let listCategoriesCountTransactionsUseCase: ListCategoriesCountTransactionsUseCase;

  beforeEach(() => {
    transactionRepository = new InMemoryTransactionRepository();
    categoryRepository = new InMemoryCategoryRepository(transactionRepository);
    listCategoriesCountTransactionsUseCase = new ListCategoriesCountTransactionsUseCase(
      categoryRepository,
    );
  });

  it("should return each category with its transactions count", async () => {
    const compras = await categoryRepository.create({
      name: "Compras",
      userId: "21",
      color: "#000000",
      description: null,
      icon: "ShoppingCart",
    });
    const lazer = await categoryRepository.create({
      name: "Lazer",
      userId: "21",
      color: "#000000",
      description: null,
      icon: "ShoppingCart",
    });

    await transactionRepository.create({
      name: "Mercado",
      value: 5000,
      type: "EXPENSE",
      date: new Date(),
      userId: "21",
      categoryId: compras.id,
    });
    await transactionRepository.create({
      name: "Farmácia",
      value: 2000,
      type: "EXPENSE",
      date: new Date(),
      userId: "21",
      categoryId: compras.id,
    });

    const { categories } = await listCategoriesCountTransactionsUseCase.execute({
      userId: "21",
    });

    const comprasResult = categories.find((category) => category.id === compras.id);
    const lazerResult = categories.find((category) => category.id === lazer.id);

    expect(comprasResult?.transactionsCount).toEqual(2);
    expect(lazerResult?.transactionsCount).toEqual(0);
  });

  it("should return an empty list when the user has no categories", async () => {
    const { categories } = await listCategoriesCountTransactionsUseCase.execute({
      userId: "sem-categorias",
    });

    expect(categories).toEqual([]);
  });
});
