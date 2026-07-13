import { randomUUID } from "node:crypto";
import type { Transaction } from "@/domain/entities/transaction.js";
import type { ITransactionRepository } from "../transaction-repository.js";

export class InMemoryTransactionRepository implements ITransactionRepository {
  public transactions: Transaction[] = [];

  async create(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
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
    data: Partial<Pick<Transaction, "name" | "value" | "type" | "date" | "categoryId">>,
  ): Promise<Transaction> {
    const transactionIndex = this.transactions.findIndex((transaction) => transaction.id === id);
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
    this.transactions = this.transactions.filter((transaction) => transaction.id !== id);
  }

  async findManyByUserId(userId: string): Promise<Transaction[]> {
    return this.transactions.filter((transaction) => transaction.userId === userId);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((transaction) => transaction.id === id) ?? null;
  }
}
