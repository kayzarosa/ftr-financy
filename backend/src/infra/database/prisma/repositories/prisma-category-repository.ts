import type { Category } from "@/domain/entities/category.js";
import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import { prisma } from "../prisma.js";

export class PrismaCategoryRepository implements ICategoryRepository {
  async create(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
    return await prisma.category.create({ data });
  }

  async update(id: string, data: { name?: string; color?: string | null }): Promise<Category> {
    return await prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async findManyByUserId(userId: string): Promise<Category[]> {
    return await prisma.category.findMany({ where: { userId } });
  }

  async findById(id: string): Promise<Category | null> {
    return (await prisma.category.findUnique({ where: { id } })) ?? null;
  }

  async findByNameAndUserId(userId: string, name: string): Promise<Category | null> {
    return (
      (await prisma.category.findUnique({
        where: { userId_name: { userId, name } },
      })) ?? null
    );
  }
}
