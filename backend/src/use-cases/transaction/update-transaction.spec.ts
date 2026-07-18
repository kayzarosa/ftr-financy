import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoryRepository } from "@/domain/repositories/memory/in-memory-category-repository.js";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { CategoryNotFoundError } from "../errors/category-not-found-error.js";
import { TransactionNotFoundError } from "../errors/transaction-not-found-error.js";
import { UpdateTransactionUseCase } from "./update-transaction.js";

describe("UpdateTransactionUseCase", () => {
  let transactionRepository: InMemoryTransactionRepository;
  let categoryRepository: InMemoryCategoryRepository;
  let updateTransactionUseCase: UpdateTransactionUseCase;

  beforeEach(() => {
    transactionRepository = new InMemoryTransactionRepository();
    categoryRepository = new InMemoryCategoryRepository();

    updateTransactionUseCase = new UpdateTransactionUseCase(
      transactionRepository,
      categoryRepository,
    );
  });

  it("should be possible to modify a transaction linked to the user.", async () => {
    const category = await categoryRepository.create({
      color: "#9d0456",
      name: "Compras",
      description: null,
      icon: null,
      userId: "1a",
    });

    expect(category.id).toEqual(expect.any(String));
    expect(category.userId).toEqual("1a");

    const transaction = await transactionRepository.create({
      categoryId: category.id,
      date: new Date(),
      name: "Mercado",
      type: "EXPENSE",
      userId: "1a",
      value: 124398,
    });

    expect(transaction.id).toEqual(expect.any(String));

    const { transaction: updateTransaction } = await updateTransactionUseCase.execute({
      userId: "1a",
      id: transaction.id,
      name: "Mercado 1",
    });

    expect(updateTransaction.name).toEqual("Mercado 1");

    const { transaction: updateTransaction2 } = await updateTransactionUseCase.execute({
      userId: "1a",
      id: transaction.id,
      categoryId: null,
      type: "INCOME",
    });

    expect(updateTransaction2.categoryId).toBeNull();
    expect(updateTransaction2.type).toEqual("INCOME");

    const date = new Date();

    const { transaction: updateTransaction3 } = await updateTransactionUseCase.execute({
      userId: "1a",
      id: transaction.id,
      date: date,
      value: 234,
    });

    expect(updateTransaction3.date).toEqual(date);
    expect(updateTransaction3.value).toEqual(234);
  });

  it("should be possible to change to a valid category owned by the same user.", async () => {
    const category = await categoryRepository.create({
      color: "#9d0456",
      name: "Mercado",
      description: null,
      icon: null,
      userId: "1a",
    });

    const transaction = await transactionRepository.create({
      categoryId: null,
      date: new Date(),
      name: "Mercado",
      type: "EXPENSE",
      userId: "1a",
      value: 124398,
    });

    const { transaction: updatedTransaction } = await updateTransactionUseCase.execute({
      userId: "1a",
      id: transaction.id,
      categoryId: category.id,
    });

    expect(updatedTransaction.categoryId).toEqual(category.id);
  });

  it("should not be possible to change the category if it belongs to another user.", async () => {
    const category = await categoryRepository.create({
      color: "#9d0456",
      name: "Compras",
      description: null,
      icon: null,
      userId: "1a",
    });

    expect(category.id).toEqual(expect.any(String));
    expect(category.userId).toEqual("1a");

    const transaction = await transactionRepository.create({
      categoryId: category.id,
      date: new Date(),
      name: "Mercado",
      type: "EXPENSE",
      userId: "1b",
      value: 124398,
    });

    await expect(() =>
      updateTransactionUseCase.execute({
        userId: transaction.userId,
        categoryId: category.id,
        id: transaction.id,
        value: 234,
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("should not be possible to change to a category that does not exist.", async () => {
    const transaction = await transactionRepository.create({
      categoryId: null,
      date: new Date(),
      name: "Mercado",
      type: "EXPENSE",
      userId: "1a",
      value: 124398,
    });

    await expect(() =>
      updateTransactionUseCase.execute({
        userId: "1a",
        categoryId: "categoria-que-nao-existe",
        id: transaction.id,
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("should not be possible to modify a transaction with a different user ID.", async () => {
    const transaction = await transactionRepository.create({
      categoryId: "1a",
      date: new Date(),
      name: "Mercado",
      type: "EXPENSE",
      userId: "1b",
      value: 124398,
    });

    await expect(() =>
      updateTransactionUseCase.execute({
        userId: "error",
        id: transaction.id,
        value: 234,
      }),
    ).rejects.toBeInstanceOf(TransactionNotFoundError);
  });
});
