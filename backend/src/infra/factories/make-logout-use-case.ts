import { LogoutUseCase } from "@/use-cases/auth/logout.js";
import { PrismaRefreshTokenRepository } from "../database/prisma/repositories/prisma-refresh-token-repository.js";

export function makeLogoutUseCase(): LogoutUseCase {
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new LogoutUseCase(refreshTokenRepository);
}
