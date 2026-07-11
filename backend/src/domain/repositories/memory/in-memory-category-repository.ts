import { randomUUID } from "node:crypto";
import type { Category } from "@/domain/entities/category.js";
import type { ICategoryRepository } from "../category-repository.js";

export class InMemoryCategoryRepository implements ICategoryRepository {
  public categories: Category[] = [];

  async create(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
    const category: Category = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.categories.push(category);

    return category;
  }

  async update(data: Omit<Category, "createdAt" | "updatedAt">): Promise<Category> {
    const categoryIndex = this.categories.findIndex((category) => category.id === data.id);
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

  async getList(): Promise<Category[] | null> {
    return this.categories;
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find((category) => category.id === id) ?? null;
  }
}
