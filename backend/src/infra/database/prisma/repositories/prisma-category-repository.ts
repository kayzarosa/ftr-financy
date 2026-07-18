import type {
  Category,
  CategoryWithUsageCount,
} from "@/domain/entities/category.js";
import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { prisma } from "../prisma.js";

export class PrismaCategoryRepository implements ICategoryRepository {
  async create(
    data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): Promise<Category> {
    return await prisma.category.create({ data });
  }

  async update(
    id: string,
    data: {
      name?: string;
      color?: string | null;
      description?: string | null;
      icon?: string | null;
    },
  ): Promise<Category> {
    return await prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async findManyByUserId(userId: string): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return (await prisma.category.findUnique({ where: { id } })) ?? null;
  }

  async findByNameAndUserId(
    userId: string,
    name: string,
  ): Promise<Category | null> {
    return (
      (await prisma.category.findUnique({
        where: { userId_name: { userId, name } },
      })) ?? null
    );
  }

  async findManyByUserIdCountTransactions(
    userId: string,
  ): Promise<CategoryWithUsageCount[]> {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: { _count: { select: { transactions: true } } },
      orderBy: { name: "asc" },
    });

    return categories.map(({ _count, ...category }) => ({
      ...category,
      transactionsCount: _count.transactions,
    }));
  }
}
