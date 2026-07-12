export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  name: string;
  value: number;
  type: TransactionType;
  date: Date;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}