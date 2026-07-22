import type { Transaction } from "@/domain/entities/transaction.js";
import type {
  ITransactionRepository,
  ListTransactionsParams,
  SummaryByUserId,
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
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
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

  async getSummaryByUserId(
    userId: string,
    month?: string,
  ): Promise<SummaryByUserId> {
    let dateRange;
    if (month) {
      const { start, end } = getMonthRange(month);
      dateRange = { gte: start, lt: end };
    }

    const [allTime, byMonth] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { value: true },
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        where: { userId, ...(dateRange && { date: dateRange }) },
        _sum: { value: true },
      }),
    ]);

    const sumOf = (groups: typeof allTime, type: "INCOME" | "EXPENSE") =>
      groups.find((g) => g.type === type)?._sum.value ?? 0;

    const balance = sumOf(allTime, "INCOME") - sumOf(allTime, "EXPENSE");
    const income = sumOf(byMonth, "INCOME");
    const expense = sumOf(byMonth, "EXPENSE");

    return { balance, income, expense };
  }
}
