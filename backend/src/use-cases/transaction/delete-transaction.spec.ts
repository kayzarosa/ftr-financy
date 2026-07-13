import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { TransactionNotFoundError } from "../errors/transaction-not-found-error.js";
import { DeleteTransactionUseCase } from "./delete-transaction.js";

describe("DeleteTransactionUseCase", () => {
  let transactionRepository: InMemoryTransactionRepository;
  let deleteTransactionUseCase: DeleteTransactionUseCase;

  beforeEach(() => {
    transactionRepository = new InMemoryTransactionRepository();
    deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepository);
  });

  it("should be possible to delete a transaction.", async () => {
    const transaction = await transactionRepository.create({
      categoryId: "1a",
      date: new Date(),
      name: "Mercado",
      type: "EXPENSE",
      userId: "1b",
      value: 124398,
    });

    await deleteTransactionUseCase.execute({
      id: transaction.id,
      userId: transaction.userId,
    });

    const stillExists = await transactionRepository.findById(transaction.id);
    expect(stillExists).toBeNull();
  });

  it("should not be possible to delete a transaction that does not exist.", async () => {
    await expect(() =>
      deleteTransactionUseCase.execute({ id: "not_exist", userId: "1" }),
    ).rejects.toBeInstanceOf(TransactionNotFoundError);
  });

  it("should not be possible to delete a transaction owned by another user.", async () => {
    const transaction = await transactionRepository.create({
      categoryId: "1a",
      date: new Date(),
      name: "Mercado",
      type: "EXPENSE",
      userId: "1b",
      value: 124398,
    });

    await expect(() =>
      deleteTransactionUseCase.execute({ id: transaction.id, userId: "outro-usuario" }),
    ).rejects.toBeInstanceOf(TransactionNotFoundError);

    const stillExists = await transactionRepository.findById(transaction.id);
    expect(stillExists).not.toBeNull();
  });
});
