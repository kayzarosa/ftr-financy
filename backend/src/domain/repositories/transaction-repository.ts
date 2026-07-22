import type { Transaction } from "@/domain/entities/transaction.js";
import type { TransactionType } from "@/generated/prisma/enums.js";

export type ListTransactionsParams = {
  page: number;
  limit: number;
  type?: TransactionType | undefined;
  categoryId?: string | undefined;
  search?: string | undefined;
  month?: string | undefined;
};

export type SummaryByUserId = {
  balance: number;
  income: number;
  expense: number;
};

export interface ITransactionRepository {
  create(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction>;
  update(
    id: string,
    data: Partial<
      Pick<Transaction, "name" | "value" | "type" | "date" | "categoryId">
    >,
  ): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findManyByUserId(
    userId: string,
    params: ListTransactionsParams,
  ): Promise<{ transactions: Transaction[]; total: number }>;
  findById(id: string): Promise<Transaction | null>;
  getSummaryByUserId(userId: string, month?: string): Promise<SummaryByUserId>;
}
