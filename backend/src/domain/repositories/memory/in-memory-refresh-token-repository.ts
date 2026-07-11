import { randomUUID } from "node:crypto";
import type { RefreshToken } from "@/domain/entities/refresh-token.js";
import type { IRefreshTokenRepository } from "../refresh-token-repository.js";

export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  public refreshTokens: RefreshToken[] = [];

  async create(data: Omit<RefreshToken, "id" | "createdAt">): Promise<RefreshToken> {
    const refreshToken: RefreshToken = {
      id: randomUUID(),
      createdAt: new Date(),
      ...data,
    };

    this.refreshTokens.push(refreshToken);

    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokens.find((refreshToken) => refreshToken.token === token) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter((refreshToken) => refreshToken.id !== id);
  }

  async deleteByToken(token: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter((refreshToken) => refreshToken.token !== token);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.userId !== userId,
    );
  }
}
