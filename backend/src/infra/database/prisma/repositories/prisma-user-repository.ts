import type { User } from "@/domain/entities/user.js";
import type { IUserRepository } from "@/domain/repositories/user-repository.js";
import { prisma } from "@/infra/database/prisma/prisma.js";

export class PrismaUserRepository implements IUserRepository {
  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    return await prisma.user.create({ data });
  }

  async update(
    id: string,
    data: Partial<Pick<User, "name" | "email" | "password">>,
  ): Promise<void> {
    await prisma.user.update({ where: { id }, data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }
}
