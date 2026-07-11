import { PrismaRefreshTokenRepository } from "@/infra/database/prisma/repositories/prisma-refresh-token-repository.js";
import { PrismaUserRepository } from "@/infra/database/prisma/repositories/prisma-user-repository.js";
import { RefreshTokenUseCase } from "@/use-cases/auth/refresh-token.js";

export function makeRefreshTokenUseCase(): RefreshTokenUseCase {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new RefreshTokenUseCase(userRepository, refreshTokenRepository);
}
