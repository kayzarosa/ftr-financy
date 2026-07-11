import { SignUpUseCase } from "@/use-cases/auth/sign-up.js";
import { PrismaRefreshTokenRepository } from "../database/prisma/repositories/prisma-refresh-token-repository.js";
import { PrismaUserRepository } from "../database/prisma/repositories/prisma-user-repository.js";

export function makeSignUpUseCase(): SignUpUseCase {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();

  return new SignUpUseCase(userRepository, refreshTokenRepository);
}
