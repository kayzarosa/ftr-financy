import { PrismaRefreshTokenRepository } from "@/infra/database/prisma/repositories/prisma-refresh-token-repository.js";
import { PrismaUserRepository } from "@/infra/database/prisma/repositories/prisma-user-repository.js";
import { UpdatePasswordUseCase } from "@/use-cases/user/update-password.js";

export function makeUpdatePasswordUseCase(): UpdatePasswordUseCase {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new UpdatePasswordUseCase(userRepository, refreshTokenRepository);
}
