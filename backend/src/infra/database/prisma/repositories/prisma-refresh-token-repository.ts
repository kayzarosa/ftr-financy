import type { RefreshToken } from "@/domain/entities/refresh-token.js";
import type { IRefreshTokenRepository } from "@/domain/repositories/refresh-token-repository.js";
import { prisma } from "../prisma.js";

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: Omit<RefreshToken, "id" | "createdAt">): Promise<RefreshToken> {
    return await prisma.refreshToken.create({ data });
  }

  async delete(id: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { id } });
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return await prisma.refreshToken.findUnique({ where: { token } });
  }
}
