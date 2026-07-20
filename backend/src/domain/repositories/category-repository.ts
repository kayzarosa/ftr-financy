import type {
  Category,
  CategoryWithUsageCount,
} from "@/domain/entities/category.js";

export interface ICategoryRepository {
  create(
    data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): Promise<Category>;
  update(
    id: string,
    data: {
      name?: string;
      color?: string;
      description?: string | null;
      icon?: string;
    },
  ): Promise<Category>;
  delete(id: string): Promise<void>;
  findManyByUserId(userId: string): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByNameAndUserId(userId: string, name: string): Promise<Category | null>;
  findManyByUserIdCountTransactions(
    userId: string,
  ): Promise<CategoryWithUsageCount[]>;
}
