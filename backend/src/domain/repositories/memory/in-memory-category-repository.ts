import { randomUUID } from "node:crypto";
import type {
  Category,
  CategorySpending,
  CategoryWithUsageCount,
} from "@/domain/entities/category.js";
import type { ICategoryRepository } from "../category-repository.js";
import { InMemoryTransactionRepository } from "./in-memory-transaction-repository.js";
import { getMonthRange } from "@/domain/utils/get-month-range.js";

export class InMemoryCategoryRepository implements ICategoryRepository {
  public categories: Category[] = [];

  constructor(
    private transactionRepository: InMemoryTransactionRepository = new InMemoryTransactionRepository(),
  ) {}

  async create(
    data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): Promise<Category> {
    const category: Category = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.categories.push(category);

    return category;
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
    const categoryIndex = this.categories.findIndex(
      (category) => category.id === id,
    );
    const existsCategory = this.categories[categoryIndex];

    if (!existsCategory) {
      throw new Error("Category not exists");
    }

    const category: Category = {
      ...existsCategory,
      ...data,
      updatedAt: new Date(),
    };

    this.categories[categoryIndex] = category;

    return category;
  }

  async delete(id: string): Promise<void> {
    this.categories = this.categories.filter((category) => category.id !== id);
  }

  async findManyByUserId(userId: string): Promise<Category[]> {
    return this.categories.filter((category) => category.userId === userId);
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find((category) => category.id === id) ?? null;
  }

  async findByNameAndUserId(
    userId: string,
    name: string,
  ): Promise<Category | null> {
    return (
      this.categories.find(
        (category) => category.userId === userId && category.name === name,
      ) ?? null
    );
  }

  async findManyByUserIdCountTransactions(
    userId: string,
  ): Promise<CategoryWithUsageCount[]> {
    const categories = this.categories.filter(
      (category) => category.userId === userId,
    );

    const categoriesWithUsageCount = categories.map((category) => {
      const transactionsCount = this.transactionRepository.transactions.filter(
        (transaction) => transaction.categoryId === category.id,
      ).length;

      return { ...category, transactionsCount };
    });

    return categoriesWithUsageCount.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async findSpendingByMonth(
    userId: string,
    month: string,
  ): Promise<CategorySpending[]> {
    const { start, end } = getMonthRange(month);

    const categories = this.categories.filter((c) => c.userId === userId);

    return categories
      .map((category) => {
        const expenses = this.transactionRepository.transactions.filter(
          (t) =>
            t.categoryId === category.id &&
            t.type === "EXPENSE" &&
            t.date >= start &&
            t.date < end,
        );

        return {
          id: category.id,
          name: category.name,
          color: category.color,
          icon: category.icon,
          total: expenses.reduce((acc, t) => acc + t.value, 0),
          count: expenses.length,
        };
      })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.total - a.total);
  }
}
