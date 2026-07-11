import type { Category } from "@/domain/entities/category.js";
import type { ICategoryRepository } from "@/domain/repositories/category-repository.js";
import type { Category as PrismaCategory } from "@/generated/prisma/client.js";
import { prisma } from "../prisma.js";

function toDomain({ color, ...rest }: PrismaCategory): Category {
  return {
    ...rest,
    ...(color !== null && { color }),
  };
}

export class PrismaCategoryRepository implements ICategoryRepository {
  async create(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
    const category = await prisma.category.create({ data });
    return toDomain(category);
  }

  async update(id: string, data: Partial<Pick<Category, "name" | "color">>): Promise<Category> {
    const category = await prisma.category.update({ where: { id }, data });

    return toDomain(category);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async findManyByUserId(userId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({ where: { userId } });
    return categories.map(toDomain);
  }

  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({ where: { id } });
    return category ? toDomain(category) : null;
  }

  async findByNameAndUserId(userId: string, name: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { userId_name: { userId, name } },
    });

    return category ? toDomain(category) : null;
  }
}
