import { PrismaRefreshTokenRepository } from "@/infra/database/prisma/repositories/prisma-refresh-token-repository.js";
import { LogoutUseCase } from "@/use-cases/auth/logout.js";

export function makeLogoutUseCase(): LogoutUseCase {
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new LogoutUseCase(refreshTokenRepository);
}
