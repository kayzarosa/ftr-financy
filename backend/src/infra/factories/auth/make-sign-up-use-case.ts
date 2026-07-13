import { PrismaRefreshTokenRepository } from "@/infra/database/prisma/repositories/prisma-refresh-token-repository.js";
import { PrismaUserRepository } from "@/infra/database/prisma/repositories/prisma-user-repository.js";
import { SignUpUseCase } from "@/use-cases/auth/sign-up.js";

export function makeSignUpUseCase(): SignUpUseCase {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new SignUpUseCase(userRepository, refreshTokenRepository);
}
