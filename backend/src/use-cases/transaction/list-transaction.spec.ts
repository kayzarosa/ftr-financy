import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { ListTransactionUseCase } from "./list-transaction.js";

describe("ListTransactionUseCase", () => {
  let transactionRepository: InMemoryTransactionRepository;
  let listTransactionUseCase: ListTransactionUseCase;

  beforeEach(() => {
    transactionRepository = new InMemoryTransactionRepository();
    listTransactionUseCase = new ListTransactionUseCase(transactionRepository);
  });

  it("should list only the transactions owned by the given user", async () => {
    await transactionRepository.create({
      name: "Mercado",
      value: 12000,
      type: "EXPENSE",
      date: new Date(),
      userId: "1a",
      categoryId: null,
    });

    await transactionRepository.create({
      name: "Salário",
      value: 500000,
      type: "INCOME",
      date: new Date(),
      userId: "1a",
      categoryId: null,
    });

    await transactionRepository.create({
      name: "Transação de outro usuário",
      value: 1000,
      type: "EXPENSE",
      date: new Date(),
      userId: "outro-usuario",
      categoryId: null,
    });

    const { transactions } = await listTransactionUseCase.execute({ userId: "1a" });

    expect(transactions).toHaveLength(2);
    expect(transactions.map((transaction) => transaction.name)).toEqual(
      expect.arrayContaining(["Mercado", "Salário"]),
    );
  });

  it("should return an empty list when the user has no transactions", async () => {
    const { transactions } = await listTransactionUseCase.execute({
      userId: "sem-transacoes",
    });

    expect(transactions).toEqual([]);
  });
});
