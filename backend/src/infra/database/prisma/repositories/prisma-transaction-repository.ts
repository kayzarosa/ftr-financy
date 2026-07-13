import type { Transaction } from "@/domain/entities/transaction.js";
import type { ITransactionRepository } from "@/domain/repositories/transaction-repository.js";
import { prisma } from "../prisma.js";

export class PrismaTransactionRepository implements ITransactionRepository {
  async create(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
    return await prisma.transaction.create({ data });
  }

  async update(
    id: string,
    data: Partial<Pick<Transaction, "name" | "value" | "type" | "date" | "categoryId">>,
  ): Promise<Transaction> {
    return await prisma.transaction.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }

  async findManyByUserId(userId: string): Promise<Transaction[]> {
    return await prisma.transaction.findMany({ where: { userId } });
  }

  async findById(id: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({ where: { id } });
  }
}
