import type { Transaction } from "@/domain/entities/transaction.js";

export interface ITransactionRepository {
  create(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction>;
  update(
    id: string,
    data: Partial<Pick<Transaction, "name" | "value" | "type" | "date" | "categoryId">>,
  ): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findManyByUserId(userId: string): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
}
