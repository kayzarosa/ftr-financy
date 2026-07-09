import type { RefreshToken } from "../entities/refresh-token.js";

export interface IRefreshTokenRepository {
  create(data: Omit<RefreshToken, "id" | "createdAt">): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  delete(id: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
}
