import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTransactionRepository } from "@/domain/repositories/memory/in-memory-transaction-repository.js";
import { ListTransactionUseCase } from "./list-transaction.js";

type CreateInput = Parameters<InMemoryTransactionRepository["create"]>[0];

describe("ListTransactionUseCase", () => {
  let transactionRepository: InMemoryTransactionRepository;
  let listTransactionUseCase: ListTransactionUseCase;

  const baseParams = { page: 1, limit: 10 };

  function createTransaction(overrides: Partial<CreateInput> = {}) {
    return transactionRepository.create({
      name: "Transação",
      value: 1000,
      type: "EXPENSE",
      date: new Date(),
      userId: "user-1",
      categoryId: null,
      ...overrides,
    });
  }

  beforeEach(() => {
    transactionRepository = new InMemoryTransactionRepository();
    listTransactionUseCase = new ListTransactionUseCase(transactionRepository);
  });

  it("should list only the transactions owned by the given user", async () => {
    await createTransaction({ name: "Mercado", userId: "user-1" });
    await createTransaction({ name: "Salário", type: "INCOME", userId: "user-1" });
    await createTransaction({ name: "Outro dono", userId: "outro-usuario" });

    const { transactions, total } = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { ...baseParams },
    });

    expect(transactions).toHaveLength(2);
    expect(total).toBe(2);
    expect(transactions.map((transaction) => transaction.name)).toEqual(
      expect.arrayContaining(["Mercado", "Salário"]),
    );
  });

  it("should return an empty list and zero total when the user has no transactions", async () => {
    const { transactions, total } = await listTransactionUseCase.execute({
      userId: "sem-transacoes",
      params: { ...baseParams },
    });

    expect(transactions).toEqual([]);
    expect(total).toBe(0);
  });

  it("should paginate while reporting the full filtered total", async () => {
    await createTransaction({ name: "A", date: new Date(2025, 0, 1) });
    await createTransaction({ name: "B", date: new Date(2025, 1, 1) });
    await createTransaction({ name: "C", date: new Date(2025, 2, 1) });

    const firstPage = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { page: 1, limit: 2 },
    });

    expect(firstPage.transactions).toHaveLength(2);
    expect(firstPage.total).toBe(3);

    const secondPage = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { page: 2, limit: 2 },
    });

    expect(secondPage.transactions).toHaveLength(1);
    expect(secondPage.total).toBe(3);
  });

  it("should order transactions by date descending", async () => {
    await createTransaction({ name: "Antiga", date: new Date(2025, 0, 1) });
    await createTransaction({ name: "Recente", date: new Date(2025, 11, 1) });
    await createTransaction({ name: "Meio", date: new Date(2025, 5, 1) });

    const { transactions } = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { ...baseParams },
    });

    expect(transactions.map((transaction) => transaction.name)).toEqual([
      "Recente",
      "Meio",
      "Antiga",
    ]);
  });

  it("should filter by type", async () => {
    await createTransaction({ name: "Salário", type: "INCOME" });
    await createTransaction({ name: "Mercado", type: "EXPENSE" });

    const { transactions, total } = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { ...baseParams, type: "EXPENSE" },
    });

    expect(total).toBe(1);
    expect(transactions[0]?.name).toBe("Mercado");
  });

  it("should filter by categoryId", async () => {
    await createTransaction({ name: "Alimentação", categoryId: "cat-1" });
    await createTransaction({ name: "Transporte", categoryId: "cat-2" });

    const { transactions, total } = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { ...baseParams, categoryId: "cat-1" },
    });

    expect(total).toBe(1);
    expect(transactions[0]?.name).toBe("Alimentação");
  });

  it("should filter by name search case-insensitively", async () => {
    await createTransaction({ name: "Jantar no restaurante" });
    await createTransaction({ name: "Mercado" });

    const { transactions, total } = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { ...baseParams, search: "jant" },
    });

    expect(total).toBe(1);
    expect(transactions[0]?.name).toBe("Jantar no restaurante");
  });

  it("should filter by month", async () => {
    await createTransaction({ name: "Novembro", date: new Date(2025, 10, 15) });
    await createTransaction({ name: "Outubro", date: new Date(2025, 9, 15) });

    const { transactions, total } = await listTransactionUseCase.execute({
      userId: "user-1",
      params: { ...baseParams, month: "2025-11" },
    });

    expect(total).toBe(1);
    expect(transactions[0]?.name).toBe("Novembro");
  });
});
