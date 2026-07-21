import { randomUUID } from "node:crypto";
import type { Transaction } from "@/domain/entities/transaction.js";
import type { ITransactionRepository, ListTransactionsParams } from "../transaction-repository.js";
import { getMonthRange } from "@/domain/utils/get-month-range.js";

export class InMemoryTransactionRepository implements ITransactionRepository {
  public transactions: Transaction[] = [];

  async create(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    const transaction: Transaction = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.transactions.push(transaction);

    return transaction;
  }

  async update(
    id: string,
    data: Partial<
      Pick<Transaction, "name" | "value" | "type" | "date" | "categoryId">
    >,
  ): Promise<Transaction> {
    const transactionIndex = this.transactions.findIndex(
      (transaction) => transaction.id === id,
    );
    const transaction = this.transactions[transactionIndex];

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const updateTransaction: Transaction = {
      ...transaction,
      ...data,
      updatedAt: new Date(),
    };

    this.transactions[transactionIndex] = updateTransaction;

    return updateTransaction;
  }

  async delete(id: string): Promise<void> {
    this.transactions = this.transactions.filter(
      (transaction) => transaction.id !== id,
    );
  }

  async findManyByUserId(
    userId: string,
    params: ListTransactionsParams,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    let filtered = this.transactions.filter((t) => t.userId === userId);

    if (params.type) filtered = filtered.filter((t) => t.type === params.type);
    if (params.categoryId)
      filtered = filtered.filter((t) => t.categoryId === params.categoryId);

    if (params.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter((t) => t.name.toLowerCase().includes(term));
    }

    if (params.month) {
      const { start, end } = getMonthRange(params.month);

      filtered = filtered.filter((t) => t.date >= start && t.date < end);
    }

    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    const total = filtered.length;
    const transactions = filtered.slice(
      (params.page - 1) * params.limit,
      params.page * params.limit,
    );

    return { transactions, total };
  }

  async findById(id: string): Promise<Transaction | null> {
    return (
      this.transactions.find((transaction) => transaction.id === id) ?? null
    );
  }
}
