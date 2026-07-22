import type {
  Category,
  CategorySpending,
  CategoryWithUsageCount,
} from "@/domain/entities/category.js";
import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { prisma } from "../prisma.js";
import { getMonthRange } from "@/domain/utils/get-month-range.js";

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
      color?: string;
      description?: string | null;
      icon?: string;
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

  async findSpendingByMonth(
    userId: string,
    month: string,
  ): Promise<CategorySpending[]> {
    const { start, end } = getMonthRange(month);

    const grouped = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        categoryId: { not: null },
        date: { gte: start, lt: end },
      },
      _sum: { value: true },
      _count: { _all: true },
      orderBy: { _sum: { value: "desc" } },
    });

    const categoryIds = grouped
      .map((g) => g.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryById = new Map(categories.map((c) => [c.id, c]));

    return grouped.flatMap((g) => {
      const category = g.categoryId
        ? categoryById.get(g.categoryId)
        : undefined;
      if (!category) return [];

      return [
        {
          id: category.id,
          name: category.name,
          color: category.color,
          icon: category.icon,
          total: g._sum.value ?? 0,
          count: g._count._all,
        },
      ];
    });
  }
}
