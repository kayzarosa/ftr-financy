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

  async update(id: string, data: { name?: string; color?: string | null }): Promise<Category> {
    const categoryIndex = this.categories.findIndex((category) => category.id === id);
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

  async findByNameAndUserId(userId: string, name: string): Promise<Category | null> {
    return (
      this.categories.find((category) => category.userId === userId && category.name === name) ??
      null
    );
  }
}
