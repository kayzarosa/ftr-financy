import type { Transaction } from "@/domain/entities/transaction.js";
import type {
  ITransactionRepository,
  ListTransactionsParams,
} from "@/domain/repositories/transaction-repository.js";
import { prisma } from "../prisma.js";
import { getMonthRange } from "@/domain/utils/get-month-range.js";

export class PrismaTransactionRepository implements ITransactionRepository {
  async create(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    return await prisma.transaction.create({ data });
  }

  async update(
    id: string,
    data: Partial<
      Pick<Transaction, "name" | "value" | "type" | "date" | "categoryId">
    >,
  ): Promise<Transaction> {
    return await prisma.transaction.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }

  async findManyByUserId(
    userId: string,
    params: ListTransactionsParams,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const { limit, page, categoryId, month, search, type } = params;

    let dateRange;
    if (month) {
      const { start, end } = getMonthRange(month);
      dateRange = { gte: start, lt: end };
    }

    const where = {
      userId,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(search && { name: { contains: search } }),
      ...(dateRange && { date: dateRange }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  async findById(id: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({ where: { id } });
  }
}
