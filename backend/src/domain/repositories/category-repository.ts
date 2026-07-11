import type { Category } from "@/domain/entities/category.js";

export interface ICategoryRepository {
  create(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category>;
  update(data: Omit<Category, "createdAt" | "updatedAt">): Promise<Category>;
  delete(id: string): Promise<void>;
  getList(): Promise<Category[] | null>;
  findById(id: string): Promise<Category | null>;
}
