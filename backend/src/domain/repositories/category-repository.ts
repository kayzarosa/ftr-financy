import type { Category } from "@/domain/entities/category.js";

export interface ICategoryRepository {
  create(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category>;
  update(id: string, data: Partial<Pick<Category, "name" | "color">>): Promise<Category>;
  delete(id: string): Promise<void>;
  findManyByUserId(userId: string): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByNameAndUserId(userId: string, name: string): Promise<Category | null>;
}
